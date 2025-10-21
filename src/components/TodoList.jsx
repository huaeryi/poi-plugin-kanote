import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ShipSelector from './ShipSelector'
import AllShipSelector from './AllShipSelector'
import shipDataService from '../services/ShipDataService'

const TodoList = ({ type = 'general', title = '📋 任务列表' }) => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('all') // all, active, completed
  
  // 练级专用字段
  const [selectedShip, setSelectedShip] = useState(null)
  const [targetLevel, setTargetLevel] = useState('')

  // 为每个类型使用不同的localStorage键
  const storageKey = `kanote-todos-${type}`
  
  // 是否是练级类型
  const isLevelingType = type === 'leveling'
  // 是否是捞船类型  
  const isFarmingType = type === 'farming'
  // 是否需要舰娘选择器
  const needsShipSelector = isLevelingType || isFarmingType

  // 初始化ShipDataService
  useEffect(() => {
    if ((isLevelingType || isFarmingType) && !shipDataService.isAvailable()) {
      shipDataService.init()
    }
  }, [isLevelingType, isFarmingType])

  // 从localStorage加载todos
  useEffect(() => {
    const savedTodos = localStorage.getItem(storageKey)
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos)
        // 归一化 completed 字段，处理 'true'/'false', 1/'1' 等情况
        const normalized = parsed.map(t => ({
          ...t,
          completed: Boolean(
            t.completed === true ||
            t.completed === 'true' ||
            t.completed === 1 ||
            t.completed === '1'
          )
        }))
        setTodos(normalized)
      } catch (e) {
        console.error('Failed to parse saved todos', e)
        setTodos([])
      }
    }
  }, [storageKey])

  // 保存todos到localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(todos))
  }, [todos, storageKey])

  // 检查练级任务是否自动完成
  useEffect(() => {
    if (!isLevelingType || todos.length === 0) return

    const checkLevelingCompletion = () => {
      let hasUpdates = false
      const updatedTodos = todos.map(todo => {
        if (todo.shipId && !todo.completed) {
          try {
            const currentShip = shipDataService.getShipById(todo.shipId)
            if (currentShip && currentShip.api_lv >= todo.targetLevel) {
              hasUpdates = true
              return { ...todo, completed: true }
            }
          } catch (error) {
            console.error('检查舰娘等级失败:', error)
          }
        }
        return todo
      })
      
      if (hasUpdates) {
        setTodos(updatedTodos)
      }
    }

    // 延迟执行避免无限循环
    const timeoutId = setTimeout(checkLevelingCompletion, 100)
    return () => clearTimeout(timeoutId)
  }, [isLevelingType]) // 只在类型改变时触发

  // 定期检查练级完成状态（每30秒）
  useEffect(() => {
    if (!isLevelingType) return

    const intervalId = setInterval(() => {
      if (todos.some(todo => todo.shipId && !todo.completed)) {
        // 只有有未完成的练级任务时才检查
        setTodos(prevTodos => {
          let hasUpdates = false
          const updatedTodos = prevTodos.map(todo => {
            if (todo.shipId && !todo.completed) {
              try {
                const currentShip = shipDataService.getShipById(todo.shipId)
                if (currentShip && currentShip.api_lv >= todo.targetLevel) {
                  hasUpdates = true
                  return { ...todo, completed: true }
                }
              } catch (error) {
                console.error('检查舰娘等级失败:', error)
              }
            }
            return todo
          })
          
          return hasUpdates ? updatedTodos : prevTodos
        })
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isLevelingType, todos.length])

  const addTodo = () => {
    // 练级类型需要选择舰娘和目标等级
    if (isLevelingType && !selectedShip) {
      alert('请先选择舰娘')
      return
    }
    
    if (isLevelingType && !targetLevel) {
      alert('请输入目标等级')
      return
    }

    // 捞船类型需要选择舰娘
    if (isFarmingType && !selectedShip) {
      alert('请先选择要捞的舰娘')
      return
    }
    
    // 普通类型需要文本内容
    if (!needsShipSelector && !newTodo.trim()) {
      return
    }
    
    const todo = {
      id: Date.now(),
      text: needsShipSelector 
        ? (isLevelingType 
          ? `${selectedShip.shipName} ${selectedShip.currentLevel} → ${targetLevel}` 
          : `捞船: ${selectedShip.shipName}`)
        : newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      // 舰娘相关字段
      ...(needsShipSelector && {
        shipId: selectedShip.shipId,
        shipName: selectedShip.shipName,
        // 练级类型才有当前等级和目标等级
        ...(isLevelingType && selectedShip.currentLevel !== undefined && {
          currentLevel: selectedShip.currentLevel,
          targetLevel: parseInt(targetLevel)
        }),
        // 捞船类型记录是否已拥有
        ...(isFarmingType && {
          owned: selectedShip.owned
        })
      })
    }
    
    setTodos([todo, ...todos])
    setNewTodo('')
    handleShipSelect(null) // 使用处理函数清空选择和目标等级
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

  const editLevelingTodo = (id, newTargetLevel) => {
    setTodos(todos.map(todo => {
      if (todo.id === id && todo.shipName) {
        const updatedTodo = {
          ...todo,
          targetLevel: parseInt(newTargetLevel),
          text: `${todo.shipName} ${todo.currentLevel} → ${newTargetLevel}`
        }
        return updatedTodo
      }
      return todo
    }))
  }

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed))
  }

  // 处理舰娘选择，练级类型自动设置目标等级为当前等级+1
  const handleShipSelect = (shipData) => {
    if (shipData) {
      setSelectedShip(shipData)
      // 只有练级类型才需要设置目标等级
      if (isLevelingType && shipData.currentLevel !== undefined) {
        if (shipData.currentLevel >= 175) {
          setTargetLevel('175')
        } else {
          const targetLevel = Math.min(shipData.currentLevel + 1, 175)
          setTargetLevel(targetLevel.toString())
        }
      }
    } else {
      setSelectedShip(null)
      setTargetLevel('')
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter(todo => !todo.completed).length
  const completedCount = todos.filter(todo => todo.completed).length

  return (
    <>
      <div className="todolist-header-section">
        <div className="todolist-header">
          <h1>{title}</h1>
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
            ⏳ 进行 ({activeCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            ✅ 完成 ({completedCount})
          </button>
        </div>

        <div className="todo-input-section">
          <div className="todo-input-container">
            {needsShipSelector ? (
              <>
                {isLevelingType ? (
                  <ShipSelector onSelectShip={handleShipSelect} />
                ) : (
                  <AllShipSelector onSelectShip={handleShipSelect} />
                )}
                {isLevelingType && (
                  <input
                    type="number"
                    className="todo-input target-level-input"
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="🎯 目标等级"
                    min="1"
                    max="185"
                  />
                )}
              </>
            ) : (
              <input
                type="text"
                className="todo-input"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="📝 添加新的待办事项..."
              />
            )}
            <button 
              className="add-todo-btn"
              onClick={addTodo}
              disabled={needsShipSelector 
                ? (!selectedShip || (isLevelingType && !targetLevel)) 
                : !newTodo.trim()}
            >
              添加
            </button>
          </div>
        </div>
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
              onEditLeveling={editLevelingTodo}
              isLevelingType={isLevelingType}
            />
          ))
        )}
      </div>
    </>
  )
}

