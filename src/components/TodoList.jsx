import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ShipSelector from './ShipSelector'
import AllShipSelector from './AllShipSelector'
import shipDataService from '../services/ShipDataService'

// 舰娘图像组件
const ShipImageWithFallback = ({ shipId, shipName, primaryUrl, avatarOffset = 0, bgColor = '#000' }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  
  // 处理图片URL - 如果是poi的路径，需要转换为可访问的URL
  let imageUrl = primaryUrl || `../../../assets/images/ship/${shipId}_middle.png`
  let possibleUrls = [imageUrl]
  
  // 如果是poi的路径，准备多种可能的URL格式
  if (primaryUrl && primaryUrl.startsWith('/kcs2/')) {
    possibleUrls = [
      // 方式1: 直接使用原路径
      primaryUrl,
      // 方式2: 添加file://协议
      `file://${primaryUrl}`,
      // 方式3: 添加poi://协议
      `poi://${primaryUrl}`,
      // 方式4: 使用相对路径（从当前域名开始）
      `.${primaryUrl}`,
      // 方式5: 使用绝对路径（从根开始）
      `http://localhost${primaryUrl}`,
      // 方式6: 使用poi的本地服务器
      `http://127.0.0.1:8080${primaryUrl}`,
      // 方式7: 使用默认路径作为最后的备选
      `../../../assets/images/ship/${shipId}_middle.png`
    ]
    
    imageUrl = possibleUrls[currentUrlIndex]
  }

  const handleError = (e) => {
    // 如果还有更多URL可以尝试
    if (currentUrlIndex < possibleUrls.length - 1) {
      const nextIndex = currentUrlIndex + 1
      setCurrentUrlIndex(nextIndex)
    } else {
      setShowPlaceholder(true)
    }
  }

  const handleLoad = (e) => {
    setShowPlaceholder(false)
  }

  // 如果应该显示占位符
  if (showPlaceholder) {
    return (
      <div className="ship-image-placeholder">
        <span className="ship-placeholder-text">🚢</span>
        <span className="ship-id-text">{shipId}</span>
      </div>
    )
  }

  // 计算图像位置偏移量
  // avatarOffset是一个0-1之间的值，表示图像的水平位置
  // 0表示显示图像的最左边，1表示显示图像的最右边
  const objectPositionX = Math.round(avatarOffset * 100)

  return (
    <div className="ship-avatar-container">
      <img 
        src={imageUrl}
        alt={shipName}
        className="ship-avatar"
        style={{ 
          objectPosition: `${objectPositionX}% center`
        }}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

// 内置的舰娘类型映射（作为 fallback）
const getShipTypeNameInline = (typeId) => {
  const shipTypes = [
    "海防艦",
    "駆逐艦",
    "軽巡洋艦",
    "重雷装巡洋艦",
    "重巡洋艦",
    "航空巡洋艦",
    "軽空母",
    "戦艦",
    "戦艦",
    "航空戦艦",
    "正規空母",
    "超弩級戦艦",
    "潜水艦",
    "潜水空母",
    "補給艦",
    "水上機母艦",
    "揚陸艦",
    "装甲空母",
    "工作艦",
    "潜水母艦",
    "練習巡洋艦",
    "補給艦"
  ]

  if (typeId === undefined || typeId === null) return ''
  const id = parseInt(typeId) - 1
  if (!isNaN(id) && id >= 0 && id < shipTypes.length) {
    return shipTypes[id]
  }
  return `类型${typeId}`
}

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

  // 定期检查练级完成状态（每1秒）
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
        // 使用ShipDataService的getShipImageUrl方法获取图片URL
        return shipDataService.getShipImageUrl(ship.api_ship_id, 'middle')
      }
    } catch (error) {
      console.error('获取舰娘头像失败:', error)
    }
    return null
  }

  // 获取舰娘头像偏移量
  const getShipAvatarOffset = () => {
    if (!isShipTodo) return 0
    try {
      const ship = shipDataService.getShipById(todo.shipId)
      if (ship) {
        return shipDataService.getShipAvatarOffset(ship)
      }
    } catch (error) {
      console.error('获取舰娘头像偏移量失败:', error)
    }
    return 0
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
        // 最大耐久优先使用 api_maxhp
        hp: ship.api_maxhp || ship.api_hp || ship.hp || 0,
        // 当前耐久可能在不同字段，优先使用 api_nowhp
        currentHp: ship.api_nowhp || ship.api_hp_now || ship.currentHp || ship.hp_now || null,
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
          <ShipImageWithFallback 
            shipId={todo.shipId}
            shipName={todo.shipName}
            primaryUrl={getShipAvatarUrl()}
            avatarOffset={getShipAvatarOffset()}
          />
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
                  <div className="ship-name">
                    {todo.shipName}
                    {(() => {
                      const typeVal = getShipDetails()?.type
                      const label = (() => {
                        try {
                          if (typeVal !== undefined && typeVal !== null) {
                            const nameFromService = shipDataService.getShipTypeName(typeVal)
                            if (nameFromService && nameFromService !== '未知') return nameFromService
                          }
                        } catch (e) {}
                        return getShipTypeNameInline(typeVal)
                      })()

                      const typeClass = (typeVal !== undefined && typeVal !== null && !isNaN(parseInt(typeVal)))
                        ? `type-${parseInt(typeVal)}`
                        : ''

                      return <span className={`ship-type-badge ${typeClass}`}>{label}</span>
                    })()}
                  </div>
                  <div className="level-progress">
                    Lv.{todo.currentLevel} → Lv.{todo.targetLevel}
                    {todo.completed && <span className="completed-badge">✅ 已达成</span>}
                  </div>
                </div>
              ) : isFarmingTodo ? (
                <div className="farming-display">
                  <div className="ship-name">
                    {todo.shipName}
                    {(() => {
                      const typeVal = getShipDetails()?.type
                      const label = (() => {
                        try {
                          if (typeVal !== undefined && typeVal !== null) {
                            const nameFromService = shipDataService.getShipTypeName(typeVal)
                            if (nameFromService && nameFromService !== '未知') return nameFromService
                          }
                        } catch (e) {}
                        return getShipTypeNameInline(typeVal)
                      })()

                      const typeClass = (typeVal !== undefined && typeVal !== null && !isNaN(parseInt(typeVal)))
                        ? `type-${parseInt(typeVal)}`
                        : ''

                      return <span className={`ship-type-badge ${typeClass}`}>{label}</span>
                    })()}
                  </div>
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

  // 解析类型为可读名称，优先使用 shipDataService 的映射函数，回退到内置映射
  const typeText = (() => {
    const typeVal = d.type
    if (typeVal === undefined || typeVal === null || typeVal === '') return ''
    try {
      const nameFromService = shipDataService.getShipTypeName(typeVal)
      if (nameFromService && nameFromService !== '未知') return nameFromService
    } catch (e) {
      // ignore
    }
    return getShipTypeNameInline(typeVal)
  })()

  return (
    <div className="ship-tooltip" style={tooltipStyle}>
      <div className="ship-tooltip-header">
        <h4>{d.name}</h4>
        {(() => {
          const typeVal = d.type
          const label = (() => {
            try {
              if (typeVal !== undefined && typeVal !== null) {
                const nameFromService = shipDataService.getShipTypeName(typeVal)
                if (nameFromService && nameFromService !== '未知') return nameFromService
              }
            } catch (e) {}
            return getShipTypeNameInline(typeVal)
          })()

          const typeClass = (typeVal !== undefined && typeVal !== null && !isNaN(parseInt(typeVal)))
            ? `type-${parseInt(typeVal)}`
            : ''

          return <span className={`ship-type-badge ${typeClass}`}>{label}</span>
        })()}
      </div>
      
      <div className="ship-tooltip-content">
        <div className="ship-stat-row">
          <span className="stat-label">等级:</span>
          <span className="stat-value">Lv.{d.level}</span>
        </div>
        
        <div className="ship-stat-row">
          <span className="stat-label">耐久:</span>
          <span className="stat-value">
            {(() => {
              // 优先显示 当前/最大 格式
              const cur = shipDetails.currentHp
              const max = shipDetails.hp
              if ((cur === undefined || cur === null || cur === '') && (max === undefined || max === null || max === '')) {
                return '--'
              }

              // 如果有当前耐久且最大耐久，显示 cur/max
              if (cur !== undefined && cur !== null && cur !== '' && max !== undefined && max !== null && max !== '') {
                return `${cur}/${max}`
              }

              // 回退：如果只有最大耐久，显示最大
              if (max !== undefined && max !== null && max !== '') return max

              // 回退：如果只有当前耐久，显示当前
              if (cur !== undefined && cur !== null && cur !== '') return cur

              return '--'
            })()}
          </span>
        </div>
        
        <div className="ship-stats-grid">
          <div className="stat-item">
            <span className="stat-icon">火力</span>
            <span className="stat-number">{shipDetails.firepower}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">雷装</span>
            <span className="stat-number">{shipDetails.torpedo}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">对空</span>
            <span className="stat-number">{shipDetails.aa}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">装甲</span>
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