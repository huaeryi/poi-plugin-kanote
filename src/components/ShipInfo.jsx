import React, { useState, useEffect } from 'react'
import shipDataService from '../services/ShipDataService'

// 舰娘图像组件
const ShipImageWithFallback = ({ shipId, shipName, primaryUrl }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(false)

  // 直接使用标准路径
  const imageUrl = primaryUrl || `../../../assets/images/ship/${shipId}_middle.png`

  const handleError = () => {
    console.log(`图像加载失败: ${imageUrl}`)
    setShowPlaceholder(true)
  }

  const handleLoad = () => {
    console.log(`图像加载成功: ${imageUrl}`)
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

  return (
    <>
      <img 
        src={imageUrl}
        alt={shipName}
        className="ship-image"
        onError={handleError}
        onLoad={handleLoad}
      />
      <div className="ship-image-placeholder" style={{ display: 'none' }}>
        <span className="ship-placeholder-text">🚢</span>
        <span className="ship-id-text">{shipId}</span>
      </div>
    </>
  )
}

const ShipInfo = () => {
  const [ships, setShips] = useState([])
  const [stats, setStats] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [isServiceReady, setIsServiceReady] = useState(false)
  const [initAttempts, setInitAttempts] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let retryTimeout = null
    let attempts = 0
    
    // 初始化服务
    const init = () => {
      attempts += 1
      console.log('ShipInfo: 尝试初始化服务，第', attempts, '次')
      
      const ready = shipDataService.init()
      
      if (ready) {
        setIsServiceReady(true)
        setErrorMessage('')
        updateData()
      } else {
        setInitAttempts(attempts)
        
        if (attempts < 10) { // 最多重试10次
          setErrorMessage(`正在尝试连接... (${attempts}/10)`)
          retryTimeout = setTimeout(init, 2000) // 2秒后重试
        } else {
          setErrorMessage('无法连接到游戏数据，请确保 poi 正在运行并已登录游戏')
        }
      }
    }

    // 开始初始化
    init()

    // 定期更新数据
    const interval = setInterval(() => {
      if (shipDataService.isAvailable()) {
        updateData()
      }
    }, 5000) // 每5秒更新一次

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      clearInterval(interval)
    }
  }, []) // 只在组件挂载时执行一次

  const updateData = () => {
    try {
      const allShips = shipDataService.getOwnedShips()
      const shipStats = shipDataService.getStats()
      
      setShips(allShips)
      setStats(shipStats)
    } catch (error) {
      console.error('更新舰娘数据失败:', error)
    }
  }

  const getFilteredShips = () => {
    let filtered = ships

    // 按关键词搜索
    if (searchKeyword) {
      filtered = shipDataService.searchShips(searchKeyword)
    }

    // 按类型过滤
    if (selectedType !== 'all') {
      filtered = filtered.filter(ship => {
        const shipType = shipDataService.getShipType(ship)
        return shipType && shipType.toString() === selectedType
      })
    }

    return filtered.sort((a, b) => (b.api_lv || 0) - (a.api_lv || 0))
  }

  const getShipTypeName = (typeId) => {
    // 根据提供的映射数组创建类型映射
    const shipTypes = [
      "海防艦",       // 0
      "駆逐艦",       // 1
      "軽巡洋艦",     // 2
      "重雷装巡洋艦", // 3
      "重巡洋艦",     // 4
      "航空巡洋艦",   // 5
      "軽空母",       // 6
      "戦艦",         // 7
      "戦艦",         // 8 (重复)
      "航空戦艦",     // 9
      "正規空母",     // 10
      "超弩級戦艦",   // 11
      "潜水艦",       // 12
      "潜水空母",     // 13
      "補給艦",       // 14
      "水上機母艦",   // 15
      "揚陸艦",       // 16
      "装甲空母",     // 17
      "工作艦",       // 18
      "潜水母艦",     // 19
      "練習巡洋艦",   // 20
      "補給艦"        // 21 (重复)
    ]
    
    // 检查 typeId 是否为数字且在有效范围内
    const id = parseInt(typeId) - 1
    if (!isNaN(id) && id >= 0 && id < shipTypes.length) {
      return shipTypes[id]
    }
    
    // 如果不在数组中，返回原始类型 ID
    return `类型${typeId}`
  }

  const getShipName = (ship) => {
    try {
      return shipDataService.getShipName(ship.api_ship_id)
    } catch (error) {
      console.log('获取舰娘名字失败:', error, ship)
      return `舰娘${ship.api_ship_id}`
    }
  }

  // 获取舰娘图像 URL
  const getShipImageUrl = (ship) => {
    try {
      const imageUrl = shipDataService.getShipImageUrl(ship.api_ship_id, 'middle')
      console.log(`ShipInfo: 获取到舰娘 ${ship.api_ship_id} 的图像URL:`, imageUrl)
      return imageUrl
    } catch (error) {
      console.log('获取舰娘图像URL失败:', error, ship)
      return null
    }
  }


  if (!isServiceReady) {
    return (
      <div className="ship-info-container">
        <div className="loading-state">
          <h3>🔄 正在连接游戏数据...</h3>
          <p>{errorMessage || '请确保 poi 正在运行并已登录游戏'}</p>
          {initAttempts > 0 && (
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#aaaaaa' }}>
              尝试次数: {initAttempts}/10
            </div>
          )}
          <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888888' }}>
            💡 提示: 打开浏览器开发者工具查看详细日志信息
          </div>
        </div>
      </div>
    )
  }

  const filteredShips = getFilteredShips()
  const shipTypes = Object.keys(shipDataService.getShipsByType())

  return (
    <div className="ship-info-container">
      <div className="ship-info-header">
        <h3>🚢 舰娘信息</h3>
        {stats && (
          <div className="ship-stats">
            <span className="stat-item">总数: {stats.total}</span>
            <span className="stat-item">高级: {stats.byLevel.high}</span>
            <span className="stat-item">中级: {stats.byLevel.mid}</span>
            <span className="stat-item">低级: {stats.byLevel.low}</span>
          </div>
        )}
      </div>

      <div className="ship-info-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索舰娘..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-box">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="type-select"
          >
            <option value="all">所有类型</option>
            {shipTypes.map(type => (
              <option key={type} value={type}>
                {getShipTypeName(parseInt(type))}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ship-list">
        {filteredShips.length === 0 ? (
          <div className="empty-state">
            <p>没有找到匹配的舰娘</p>
          </div>
        ) : (
          <div className="ship-grid">
            {filteredShips.map((ship, index) => {
              const imageUrl = getShipImageUrl(ship)
              
              return (
                <div key={`${ship.api_id}-${index}`} className="ship-card">
                  <div className="ship-header">
                    <span className="ship-name">{getShipName(ship)}</span>
                    <span className="ship-level">Lv.{ship.api_lv || 0}</span>
                  </div>
                  
                  <div className="ship-content">
                    <div className="ship-image-container">
                      <ShipImageWithFallback 
                        shipId={ship.api_ship_id}
                        shipName={getShipName(ship)}
                        primaryUrl={imageUrl}
                      />
                    </div>
                    
                    <div className="ship-details">
                      <div className="ship-info-item">
                        <span className="label">类型:</span>
                        <span className="value">{getShipTypeName(shipDataService.getShipType(ship))}</span>
                      </div>
                      <div className="ship-info-item">
                        <span className="label">耐久:</span>
                        <span className="value">{ship.api_nowhp || 0}/{ship.api_maxhp || 0}</span>
                      </div>
                      <div className="ship-info-item">
                        <span className="label">士气:</span>
                        <span className="value">{ship.api_cond || 0}</span>
                      </div>
                      {ship.api_exp && (
                        <div className="ship-info-item">
                          <span className="label">经验:</span>
                          <span className="value">{ship.api_exp[0] || 0}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShipInfo
