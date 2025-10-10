const fs = require('fs-extra')
const path = require('path')
const { remote } = require('electron')

class ConfigManager {
  constructor() {
    this.configPath = path.join(remote.app.getPath('userData'), 'kanote', 'config.json')
    this.defaultConfig = {
      theme: 'default',
      autoSave: true,
      autoSaveInterval: 30000, // 30秒
      autoBackup: true,
      autoBackupInterval: 86400000, // 24小时
      fontSize: 14,
      fontFamily: 'Consolas',
      language: 'zh-CN',
      shortcuts: {
        newNotebook: 'Ctrl+N',
        saveNotebook: 'Ctrl+S',
        searchNotebooks: 'Ctrl+F',
        toggleSidebar: 'Ctrl+B'
      },
      export: {
        defaultFormat: 'txt',
        includeMetadata: true
      },
      window: {
        width: 1024,
        height: 768,
        x: null,
        y: null
      }
    }
  }

  // 获取配置
  async getConfig() {
    try {
      if (await fs.pathExists(this.configPath)) {
        const config = await fs.readJson(this.configPath)
        return { ...this.defaultConfig, ...config }
      }
      
      // 如果配置文件不存在，创建默认配置
      await this.saveConfig(this.defaultConfig)
      return this.defaultConfig
    } catch (error) {
      console.error('Failed to get config:', error)
      return this.defaultConfig
    }
  }

  // 保存配置
  async saveConfig(config) {
    try {
      await fs.ensureDir(path.dirname(this.configPath))
      await fs.writeJson(this.configPath, config, { spaces: 2 })
      return config
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    }
  }

  // 更新配置
  async updateConfig(updates) {
    try {
      const currentConfig = await this.getConfig()
      const newConfig = this.deepMerge(currentConfig, updates)
      return await this.saveConfig(newConfig)
    } catch (error) {
      console.error('Failed to update config:', error)
      throw error
    }
  }

  // 重置配置
  async resetConfig() {
    try {
      return await this.saveConfig(this.defaultConfig)
    } catch (error) {
      console.error('Failed to reset config:', error)
      throw error
    }
  }

  // 深度合并对象
  deepMerge(target, source) {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  // 导出配置
  async exportConfig() {
    try {
      const config = await this.getConfig()
      return JSON.stringify(config, null, 2)
    } catch (error) {
      console.error('Failed to export config:', error)
      throw error
    }
  }

  // 导入配置
  async importConfig(configData) {
    try {
      const config = typeof configData === 'string' ? JSON.parse(configData) : configData
      return await this.saveConfig({ ...this.defaultConfig, ...config })
    } catch (error) {
      console.error('Failed to import config:', error)
      throw error
    }
  }
}

module.exports = ConfigManager