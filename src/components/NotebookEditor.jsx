import React, { useState, useEffect } from 'react'

const NotebookEditor = ({ notebook, onSave, onBack }) => {
  const [title, setTitle] = useState(notebook?.title || '')
  const [content, setContent] = useState(notebook?.content || '')
  const [category, setCategory] = useState(notebook?.category || 'personal')
  const [tags, setTags] = useState(notebook?.tags?.join(', ') || '')
  const [saveStatus, setSaveStatus] = useState('saved') // 'modified', 'saving', 'saved'

  useEffect(() => {
    if (notebook) {
      setTitle(notebook.title || '')
      setContent(notebook.content || '')
      setCategory(notebook.category || 'personal')
      setTags(notebook.tags?.join(', ') || '')
      setSaveStatus('saved')
    }
  }, [notebook])

  useEffect(() => {
    if (title !== (notebook?.title || '') || 
        content !== (notebook?.content || '') || 
        category !== (notebook?.category || 'personal') ||
        tags !== (notebook?.tags?.join(', ') || '')) {
      setSaveStatus('modified')
    }
  }, [title, content, category, tags, notebook])

  useEffect(() => {
    if (saveStatus === 'modified') {
      const saveTimer = setTimeout(() => {
        handleSave()
      }, 10000) // 3秒后自动保存

      return () => clearTimeout(saveTimer)
    }
  }, [saveStatus, title, content, category, tags])

  const handleSave = async () => {
    if (saveStatus === 'modified') {
      setSaveStatus('saving')
      
      const updatedNotebook = {
        ...notebook,
        title: title || '无标题笔记',
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString()
      }

      try {
        await onSave(updatedNotebook)
        setSaveStatus('saved')
      } catch (error) {
        console.error('保存失败:', error)
        setSaveStatus('modified')
      }
    }
  }

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'modified': return '📝 未保存'
      case 'saving': return '💾 保存中...'
      case 'saved': return '✅ 已保存'
      default: return ''
    }
  }

  const getSaveStatusClass = () => {
    switch (saveStatus) {
      case 'modified': return 'modified-indicator'
      case 'saving': return 'saving-indicator'
      case 'saved': return 'saved-indicator'
      default: return ''
    }
  }

  return (
    <div className="notebook-editor">
      <div className="editor-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回列表
        </button>
        <div className="editor-actions">
          <span className={getSaveStatusClass()}>
            {getSaveStatusText()}
          </span>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-meta">
          <input
            type="text"
            className="title-input"
            placeholder="📝 输入笔记标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <div className="meta-row">
            <select
              className="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="work">💼 工作</option>
              <option value="study">📚 学习</option>
              <option value="personal">👤 个人</option>
              <option value="ideas">💡 灵感</option>
            </select>
            
            <input
              type="text"
              className="tags-input"
              placeholder="🏷️ 标签 (用逗号分隔)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div className="editor-main">
          <textarea
            className="content-textarea"
            placeholder="✍️ 在这里写下你的想法..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default NotebookEditor