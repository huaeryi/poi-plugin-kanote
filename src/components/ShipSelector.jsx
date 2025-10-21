import React, { useState, useEffect, useRef } from 'react'
import shipDataService from '../services/ShipDataService'
import { smartMatch } from '../utils/textUtils'

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
        type: shipDataService.getShipType(ship)
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
            <span className="ship-info">
              🚢 {selectedShip.name} Lv.{selectedShip.level}
            </span>
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
                      <span className="ship-name">{ship.name}</span>
                      <span className="ship-level">Lv.{ship.level}</span>
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
                      <span className="ship-name">{ship.name}</span>
                      <span className="ship-level">Lv.{ship.level}</span>
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
