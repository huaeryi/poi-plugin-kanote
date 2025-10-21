import React, { useState, useEffect, useRef } from 'react'
import shipDataService from '../services/ShipDataService'
import { smartMatch } from '../utils/textUtils'

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

const ShipSelector = ({ value, onChange, onSelectShip }) => {
  const [ships, setShips] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedShip, setSelectedShip] = useState(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    // 初始化 ShipDataService
    if (!shipDataService.isAvailable()) {
      shipDataService.init()
    }

    // 加载舰娘列表
    loadShips()
  }, [])

  useEffect(() => {
    // 点击外部关闭下拉框
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.ship-selector')) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    // 如果有初始值，查找对应的舰娘
    if (value && value.shipId) {
      const ship = shipDataService.getShipById(value.shipId)
      if (ship) {
        const shipName = shipDataService.getShipName(ship.api_ship_id)
        setSelectedShip({
          id: ship.api_id,
          masterId: ship.api_ship_id,
          name: shipName,
          level: ship.api_lv || 1
        })
      }
    }
  }, [value])

  useEffect(() => {
    // 当下拉框打开时，自动聚焦到搜索框
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus()
      }, 100) // 小延迟确保DOM已更新
    }
  }, [isOpen])

  const loadShips = () => {
    try {
      const ownedShips = shipDataService.getOwnedShips()
      const shipsWithNames = ownedShips.map(ship => ({
        id: ship.api_id,
        masterId: ship.api_ship_id,
        name: shipDataService.getShipName(ship.api_ship_id),
        level: ship.api_lv || 1,
        type: shipDataService.getShipType(ship),
        imageUrl: shipDataService.getShipImageUrl(ship.api_ship_id, 'middle'),
        avatarOffset: shipDataService.getShipAvatarOffset(ship)
      }))
      setShips(shipsWithNames)
    } catch (error) {
      console.error('加载舰娘列表失败:', error)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleSelectShip = (ship) => {
    setSelectedShip(ship)
    setIsOpen(false)
    setSearchQuery('')
    
    // 通知父组件
    const callback = onSelectShip || onChange
    if (callback) {
      callback({
        shipId: ship.id,
        shipName: ship.name,
        currentLevel: ship.level
      })
    }
  }

  const handleClear = () => {
    setSelectedShip(null)
    const callback = onSelectShip || onChange
    if (callback) {
      callback(null)
    }
  }

  const handleReselect = () => {
    setIsOpen(true)
  }

  const filteredShips = searchQuery
    ? ships.filter(ship => 
        ship.name && smartMatch(searchQuery, ship.name)
      )
    : ships

  return (
    <div className="ship-selector">
      {selectedShip ? (
        <div className="selected-ship">
          <div 
            className="ship-info-area"
            onClick={handleReselect}
            title="点击重新选择舰娘"
          >
            <div className="ship-info-with-avatar">
              <ShipImageWithFallback 
                shipId={selectedShip.masterId}
                shipName={selectedShip.name}
                primaryUrl={selectedShip.imageUrl}
                avatarOffset={selectedShip.avatarOffset}
              />
              <span className="ship-info">
                🚢 {selectedShip.name} Lv.{selectedShip.level}
              </span>
            </div>
          </div>
          <button 
            className="clear-ship-btn"
            onClick={handleClear}
            type="button"
            title="清除选择"
          >
            ✕
          </button>
          
          {isOpen && ships.length > 0 && (
            <div className="ship-dropdown">
              <input
                ref={searchInputRef}
                type="text"
                className="ship-search-input"
                placeholder="🔍 搜索舰娘..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="ship-list">
                {filteredShips.length > 0 ? (
                  filteredShips.map(ship => (
                    <div
                      key={ship.id}
                      className="ship-item"
                      onClick={() => handleSelectShip(ship)}
                    >
                      <div className="ship-item-with-avatar">
                        <ShipImageWithFallback 
                          shipId={ship.masterId}
                          shipName={ship.name}
                          primaryUrl={ship.imageUrl}
                          avatarOffset={ship.avatarOffset}
                        />
                        <div className="ship-item-content">
                          <span className="ship-name">{ship.name}</span>
                          <span className="ship-level">Lv.{ship.level}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-ships">未找到匹配的舰娘</div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="ship-selector-dropdown">
          <button
            className="select-ship-btn"
            onClick={() => setIsOpen(!isOpen)}
            type="button"
          >
            {ships.length > 0 ? '🚢 选择舰娘' : '⚠️ 无舰娘数据'}
          </button>
          
          {isOpen && ships.length > 0 && (
            <div className="ship-dropdown">
              <input
                ref={searchInputRef}
                type="text"
                className="ship-search-input"
                placeholder="🔍 搜索舰娘..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="ship-list">
                {filteredShips.length > 0 ? (
                  filteredShips.map(ship => (
                    <div
                      key={ship.id}
                      className="ship-item"
                      onClick={() => handleSelectShip(ship)}
                    >
                      <div className="ship-item-with-avatar">
                        <ShipImageWithFallback 
                          shipId={ship.masterId}
                          shipName={ship.name}
                          primaryUrl={ship.imageUrl}
                          avatarOffset={ship.avatarOffset}
                        />
                        <div className="ship-item-content">
                          <span className="ship-name">{ship.name}</span>
                          <span className="ship-level">Lv.{ship.level}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-ships">未找到匹配的舰娘</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ShipSelector
