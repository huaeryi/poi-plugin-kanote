import React, { useState, useEffect } from 'react'
import shipDataService from '../services/ShipDataService'

// 舰娘图像组件
const ShipImageWithFallback = ({ shipId, shipName, primaryUrl, avatarOffset = 0, bgColor = '#000' }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  
  // 调试信息：输出avatarOffset的值
  console.log(`ShipImageWithFallback: 舰娘 ${shipId} (${shipName}) 的avatarOffset:`, avatarOffset)

  // 处理图片URL - 如果是poi的路径，需要转换为可访问的URL
  let imageUrl = primaryUrl || `../../../assets/images/ship/${shipId}_middle.png`
  let possibleUrls = [imageUrl]
  
  // 如果是poi的路径，准备多种可能的URL格式
  if (primaryUrl && primaryUrl.startsWith('/kcs2/')) {
    console.log(`检测到poi资源路径: ${primaryUrl}`)
    
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
    console.log(`尝试使用URL (${currentUrlIndex + 1}/${possibleUrls.length}): ${imageUrl}`)
  }

  console.log(`ShipImageWithFallback: 准备加载图片 - ID: ${shipId}, URL: ${imageUrl}`)

  const handleError = (e) => {
    console.error(`图像加载失败: ${imageUrl}`, e)
    console.log(`错误详情:`, {
      src: e.target.src,
      naturalWidth: e.target.naturalWidth,
      naturalHeight: e.target.naturalHeight,
      complete: e.target.complete
    })
    
    // 如果还有更多URL可以尝试
    if (currentUrlIndex < possibleUrls.length - 1) {
      const nextIndex = currentUrlIndex + 1
      console.log(`尝试下一个URL (${nextIndex + 1}/${possibleUrls.length}): ${possibleUrls[nextIndex]}`)
      setCurrentUrlIndex(nextIndex)
    } else {
      console.log(`所有URL都尝试失败，显示占位符`)
      setShowPlaceholder(true)
    }
  }

  const handleLoad = (e) => {
    console.log(`图像加载成功: ${imageUrl}`, {
      naturalWidth: e.target.naturalWidth,
      naturalHeight: e.target.naturalHeight
    })
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
  console.log(`ShipImageWithFallback: avatarOffset: ${avatarOffset}, object-position-x: ${objectPositionX}%`)

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

  // 获取舰娘类型对应的颜色
  const getShipTypeColor = (ship) => {
    const typeColors = {
      1: '#4CAF50',   // 駆逐艦 - 翠绿色
      2: '#2196F3',   // 軽巡洋艦 - 明亮蓝
      3: '#9C27B0',   // 重雷装巡洋艦 - 深紫色
      4: '#FF9800',   // 重巡洋艦 - 活力橙
      5: '#00BCD4',   // 航空巡洋艦 - 青绿色
      6: '#E91E63',   // 軽空母 - 玫瑰粉
      7: '#F44336',   // 戦艦 - 鲜红色
      8: '#F44336',   // 戦艦 - 鲜红色
      9: '#795548',   // 航空戦艦 - 深棕色
      10: '#FF5722',  // 正規空母 - 深橙色
      11: '#607D8B',  // 超弩級戦艦 - 蓝灰色
      12: '#3F51B5',  // 潜水艦 - 靛蓝色
      13: '#673AB7',  // 潜水空母 - 深紫色
      14: '#009688',  // 補給艦 - 青绿色
      15: '#8BC34A',  // 水上機母艦 - 浅绿色
      16: '#CDDC39',  // 揚陸艦 - 黄绿色
      17: '#FFC107',  // 装甲空母 - 金黄色
      18: '#FFEB3B',  // 工作艦 - 浅黄色
      19: '#9E9E9E',  // 潜水母艦 - 灰色
      20: '#607D8B',  // 練習巡洋艦 - 蓝灰色
      21: '#009688'   // 補給艦 - 青绿色
    }
    
    const shipType = shipDataService.getShipType(ship)
    return typeColors[shipType] || '#6A1B9A' // 默认使用紫色
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
                        avatarOffset={shipDataService.getShipAvatarOffset(ship)}
                        bgColor={getShipTypeColor(ship)}
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
