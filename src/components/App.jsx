import React, { useState } from 'react'
import Notebook from './Notebook'
import TodoList from './TodoList'

const App = () => {
  const [currentView, setCurrentView] = useState('leveling') // 默认打开练级计划

  return (
    <div className="app poi-plugin vertical-layout">
      <div className="main-content">

        <div className="action-bar">
          <button 
            className="btn btn-primary btn-medium"
            onClick={() => setCurrentView('leveling')}
            title="练级计划"
          >
            ⏫️ 练级
          </button>
          <button 
            className="btn btn-primary btn-medium"
            onClick={() => setCurrentView('farming')}
            title="捞船计划"
          >
            🚢 捞船
          </button>
          <button 
            className="btn btn-primary btn-medium"
            onClick={() => setCurrentView('upgrade')}
            title="改修计划"
          >
            🛠️ 改修
          </button>
          <button 
            className="btn btn-primary btn-medium"
            onClick={() => setCurrentView('notebooks')}
            title="笔记本"
          >
            📝 笔记
          </button>
        </div>

        {currentView === 'notebooks' && <Notebook />}

        {currentView === 'leveling' && (
          <div className="todolist-section">
            <TodoList
              type="leveling"
              title="⏫️练级计划"
            />
          </div>
        )}

        {currentView === 'farming' && (
          <div className="todolist-section">
            <TodoList
              type="farming"
              title="🚢捞船计划"
            />
          </div>
        )}

        {currentView === 'upgrade' && (
          <div className="todolist-section">
            <TodoList
              type="upgrade"
              title="🛠️改修计划"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App