const fs = require('fs-extra')
const path = require('path')
const { remote } = require('electron')

class NotebookManager {
  constructor() {
    this.dataPath = path.join(remote.app.getPath('userData'), 'kanote', 'notebooks')
    fs.ensureDirSync(this.dataPath)
  }

  // 获取所有笔记本
  async getAllNotebooks() {
    try {
      const files = await fs.readdir(this.dataPath)
      const notebooks = []
      
      for (const file of files) {
        if (path.extname(file) === '.json') {
          const filePath = path.join(this.dataPath, file)
          const notebook = await fs.readJson(filePath)
          notebooks.push(notebook)
        }
      }
      
      return notebooks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    } catch (error) {
      console.error('Failed to get notebooks:', error)
      return []
    }
  }

  // 创建新笔记本
  async createNotebook(title = '新笔记本') {
    const notebook = {
      id: this.generateId(),
      title,
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'general'
    }

    await this.saveNotebook(notebook)
    return notebook
  }

  // 保存笔记本
  async saveNotebook(notebook) {
    try {
      notebook.updatedAt = new Date().toISOString()
      const filePath = path.join(this.dataPath, `${notebook.id}.json`)
      await fs.writeJson(filePath, notebook, { spaces: 2 })
      return notebook
    } catch (error) {
      console.error('Failed to save notebook:', error)
      throw error
    }
  }

  // 删除笔记本
  async deleteNotebook(id) {
    try {
      const filePath = path.join(this.dataPath, `${id}.json`)
      await fs.remove(filePath)
      return true
    } catch (error) {
      console.error('Failed to delete notebook:', error)
      return false
    }
  }

  // 搜索笔记本
  async searchNotebooks(query) {
    const notebooks = await this.getAllNotebooks()
    const lowerQuery = query.toLowerCase()
    
    return notebooks.filter(notebook => 
      notebook.title.toLowerCase().includes(lowerQuery) ||
      notebook.content.toLowerCase().includes(lowerQuery) ||
      notebook.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  // 按分类获取笔记本
  async getNotebooksByCategory(category) {
    const notebooks = await this.getAllNotebooks()
    return notebooks.filter(notebook => notebook.category === category)
  }

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 导出笔记本
  async exportNotebook(id, format = 'json') {
    try {
      const filePath = path.join(this.dataPath, `${id}.json`)
      const notebook = await fs.readJson(filePath)
      
      if (format === 'txt') {
        return `${notebook.title}\n\n${notebook.content}`
      }
      
      return notebook
    } catch (error) {
      console.error('Failed to export notebook:', error)
      throw error
    }
  }

  // 导入笔记本
  async importNotebook(data) {
    const notebook = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await this.saveNotebook(notebook)
    return notebook
  }
}

module.exports = NotebookManager