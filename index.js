const { remote } = require('electron')
const { ensureDirSync } = require('fs-extra')
const path = require('path')

// 使用POI提供的React实例
let React
try {
  // 尝试从全局获取React
  React = global.React || window.React
  if (!React) {
    // 如果全局没有，尝试从require获取
    React = require('react')
  }
} catch (e) {
  console.error('Failed to get React:', e)
  React = require('react')
}

// 插件名称
const pluginName = 'kanote'

// 创建React组件
const KaNoteComponent = () => {
  try {
    // 尝试加载完整组件
    const App = require('./dist/bundle.js')
    // 如果是ES module，取default导出
    const AppComponent = App.default || App
    return React.createElement(AppComponent)
  } catch (e) {
    console.error('Failed to load KaNote full component:', e)
    // 返回错误提示界面
    return React.createElement('div', {
      style: {
        padding: '20px',
        textAlign: 'center',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        margin: '20px',
        color: '#856404'
      }
    }, [
      React.createElement('h2', { key: 'title', style: { color: '#dc3545', marginBottom: '10px' } }, '⚠️ KaNote 加载失败'),
      React.createElement('p', { key: 'desc', style: { marginBottom: '10px' } }, '插件组件无法正常加载'),
      React.createElement('details', { key: 'error', style: { marginTop: '15px', textAlign: 'left' } }, [
        React.createElement('summary', { key: 'summary' }, '错误详情'),
        React.createElement('pre', { 
          key: 'errorMsg', 
          style: { 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px', 
            fontSize: '12px',
            overflow: 'auto'
          } 
        }, e.toString())
      ]),
      React.createElement('p', { 
        key: 'help', 
        style: { 
          fontSize: '14px', 
          marginTop: '15px',
          padding: '10px',
          background: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '4px'
        } 
      }, '💡 解决方案：请运行 npm install && npm run build 重新构建插件')
    ])
  }
}

// 插件初始化
function pluginDidLoad() {
  try {
    const app = remote ? remote.app : require('electron').app
    const dataPath = path.join(app.getPath('userData'), 'kanote')
    ensureDirSync(dataPath)
    console.log('KaNote plugin loaded successfully')
    console.log('Data directory:', dataPath)
  } catch (error) {
    console.error('KaNote plugin load error:', error)
  }
}

// 插件卸载
function pluginWillUnload() {
  console.log('KaNote plugin unloaded')
}

// 导出插件
module.exports = {
  pluginName,
  reactClass: KaNoteComponent,
  pluginDidLoad,
  pluginWillUnload
}