import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from './Sidebar'
import NotebookEditor from './NotebookEditor'
import TodoList from './TodoList'
const NotebookManager = require('../services/NotebookManager')

const App = () => {
  const [currentView, setCurrentView] = useState('notebooks')
  const [notebooks, setNotebooks] = useState([])
  const [currentNotebook, setCurrentNotebook] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // 使用 useMemo 确保管理器实例不会重复创建
  const notebookManager = useMemo(() => new NotebookManager(), [])

  useEffect(() => {
    loadNotebooks()
  }, [])

  const loadNotebooks = async () => {
    setLoading(true)
    try {
      const notebookList = await notebookManager.getAllNotebooks()
      setNotebooks(notebookList)
    } catch (error) {
      console.error('Failed to load notebooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotebook = async () => {
    try {
      const newNotebook = await notebookManager.createNotebook()
      setNotebooks([newNotebook, ...notebooks])
      setCurrentNotebook(newNotebook)
      setCurrentView('editor')
    } catch (error) {
      console.error('Failed to create notebook:', error)
    }
  }

  const handleSelectNotebook = (notebook) => {
    setCurrentNotebook(notebook)
    setCurrentView('editor')
  }

  const handleSaveNotebook = async (notebook) => {
    try {
      const savedNotebook = await notebookManager.saveNotebook(notebook)
      const updatedNotebooks = notebooks.map(nb => 
        nb.id === savedNotebook.id ? savedNotebook : nb
      )
      setNotebooks(updatedNotebooks)
      setCurrentNotebook(savedNotebook)
    } catch (error) {
      console.error('Failed to save notebook:', error)
    }
  }

  const handleDeleteNotebook = async (id) => {
    if (window.confirm('确定要删除这个笔记本吗？')) {
      try {
        await notebookManager.deleteNotebook(id)
        const updatedNotebooks = notebooks.filter(nb => nb.id !== id)
        setNotebooks(updatedNotebooks)
        if (currentNotebook && currentNotebook.id === id) {
          setCurrentNotebook(null)
          setCurrentView('notebooks')
        }
      } catch (error) {
        console.error('Failed to delete notebook:', error)
      }
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.trim()) {
      try {
        const results = await notebookManager.searchNotebooks(query)
        setNotebooks(results)
      } catch (error) {
        console.error('Failed to search notebooks:', error)
      }
    } else {
      loadNotebooks()
    }
  }

  const filteredNotebooks = searchQuery 
    ? notebooks
    : notebooks

  return (
    <div className="app poi-plugin vertical-layout">
      <div className="main-content">

        <div className="action-bar">
          <button 
            className="btn btn-primary btn-medium"
            onClick={() => setCurrentView('leveling')}
            title="练级任务"
          >
            ⏫️ 练级
          </button>
          <button 
            className="btn btn-primary btn-medium"
            onClick={() => setCurrentView('farming')}
            title="捞船任务"
          >
            🚢 捞船
          </button>
          <button 
            className="btn btn-primary btn-medium"
            onClick={() => setCurrentView('upgrade')}
            title="改修任务"
          >
            🛠️ 改修
          </button>
          <button 
            className="btn btn-primary btn-medium"
            onClick={() => setCurrentView('notebooks')}
            title="笔记本"
          >
            📝 笔记
          </button>
        </div>

        {currentView === 'notebooks' && (
          <div className="notebooks-section">
            <div className="search-and-add-bar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 搜索笔记本..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              <button 
                className="btn btn-primary btn-medium"
                onClick={handleCreateNotebook}
                title="创建新笔记本"
              >
                ➕ 新建
              </button>
            </div>
            <div className="notebooks-list">
            {loading ? (
              <div className="loading">⏳ 加载中...</div>
            ) : filteredNotebooks.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? '😔 没有找到匹配的笔记本' : '📝 还没有笔记本，点击新建笔记按钮开始吧！'}
              </div>
            ) : (
              filteredNotebooks.map(notebook => (
              <div 
                key={notebook.id} 
                className="notebook-item"
                onClick={() => handleSelectNotebook(notebook)}
              >
                <div className="notebook-title">📄 {notebook.title}</div>
                <div className="notebook-preview">
                  {notebook.content.substring(0, 40)}...
                </div>
                <div className="notebook-actions">
                  <span className="notebook-date">
                    📅 {new Date(notebook.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotebook(notebook.id)
                    }}
                    title="删除笔记本"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              ))
            )}
            </div>
          </div>
        )}

        {currentView === 'editor' && currentNotebook && (
          <div className="editor-section">
            <NotebookEditor
              notebook={currentNotebook}
              onSave={handleSaveNotebook}
              onBack={() => setCurrentView('notebooks')}
            />
          </div>
        )}

        {currentView === 'leveling' && (
          <div className="todolist-section">
            <TodoList
              type="leveling"
              title="⚡ 练级任务"
            />
          </div>
        )}

        {currentView === 'farming' && (
          <div className="todolist-section">
            <TodoList
              type="farming"
              title="🚢 捞船任务"
            />
          </div>
        )}

        {currentView === 'upgrade' && (
          <div className="todolist-section">
            <TodoList
              type="upgrade"
              title="🔧 改修任务"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App