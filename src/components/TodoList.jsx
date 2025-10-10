import React, { useState, useEffect } from 'react'

const TodoList = ({ onBack }) => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all') // all, active, completed

  // 从localStorage加载todos
  useEffect(() => {
    const savedTodos = localStorage.getItem('kanote-todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // 保存todos到localStorage
  useEffect(() => {
    localStorage.setItem('kanote-todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      }
      setTodos([todo, ...todos])
      setNewTodo('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const editTodo = (id, newText) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ))
  }

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed))
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter(todo => !todo.completed).length
  const completedCount = todos.filter(todo => todo.completed).length

  return (
    <div className="todolist-container">
      <div className="todolist-header">
        <button className="back-btn" onClick={onBack}>
          🔙 返回
        </button>
        <h1>✅ 待办事项</h1>
        <div className="todo-stats">
          📋 总计: {todos.length} | ⏳ 进行中: {activeCount} | ✅ 已完成: {completedCount}
        </div>
      </div>

      <div className="todo-input-section">
        <div className="todo-input-container">
          <input
            type="text"
            className="todo-input"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="📝 添加新的待办事项..."
          />
          <button 
            className="add-todo-btn"
            onClick={addTodo}
            disabled={!newTodo.trim()}
          >
            ➕ 添加
          </button>
        </div>
      </div>

      <div className="todo-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          📋 全部 ({todos.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          ⏳ 进行中 ({activeCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          ✅ 已完成 ({completedCount})
        </button>
        {completedCount > 0 && (
          <button 
            className="clear-btn"
            onClick={clearCompleted}
          >
            🗑️ 清除已完成
          </button>
        )}
      </div>

      <div className="todos-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            {filter === 'all' && '📝 还没有待办事项，添加一个开始吧！'}
            {filter === 'active' && '🎉 没有进行中的待办事项！'}
            {filter === 'completed' && '📋 还没有完成的待办事项。'}
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))
        )}
      </div>
    </div>
  )
}

const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)

  const handleSave = () => {
    if (editText.trim() && editText !== todo.text) {
      onEdit(todo.id, editText.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(todo.text)
    setIsEditing(false)
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
      </div>
      
      <div className="todo-content">
        {isEditing ? (
          <div className="todo-edit">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
              onBlur={handleSave}
              autoFocus
              className="todo-edit-input"
            />
          </div>
        ) : (
          <div 
            className="todo-text"
            onDoubleClick={() => setIsEditing(true)}
            title="双击编辑"
          >
            {todo.text}
          </div>
        )}
        
        <div className="todo-date">
          🕒 {new Date(todo.createdAt).toLocaleDateString()}
        </div>
      </div>
      
      <div className="todo-actions">
        {!isEditing && (
          <>
            <button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
              title="编辑"
            >
              ✏️
            </button>
            <button
              className="delete-btn"
              onClick={() => onDelete(todo.id)}
              title="删除"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default TodoList