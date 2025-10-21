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

const AllShipSelector = ({ value, onChange, onSelectShip }) => {
  const [allShips, setAllShips] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedShip, setSelectedShip] = useState(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    // 初始化 ShipDataService
    if (!shipDataService.isAvailable()) {
      shipDataService.init()
    }

    // 加载所有舰娘列表
    loadAllShips()
  }, [])

  useEffect(() => {
    // 如果有初始值，查找对应的舰娘
    if (value && value.shipId) {
      const ship = allShips.find(s => s.masterId === value.shipId)
      if (ship) {
        setSelectedShip(ship)
      }
    }
  }, [value, allShips])

  useEffect(() => {
    // 当下拉框打开时，自动聚焦到搜索框
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus()
      }, 100) // 小延迟确保DOM已更新
    }
  }, [isOpen])

  const loadAllShips = () => {
    try {
      // 获取所有舰娘的主数据（包括未获得的）
      const allShipMaster = shipDataService.getAllShipMaster()
      if (allShipMaster && allShipMaster.length > 0) {
        const shipsWithNames = allShipMaster.map(ship => ({
          masterId: ship.api_id,
          name: ship.api_name,
          type: shipDataService.getShipTypeName(ship.api_stype),
          owned: shipDataService.isShipOwned(ship.api_id),
          imageUrl: shipDataService.getShipImageUrl(ship.api_id, 'middle'),
          avatarOffset: 0 // 对于未拥有的舰娘，使用默认偏移量
        }))
        // 按名称排序
        shipsWithNames.sort((a, b) => a.name.localeCompare(b.name))
        setAllShips(shipsWithNames)
      } else {
        console.warn('无法获取舰娘主数据，尝试备用方案')
        // 备用方案：只显示已拥有的舰娘
        const ownedShips = shipDataService.getOwnedShips()
        const shipsWithNames = ownedShips.map(ship => ({
          masterId: ship.api_ship_id,
          name: shipDataService.getShipName(ship.api_ship_id),
          type: shipDataService.getShipType(ship),
          owned: true,
          imageUrl: shipDataService.getShipImageUrl(ship.api_ship_id, 'middle'),
          avatarOffset: shipDataService.getShipAvatarOffset(ship)
        }))
        setAllShips(shipsWithNames)
      }
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
        shipId: ship.masterId,
        shipName: ship.name,
        owned: ship.owned
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

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.all-ship-selector')) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  const filteredShips = searchQuery
    ? allShips.filter(ship => 
        ship.name && smartMatch(searchQuery, ship.name)
      )
    : allShips

  return (
    <div className="all-ship-selector">
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
                🚢 {selectedShip.name}
                {!selectedShip.owned && <span className="not-owned-badge">未获得</span>}
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
          
          {isOpen && allShips.length > 0 && (
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
                      key={ship.masterId}
                      className={`ship-item ${!ship.owned ? 'not-owned' : ''}`}
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
                          <span className="ship-type">{ship.type}</span>
                        </div>
                      </div>
                      <div className="ship-status">
                        {ship.owned ? (
                          <span className="owned-badge">已拥有</span>
                        ) : (
                          <span className="not-owned-badge">未获得</span>
                        )}
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
            {allShips.length > 0 ? '🚢 选择目标舰娘' : '⚠️ 无舰娘数据'}
          </button>
          
          {isOpen && allShips.length > 0 && (
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
                      key={ship.masterId}
                      className={`ship-item ${!ship.owned ? 'not-owned' : ''}`}
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
                          <span className="ship-type">{ship.type}</span>
                        </div>
                      </div>
                      <div className="ship-status">
                        {ship.owned ? (
                          <span className="owned-badge">已拥有</span>
                        ) : (
                          <span className="not-owned-badge">未获得</span>
                        )}
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

export default AllShipSelector