import React from 'react'

const Sidebar = ({
  currentView,
  onViewChange,
  notebooks,
  onCreateNotebook,
  onSelectNotebook,
  onDeleteNotebook,
  onSearch,
  searchQuery,
  loading
}) => {
  return (
    <div className="sidebar">
      <div className="notebooks-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 搜索笔记本..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sidebar-nav">
          <button 
            className="btn btn-primary btn-small"
            onClick={onCreateNotebook}
            title="创建新笔记本"
          >
            📝 笔记
          </button>
        </div>

        <div className="notebooks-list">
          {loading ? (
            <div className="loading">⏳ 加载中...</div>
          ) : notebooks.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? '😔 没有找到匹配的笔记本' : '📝 还没有笔记本，点击上方按钮开始吧！'}
            </div>
          ) : (
            notebooks.map(notebook => (
              <div 
                key={notebook.id} 
                className="notebook-item"
                onClick={() => onSelectNotebook(notebook)}
              >
                <div className="notebook-title">📄 {notebook.title}</div>
                <div className="notebook-preview">
                  {notebook.content.substring(0, 50)}...
                </div>
                <div className="notebook-actions">
                  <span className="notebook-date">
                    🕒 {new Date(notebook.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteNotebook(notebook.id)
                    }}
                    title="删除笔记本"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar