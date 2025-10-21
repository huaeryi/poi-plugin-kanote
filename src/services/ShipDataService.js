class ShipDataService {
  constructor() {
    this.store = null
    this.ships = null
    this.shipData = null
    this.master = null
  }

  // 初始化服务，获取 poi 的 Redux store
  init() {
    try {
      console.log('ShipDataService: 开始初始化...')
      
      // 获取 poi 的全局 store - 尝试多种方式
      let store = null
      
      // 方式1: window.getStore
      if (typeof window !== 'undefined' && window.getStore) {
        try {
          const candidateStore = window.getStore()
          console.log('ShipDataService: window.getStore() 返回:', typeof candidateStore, candidateStore)
          if (candidateStore && typeof candidateStore.getState === 'function') {
            store = candidateStore
            console.log('ShipDataService: 通过 window.getStore 获取 store 成功')
          } else {
            console.log('ShipDataService: window.getStore 返回的对象没有 getState 方法')
          }
        } catch (error) {
          console.log('ShipDataService: window.getStore() 调用失败:', error)
        }
      }
      
      // 方式2: window.store 直接访问
      if (!store && typeof window !== 'undefined' && window.store) {
        try {
          const candidateStore = window.store
          console.log('ShipDataService: window.store 类型:', typeof candidateStore, candidateStore)
          if (candidateStore && typeof candidateStore.getState === 'function') {
            store = candidateStore
            console.log('ShipDataService: 通过 window.store 获取 store 成功')
          } else {
            console.log('ShipDataService: window.store 没有 getState 方法')
          }
        } catch (error) {
          console.log('ShipDataService: 访问 window.store 失败:', error)
        }
      }
      
      // 方式3: global.getStore
      if (!store && typeof global !== 'undefined' && global.getStore) {
        try {
          const candidateStore = global.getStore()
          console.log('ShipDataService: global.getStore() 返回:', typeof candidateStore, candidateStore)
          if (candidateStore && typeof candidateStore.getState === 'function') {
            store = candidateStore
            console.log('ShipDataService: 通过 global.getStore 获取 store 成功')
          } else {
            console.log('ShipDataService: global.getStore 返回的对象没有 getState 方法')
          }
        } catch (error) {
          console.log('ShipDataService: global.getStore() 调用失败:', error)
        }
      }
      
      // 方式4: window.redux.getStore
      if (!store && typeof window !== 'undefined' && window.redux && window.redux.getStore) {
        try {
          const candidateStore = window.redux.getStore()
          if (candidateStore && typeof candidateStore.getState === 'function') {
            store = candidateStore
            console.log('ShipDataService: 通过 window.redux.getStore 获取 store 成功')
          }
        } catch (error) {
          console.log('ShipDataService: window.redux.getStore() 调用失败:', error)
        }
      }
      
      // 方式5: window.redux.getState
      if (!store && typeof window !== 'undefined' && window.redux && typeof window.redux.getState === 'function') {
        try {
          store = { 
            getState: () => window.redux.getState(),
            subscribe: window.redux.subscribe ? (listener) => window.redux.subscribe(listener) : null
          }
          console.log('ShipDataService: 通过 window.redux.getState 创建 store 对象成功')
        } catch (error) {
          console.log('ShipDataService: 创建 store 对象失败:', error)
        }
      }
      
      // 方式6: 最后尝试 - 直接尝试调用所有可能的方法
      if (!store && typeof window !== 'undefined') {
        const candidates = [
          () => window.getStore?.(),
          () => window.store,
          () => global?.getStore?.(),
        ]
        
        for (let i = 0; i < candidates.length; i++) {
          try {
            const candidate = candidates[i]()
            console.log(`候选 store ${i + 1}:`, candidate, 'getState:', typeof candidate?.getState)
            
            if (candidate && typeof candidate.getState === 'function') {
              store = candidate
              console.log(`ShipDataService: 通过候选方法 ${i + 1} 获取 store 成功`)
              break
            }
          } catch (error) {
            console.log(`候选方法 ${i + 1} 失败:`, error)
          }
        }
      }

      if (!store || typeof store.getState !== 'function') {
        console.error('ShipDataService: 无法获取有效的 store 对象')
        console.log('可用的全局对象:', {
          'window.getStore': typeof window !== 'undefined' ? !!window.getStore : false,
          'window.redux': typeof window !== 'undefined' ? !!window.redux : false,
          'window.store': typeof window !== 'undefined' ? !!window.store : false,
          'global.getStore': typeof global !== 'undefined' ? !!global.getStore : false
        })
        
        // 尝试调试获取到的对象
        if (typeof window !== 'undefined') {
          try {
            if (window.getStore) {
              const testStore = window.getStore()
              console.log('window.getStore() 结果:', testStore, 'getState:', typeof testStore?.getState)
            }
            if (window.store) {
              console.log('window.store 结果:', window.store, 'getState:', typeof window.store?.getState)
            }
          } catch (error) {
            console.log('调试时出错:', error)
          }
        }
        
        return false
      }

      this.store = store
      console.log('ShipDataService: store 获取成功')

      // 监听 store 变化
      if (this.store.subscribe && typeof this.store.subscribe === 'function') {
        this.unsubscribe = this.store.subscribe(() => {
          this.updateShipData()
        })
        console.log('ShipDataService: store 监听器设置成功')
      }

      // 初始化数据
      this.updateShipData()
      
      // 验证是否有数据
      const hasData = this.hasShipData()
      console.log('ShipDataService: 初始化完成, 有数据:', hasData)
      
      return true
    } catch (error) {
      console.error('ShipDataService 初始化失败:', error)
      return false
    }
  }

  // 更新舰娘数据
  updateShipData() {
    if (!this.store) {
      console.warn('ShipDataService: store 不存在，无法更新数据')
      return
    }

    try {
      const state = this.store.getState()
      
      // 调试：打印可用的状态键
      const stateKeys = Object.keys(state || {})
      console.log('ShipDataService: 可用的状态键:', stateKeys.slice(0, 10)) // 只显示前10个
      
      // 初始化基础数据 - 尝试多个可能的位置
      this.shipData = state.const || state.constants || {}
      this.master = state.master || state.shipMaster || {}
      
      // 调试 master 数据结构
      if (this.shipData && Object.keys(this.shipData).length > 0) {
        console.log('ShipDataService: const 数据键:', Object.keys(this.shipData).slice(0, 10))
      }
      if (this.master && Object.keys(this.master).length > 0) {
        console.log('ShipDataService: master 数据键:', Object.keys(this.master).slice(0, 10))
      }
      
      // 尝试多种可能的数据源来获取舰娘数据
      let shipsFound = false
      
      // 直接尝试已知的可能位置
      const possiblePaths = [
        () => state.ships,
        () => state.fleet,
        () => state.navalBase,
        () => state.info && state.info.ships,  // poi 中舰娘数据很可能在 info.ships
        () => state.info && state.info.fleet,
        () => state.user && state.user.ships,
        () => state.fleet && state.fleet.ships,
        () => state.navalBase && state.navalBase.ships,
      ]
      
      for (let i = 0; i < possiblePaths.length; i++) {
        try {
          const result = possiblePaths[i]()
          if (result && (Array.isArray(result) || typeof result === 'object')) {
            console.log(`ShipDataService: 在路径 ${i} 找到数据:`, typeof result, Object.keys(result).slice(0, 5))
            
            if (Array.isArray(result) && result.length > 0) {
              // 检查数组中的元素是否是舰娘数据
              const firstItem = result[0]
              if (firstItem && (firstItem.api_id || firstItem.api_ship_id)) {
                this.ships = result
                shipsFound = true
                console.log(`ShipDataService: 路径 ${i} 包含 ${result.length} 个舰娘`)
                break
              }
            } else if (typeof result === 'object' && Object.keys(result).length > 0) {
              // 检查对象中的值是否是舰娘数据
              const firstKey = Object.keys(result)[0]
              const firstItem = result[firstKey]
              if (firstItem && typeof firstItem === 'object' && (firstItem.api_id || firstItem.api_ship_id)) {
                this.ships = result
                shipsFound = true
                console.log(`ShipDataService: 路径 ${i} 包含 ${Object.keys(result).length} 个舰娘`)
                break
              }
            }
          }
        } catch (error) {
          console.log(`ShipDataService: 路径 ${i} 访问失败:`, error)
        }
      }
      
      // 如果还没找到，尝试探索 info 对象
      if (!shipsFound && state.info) {
        console.log('ShipDataService: 探索 info 对象:', Object.keys(state.info))
        
        for (const key of Object.keys(state.info)) {
          try {
            const value = state.info[key]
            if (value && typeof value === 'object') {
              console.log(`ShipDataService: info.${key}:`, typeof value, Array.isArray(value) ? value.length : Object.keys(value).length)
              
              // 检查是否包含舰娘数据
              if (Array.isArray(value) && value.length > 0) {
                const firstItem = value[0]
                if (firstItem && (firstItem.api_id || firstItem.api_ship_id)) {
                  this.ships = value
                  shipsFound = true
                  console.log(`ShipDataService: 在 info.${key} 找到 ${value.length} 个舰娘`)
                  break
                }
              }
            }
          } catch (error) {
            console.log(`ShipDataService: 访问 info.${key} 失败:`, error)
          }
        }
      }
      
      // 如果还是没找到，设置为空对象
      if (!shipsFound) {
        this.ships = {}
      }
      
      // 确保 master 数据是最新的
      this.master = state.master || state.shipMaster || {}
      this.shipData = state.const || state.constants || {}
      
      // 调试信息
      const shipCount = this.getOwnedShips().length
      if (shipCount > 0) {
        console.log(`ShipDataService: 找到 ${shipCount} 个舰娘`)
      } else {
        console.log('ShipDataService: 没有找到舰娘数据，已尝试的数据源:', {
          'state.ships': !!state.ships,
          'state.fleet': !!state.fleet,
          'state.navalBase': !!state.navalBase,
          'state.info': !!state.info,
          'state.info.ships': !!(state.info && state.info.ships),
          'state.const': !!state.const,
          'state.master': !!state.master
        })
        
        // 如果有 info，显示其结构
        if (state.info) {
          console.log('ShipDataService: state.info 的结构:', Object.keys(state.info))
        }
      }
      
    } catch (error) {
      console.error('更新舰娘数据失败:', error)
    }
  }

  // 获取所有拥有的舰娘
  getOwnedShips() {
    if (!this.ships) return []
    
    try {
      const ships = []
      
      // 处理不同的数据结构
      if (Array.isArray(this.ships)) {
        // 如果是数组
        ships.push(...this.ships.filter(ship => ship && ship.api_id && ship.api_ship_id))
      } else if (typeof this.ships === 'object') {
        // 如果是对象
        for (const key in this.ships) {
          const ship = this.ships[key]
          if (ship && typeof ship === 'object' && ship.api_id && ship.api_ship_id) {
            ships.push(ship)
          }
        }
      }
      
      return ships
    } catch (error) {
      console.error('获取舰娘列表失败:', error)
      return []
    }
  }

  // 获取所有舰娘的主数据（包括未获得的）
  getAllShipMaster() {
    if (!this.master) return []
    
    try {
      // 尝试获取舰娘主数据
      const shipMaster = this.master.api_mst_ship || this.master.ship || []
      if (Array.isArray(shipMaster)) {
        return shipMaster.filter(ship => ship && ship.api_id && ship.api_name)
      }
      return []
    } catch (error) {
      console.error('获取舰娘主数据失败:', error)
      return []
    }
  }

  // 检查是否拥有某个舰娘
  isShipOwned(shipMasterId) {
    try {
      const ownedShips = this.getOwnedShips()
      return ownedShips.some(ship => ship.api_ship_id === shipMasterId)
    } catch (error) {
      console.error('检查舰娘拥有状态失败:', error)
      return false
    }
  }

  // 获取舰娘类型名称
  getShipTypeName(shipTypeId) {
    if (!this.master) return '未知'
    
    try {
      const shipTypes = this.master.api_mst_stype || this.master.stype || []
      const shipType = shipTypes.find(type => type.api_id === shipTypeId)
      return shipType ? shipType.api_name : '未知'
    } catch (error) {
      console.error('获取舰娘类型名称失败:', error)
      return '未知'
    }
  }

  // 根据 ID 获取舰娘信息
  getShipById(shipId) {
    if (!this.ships || !shipId) return null
    
    try {
      const allShips = this.getOwnedShips()
      return allShips.find(ship => 
        ship && (ship.api_ship_id === shipId || ship.api_id === shipId)
      ) || null
    } catch (error) {
      console.error('根据ID获取舰娘失败:', error)
      return null
    }
  }

  // 根据 masterId 获取舰娘基础数据
  getShipDataByMasterId(masterId) {
    if (!masterId) return {}
    
    try {
      // 尝试多个可能的数据源
      const possibleSources = [
        // 从 master 中获取
        () => {
          if (!this.master) return null
          const masterShips = this.master.ship || this.master.ships || {}
          return masterShips[masterId] || masterShips[String(masterId)] || null
        },
        
        // 从 const 中获取 - 尝试多种可能的路径
        () => {
          if (!this.shipData) return null
          const constShips = this.shipData.$ships || this.shipData.ship || this.shipData.ships || {}
          return constShips[masterId] || constShips[String(masterId)] || null
        },
        
        // 尝试直接从 store 获取最新的 const 数据 - 根据日志显示应该用 $ships
        () => {
          if (!this.store) return null
          try {
            const state = this.store.getState()
            const constData = state.const || state.constants || {}
            const constShips = constData.$ships || constData.ship || constData.ships || {}
            console.log(`ShipDataService: 尝试从 const.$ships[${masterId}] 获取数据`)
            const result = constShips[masterId] || constShips[String(masterId)] || null
            if (result) {
              console.log(`ShipDataService: 找到舰娘基础数据:`, masterId, result, 'keys:', Object.keys(result))
              // 显示前几个字段的值来帮助调试类型字段
              const sampleData = {}
              Object.keys(result).slice(0, 10).forEach(key => {
                sampleData[key] = result[key]
              })
              console.log(`ShipDataService: 舰娘 ${masterId} 示例数据:`, sampleData)
            } else {
              // 如果没有找到，让我们看看前几个数据项的结构
              const firstFewKeys = Object.keys(constShips).slice(0, 3)
              if (firstFewKeys.length > 0) {
                console.log(`ShipDataService: $ships 前几个键:`, firstFewKeys, '示例数据:', constShips[firstFewKeys[0]])
              }
            }
            return result
          } catch (error) {
            console.log('从 store 获取 const 数据失败:', error)
            return null
          }
        }
      ]
      
      for (let i = 0; i < possibleSources.length; i++) {
        try {
          const result = possibleSources[i]()
          if (result && typeof result === 'object') {
            // 检查是否包含舰娘基础数据 - 扩展检查条件
            if (result.api_name || result.name || result.kanji || result.hiragana || result.romaji || result.id || result.api_id) {
              console.log(`ShipDataService: 从数据源 ${i} 获取到舰娘基础数据:`, masterId, result.api_name || result.name || result.kanji || result.hiragana || result.romaji)
              return result
            }
          }
        } catch (error) {
          console.log(`ShipDataService: 数据源 ${i} 获取失败:`, error)
        }
      }
      
      return {}
    } catch (error) {
      console.error('获取舰娘基础数据失败:', error)
      return {}
    }
  }

  // 获取舰娘详细信息（包含基础数据和当前状态）
  getShipDetail(shipId) {
    const ship = this.getShipById(shipId)
    if (!ship) return null

    const masterData = this.getShipDataByMasterId(ship.api_ship_id)
    
    return {
      ...ship,
      master: masterData || {}
    }
  }

  // 获取按类型分组的舰娘
  getShipsByType() {
    const ships = this.getOwnedShips()
    const grouped = {}

    ships.forEach(ship => {
      const shipType = this.getShipType(ship)
      if (!shipType) return

      if (!grouped[shipType]) {
        grouped[shipType] = []
      }
      grouped[shipType].push(ship)
    })

    return grouped
  }

  // 搜索舰娘
  searchShips(keyword) {
    const ships = this.getOwnedShips()
    if (!keyword) return ships

    const lowerKeyword = keyword.toLowerCase()
    
    return ships.filter(ship => {
      const masterData = this.getShipDataByMasterId(ship.api_ship_id)
      
      // 尝试多种可能的名称字段进行搜索
      const name = masterData.api_name || 
                   masterData.name || 
                   masterData.api_yomi || 
                   masterData.yomi ||
                   masterData.kanji ||
                   masterData.hiragana ||
                   masterData.romaji || ''
      
      return name.toLowerCase().includes(lowerKeyword)
    })
  }
  
  // 获取舰娘名字的辅助方法
  getShipName(masterId) {
    const masterData = this.getShipDataByMasterId(masterId)
    
    // 根据 plugin-ship-info 的模式，尝试多种可能的字段名
    const name = masterData.api_name || 
                 masterData.name || 
                 masterData.api_yomi || 
                 masterData.yomi ||
                 masterData.kanji ||     // 可能的汉字名称字段
                 masterData.hiragana ||  // 可能的平假名字段
                 masterData.romaji ||    // 可能的罗马字字段
                 ''
    
    if (name && name.trim()) {
      return name
    }
    
    // 如果没有找到名字，记录调试信息
    console.log(`ShipDataService: 无法获取舰娘 ${masterId} 的名字，masterData:`, masterData)
    return `舰娘${masterId}`
  }

  // 获取舰娘类型
  getShipType(ship) {
    // 首先尝试从舰娘实例数据获取 - 尝试多种可能的字段
    const instanceTypeFields = ['api_ship_type', 'api_type', 'api_stype', 'stype', 'type']
    for (const field of instanceTypeFields) {
      if (ship[field] !== undefined && ship[field] !== null) {
        console.log(`ShipDataService: 从实例数据字段 ${field} 获取到舰娘类型:`, ship[field])
        return ship[field]
      }
    }
    
    // 如果实例数据没有，尝试从 master 数据获取
    const masterData = this.getShipDataByMasterId(ship.api_ship_id)
    
    // 尝试多种可能的类型字段 - 根据 poi 的数据结构
    const possibleTypeFields = [
      'api_type',
      'api_stype', 
      'type',
      'ship_type',
      'api_ship_type',
      'stype',
      'category',
      'class'
    ]
    
    for (const field of possibleTypeFields) {
      if (masterData[field] !== undefined && masterData[field] !== null) {
        console.log(`ShipDataService: 从字段 ${field} 获取到舰娘类型 ${ship.api_ship_id}:`, masterData[field])
        return masterData[field]
      }
    }
    
    // 如果没有找到类型，显示 masterData 的键来帮助调试
    console.log(`ShipDataService: 无法找到舰娘 ${ship.api_ship_id} 的类型字段，masterData keys:`, Object.keys(masterData))
    console.log(`ShipDataService: masterData 示例值:`, Object.keys(masterData).slice(0, 15).reduce((obj, key) => {
      obj[key] = masterData[key]
      return obj
    }, {}))
    
    return null
  }

  // 获取舰队信息
  getFleetInfo() {
    if (!this.store) return null

    try {
      const state = this.store.getState()
      return state.fleets || null
    } catch (error) {
      console.error('获取舰队信息失败:', error)
      return null
    }
  }

  // 销毁服务
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    this.store = null
    this.ships = null
    this.shipData = null
    this.master = null
  }

  // 检查服务是否可用
  isAvailable() {
    return !!(this.store && this.store.getState)
  }

  // 检查是否有舰娘数据
  hasShipData() {
    if (!this.store) return false
    
    try {
      const state = this.store.getState()
      
      // 尝试多种可能的数据源
      const possibleShips = [
        state.ships,
        state.fleet,
        state.navalBase,
        state.info && state.info.ships,
        state.info && state.info.fleet,
      ]
      
      for (const ships of possibleShips) {
        if (ships && (Array.isArray(ships) ? ships.length > 0 : Object.keys(ships).length > 0)) {
          return true
        }
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  // 获取服务器IP地址
  getServerIP() {
    try {
      if (!this.store) return '203.104.209.71' // 默认IP
      
      const state = this.store.getState()
      // 从state.info.server.ip获取IP，如果没有则使用默认值
      const ip = state.info && state.info.server && state.info.server.ip || '203.104.209.71'
      console.log(`ShipDataService: 获取到服务器IP: ${ip}`)
      return ip
    } catch (error) {
      console.error('ShipDataService: 获取服务器IP失败:', error)
      return '203.104.209.71' // 默认IP
    }
  }

  // 获取舰娘头像偏移量
  getShipAvatarOffset(ship) {
    try {
      // 如果传入的是ship对象，直接从ship对象中获取avatarOffset
      if (ship && typeof ship === 'object') {
        // 尝试多种可能的avatarOffset字段名
        const possibleFields = ['avatarOffset', 'api_avatar_offset', 'avatar_offset']
        
        for (const field of possibleFields) {
          if (ship[field] !== undefined && ship[field] !== null) {
            console.log(`ShipDataService: 从字段 ${field} 获取到avatarOffset:`, ship[field])
            return ship[field]
          }
        }
        
        // 如果ship对象中没有avatarOffset，返回默认值0
        console.log(`ShipDataService: ship对象中没有找到avatarOffset字段，ship keys:`, Object.keys(ship))
        return 0
      }
      
      // 如果传入的是shipId，尝试从shipData中查找
      if (typeof ship === 'number' || typeof ship === 'string') {
        const shipId = ship
        if (this.shipData && this.shipData[shipId]) {
          const shipInfo = this.shipData[shipId]
          return shipInfo.avatarOffset || 0
        }
      }
      
      // 如果无法获取，返回默认值0
      return 0
    } catch (error) {
      console.error('ShipDataService: 获取舰娘头像偏移量失败:', error)
      return 0
    }
  }

  // 获取舰娘图像URL
  getShipImageUrl(shipId, type = 'middle', damaged = false) {
    try {
      // 确保参数类型正确
      const id = Number(shipId)
      const isDamaged = Boolean(damaged)
      
      // 检查poi的getShipImgPath接口是否可用
      let getShipImgPath = null
      
      // 尝试多种方式获取poi的getShipImgPath函数
      try {
        // 方式1: 从全局对象获取
        if (typeof window !== 'undefined' && window.getShipImgPath) {
          getShipImgPath = window.getShipImgPath
        }
        // 方式2: 从poi的全局对象获取
        else if (typeof window !== 'undefined' && window.poi && window.poi.getShipImgPath) {
          getShipImgPath = window.poi.getShipImgPath
        }
        // 方式3: 尝试动态require（仅在运行时）
        else if (typeof require !== 'undefined') {
          try {
            const shipImgModule = require('views/utils/ship-img')
            getShipImgPath = shipImgModule.getShipImgPath
          } catch (requireError) {
            // require失败，继续使用默认路径
          }
        }
      } catch (error) {
        // 获取接口失败，继续使用默认路径
      }
      
      if (getShipImgPath && typeof getShipImgPath === 'function') {
        // 根据type参数确定图像类型 - poi期望的是字符串类型
        let imageType = 'remodel'  // 默认使用remodel
        if (type === 'small') {
          imageType = 'small'
        } else if (type === 'middle') {
          imageType = 'remodel'  // middle对应remodel
        } else if (type === 'large') {
          imageType = 'remodel'
        } else if (type === 'banner') {
          imageType = 'banner'
        }
        
        // 获取服务器IP
        const ip = this.getServerIP()
        
        try {
          // 使用正确的参数格式: getShipImgPath(shipId, type, damaged, ip)
          const imagePath = getShipImgPath(id, imageType, isDamaged, ip)
          console.log(`ShipDataService: 成功获取舰娘 ${id} 图像路径: ${imagePath}`)
          return imagePath
        } catch (callError) {
          console.error(`ShipDataService: 调用getShipImgPath失败:`, callError)
          // 调用失败，使用默认路径
          return `../../../assets/images/ship/${shipId}_${type}.png`
        }
      } else {
        console.log(`ShipDataService: poi的getShipImgPath接口不可用，使用默认路径`)
        return `../../../assets/images/ship/${shipId}_${type}.png`
      }
    } catch (error) {
      console.error('ShipDataService: 获取舰娘图像URL失败:', error)
      // 如果poi接口不可用，返回默认路径
      return `../../../assets/images/ship/${shipId}_${type}.png`
    }
  }

  // 获取数据统计
  getStats() {
    const ships = this.getOwnedShips()
    const stats = {
      total: ships.length,
      byType: {},
      byLevel: {
        low: 0,    // < 50
        mid: 0,    // 50-89
        high: 0    // >= 90
      }
    }

    ships.forEach(ship => {
      // 按类型统计
      const type = this.getShipType(ship) || 'unknown'
      stats.byType[type] = (stats.byType[type] || 0) + 1

      // 按等级统计
      const level = ship.api_lv || 0
      if (level < 50) {
        stats.byLevel.low++
      } else if (level < 90) {
        stats.byLevel.mid++
      } else {
        stats.byLevel.high++
      }
    })

    return stats
  }
}

// 创建全局实例
const shipDataService = new ShipDataService()

export default shipDataService