const TodoItem = ({ todo, onToggle, onDelete, onEdit, onEditLeveling, isLevelingType }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [editTargetLevel, setEditTargetLevel] = useState(todo.targetLevel || '')
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipTimer, setTooltipTimer] = useState(null)

  const isLevelingTodo = todo.shipName && todo.shipId && todo.targetLevel !== undefined
  const isFarmingTodo = todo.shipName && todo.shipId && todo.targetLevel === undefined
  const isShipTodo = isLevelingTodo || isFarmingTodo

  const handleSave = () => {
    if (isLevelingTodo && onEditLeveling) {
      if (editTargetLevel && parseInt(editTargetLevel) !== todo.targetLevel) {
        onEditLeveling(todo.id, editTargetLevel)
      }
    } else {
      if (editText.trim() && editText !== todo.text) {
        onEdit(todo.id, editText.trim())
      }
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(todo.text)
    setEditTargetLevel(todo.targetLevel || '')
    setIsEditing(false)
  }

  // 获取舰娘头像URL (如果有的话)
  const getShipAvatarUrl = () => {
    if (!isShipTodo) return null
    try {
      const ship = shipDataService.getShipById(todo.shipId)
      if (ship) {
        // poi的舰娘头像路径规则，这里是一个示例
        return `/assets/img/ship/${ship.api_ship_id}.png`
      }
    } catch (error) {
      console.error('获取舰娘头像失败:', error)
    }
    return null
  }

  // 获取舰娘详细信息
  const getShipDetails = () => {
    if (!isShipTodo) return null
    try {
      const ship = shipDataService.getShipById(todo.shipId)
      if (!ship) return null

      const shipName = shipDataService.getShipName(ship.api_ship_id)
      const shipType = shipDataService.getShipType(ship)
      
      const details = {
        name: shipName,
        type: shipType,
        level: ship.api_lv || 1,
        exp: ship.api_exp || 0,
        hp: ship.api_maxhp || 0,
        firepower: ship.api_karyoku ? ship.api_karyoku[0] : 0,
        torpedo: ship.api_raisou ? ship.api_raisou[0] : 0,
        aa: ship.api_taiku ? ship.api_taiku[0] : 0,
        armor: ship.api_soukou ? ship.api_soukou[0] : 0,
        luck: ship.api_lucky ? ship.api_lucky[0] : 0,
        speed: ship.api_soku || 0,
        range: ship.api_leng || 0,
        sally: ship.api_sally_area || 0
      }
      
      return details
    } catch (error) {
      console.error('获取舰娘详细信息失败:', error)
      return null
    }
  }

  // 处理鼠标悬停
  const handleMouseEnter = (e) => {
    if (!isShipTodo) return

    // 清除之前的定时器
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    }
    setTooltipPosition(position)

    // 延迟显示tooltip，避免频繁切换
    const timer = setTimeout(() => {
      console.log('TodoItem: 显示 tooltip, todo:', todo)
      setShowTooltip(true)
    }, 300)
    setTooltipTimer(timer)
  }

  const handleMouseLeave = () => {
    console.log('TodoItem: 隐藏 tooltip, todo:', todo)
    // 清除定时器
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
      setTooltipTimer(null)
    }
    setShowTooltip(false)
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (tooltipTimer) {
        clearTimeout(tooltipTimer)
      }
    }
  }, [tooltipTimer])

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isShipTodo ? 'ship-todo' : ''}`}
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}>
      {/* 左侧：舰娘头像区域 */}
      <div className="todo-avatar">
        {isShipTodo ? (
          <div className="ship-avatar">
            <img 
              src={getShipAvatarUrl()}
              alt={todo.shipName}
              className="ship-avatar-img"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div className="ship-avatar-placeholder" style={{display: 'none'}}>
              <span className="ship-id">{todo.shipId}</span>
            </div>
          </div>
        ) : (
          <div className="todo-icon">📝</div>
        )}
      </div>
      
      {/* 中间：内容区域 */}
      <div className="todo-content">
        {isEditing ? (
          <div className="todo-edit">
            {isLevelingTodo ? (
              <div className="leveling-edit">
                <div className="ship-name-display">{todo.shipName}</div>
                <div className="level-edit">
                  <span>Lv.{todo.currentLevel} → </span>
                  <input
                    type="number"
                    value={editTargetLevel}
                    onChange={(e) => setEditTargetLevel(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSave()
                      if (e.key === 'Escape') handleCancel()
                    }}
                    onBlur={handleSave}
                    autoFocus
                    className="target-level-edit"
                    min="1"
                    max="185"
                  />
                </div>
              </div>
            ) : (
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
            )}
          </div>
        ) : (
          <>
            <div 
              className="todo-text"
              onDoubleClick={() => setIsEditing(true)}
              title="双击编辑"
            >
              {isLevelingTodo ? (
                <div className="leveling-display">
                  <div className="ship-name">{todo.shipName}</div>
                  <div className="level-progress">
                    Lv.{todo.currentLevel} → Lv.{todo.targetLevel}
                    {todo.completed && <span className="completed-badge">✅ 已达成</span>}
                  </div>
                </div>
              ) : isFarmingTodo ? (
                <div className="farming-display">
                  <div className="ship-name">{todo.shipName}</div>
                  <div className="farming-status">
                    🚢 捞船目标
                    {!todo.owned && <span className="not-owned-badge">未获得</span>}
                    {todo.completed && <span className="completed-badge">✅ 已获得</span>}
                  </div>
                </div>
              ) : (
                todo.text
              )}
            </div>
            
            <div className="todo-date">
              🕒 {new Date(todo.createdAt).toLocaleDateString()}
            </div>
          </>
        )}
      </div>
      
      {/* 右侧：操作区域 */}
      <div className="todo-actions">
        {!isEditing && (
          <>
            <button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
              title={isLevelingTodo ? "编辑目标等级" : "编辑"}
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
        
        {/* Checkbox 移到最右边 */}
        <div className="todo-checkbox">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            title={todo.completed ? "标记为未完成" : "标记为完成"}
          />
        </div>
      </div>

      {/* 舰娘详细信息 Tooltip - 使用 Portal 渲染到 body 并包裹根类名，保证样式匹配 */}
      {showTooltip && isShipTodo && createPortal(
        <div className="poi-plugin-kanote">
          <ShipTooltip
            shipDetails={getShipDetails()}
            position={tooltipPosition}
          />
        </div>,
        document.body
      )}
    </div>
  )
}

// 舰娘详细信息 Tooltip 组件
const ShipTooltip = ({ shipDetails, position }) => {
  // 如果没有详情，也渲染一个占位 tooltip，便于调试位置/样式
  const isEmpty = !shipDetails

  const getSpeedText = (speed) => {
    switch(speed) {
      case 0: return '陆上基地'
      case 5: return '低速'
      case 10: return '高速'
      case 15: return '高速+'
      case 20: return '最速'
      default: return '未知'
    }
  }

  const getRangeText = (range) => {
    switch(range) {
      case 1: return '短'
      case 2: return '中'
      case 3: return '长'
      case 4: return '超长'
      default: return '未知'
    }
  }

  // 计算tooltip位置，防止超出屏幕
  const tooltipStyle = {
    position: 'fixed',
    left: Math.min(Math.max(position.x, 140), window.innerWidth - 140),
    top: Math.max(position.y - 10, 10),
    transform: 'translateX(-50%) translateY(-100%)',
    zIndex: 10000
  }

  const d = shipDetails || { name: '加载中...', type: '', level: '--', hp: '--', firepower: '--', torpedo: '--', aa: '--', armor: '--', luck: '--', speed: '--', range: '--' }

  return (
    <div className="ship-tooltip" style={tooltipStyle}>
      <div className="ship-tooltip-header">
        <h4>{d.name}</h4>
        <span className="ship-type">{d.type}</span>
      </div>
      
      <div className="ship-tooltip-content">
        <div className="ship-stat-row">
          <span className="stat-label">等级:</span>
          <span className="stat-value">Lv.{d.level}</span>
        </div>
        
        <div className="ship-stat-row">
          <span className="stat-label">耐久:</span>
          <span className="stat-value">{shipDetails.hp}</span>
        </div>
        
        <div className="ship-stats-grid">
          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <span className="stat-number">{shipDetails.firepower}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🚀</span>
            <span className="stat-number">{shipDetails.torpedo}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✈️</span>
            <span className="stat-number">{shipDetails.aa}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🛡️</span>
            <span className="stat-number">{shipDetails.armor}</span>
          </div>
        </div>
        
        <div className="ship-stat-row">
          <span className="stat-label">运:</span>
          <span className="stat-value">{shipDetails.luck}</span>
        </div>
        
        <div className="ship-stat-row">
          <span className="stat-label">速力:</span>
          <span className="stat-value">{getSpeedText(shipDetails.speed)}</span>
        </div>
        
        <div className="ship-stat-row">
          <span className="stat-label">射程:</span>
          <span className="stat-value">{getRangeText(shipDetails.range)}</span>
        </div>
      </div>
    </div>
  )
}

export default TodoList