# 📝 KaNote - POI笔记插件

一个为POI设计的笔记本与待办事项管理插件，提供简洁高效的笔记记录和任务管理功能。

![POI Plugin](https://img.shields.io/badge/POI-Plugin-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## ✨ 功能特色

### 📝 笔记本功能
- **智能分类**: 工作、学习、个人、灵感四个预设分类
- **实时保存**: 3秒自动保存，避免数据丢失
- **标签系统**: 支持多标签分类管理
- **搜索功能**: 全文搜索笔记内容、标题和标签
- **POI主题**: 完美适配POI暗色主题风格

### ✅ TodoList功能
- **任务管理**: 添加、编辑、删除、完成待办事项
- **状态过滤**: 全部、进行中、已完成三种视图
- **数据统计**: 实时显示任务完成情况
- **本地存储**: 使用localStorage持久化存储
- **批量操作**: 一键清空已完成任务

### 🎨 界面设计
- **竖向布局**: 适合POI插件界面的垂直布局
- **响应式设计**: 适配不同屏幕尺寸
- **直观操作**: 清晰的功能按钮和操作流程
- **状态指示**: 保存状态、加载状态等实时反馈

## 🚀 快速开始

### 系统要求
- POI v6.3.3 或更高版本
- Node.js 14+ 
- Windows / macOS / Linux

### 安装方法
```bash
# 克隆项目
git clone https://github.com/huaeryi/poi-plugin-kanote.git

# 进入目录
cd poi-plugin-kanote

# 安装依赖
npm install

# 构建并安装
npm run build
./install.bat  # Windows
```

### 使用方法
1. 在POI主界面找到"KaNote"标签页
2. 选择功能：
   - 点击"📝 笔记"进入笔记管理
   - 点击"✅ TodoList"进入任务管理
3. 开始记录你的想法和任务！

## 📁 项目结构

```
poi-plugin-kanote/
├── package.json              # 插件配置与依赖
├── index.js                  # POI插件入口
├── index.html               # 主页面模板
├── webpack.config.js        # Webpack构建配置
├── install.bat             # Windows安装脚本
├── src/                    # 源代码目录
│   ├── index.js           # React应用入口
│   ├── components/        # React组件
│   │   ├── App.jsx       # 主应用组件
│   │   ├── NotebookEditor.jsx  # 笔记编辑器
│   │   ├── TodoList.jsx       # 待办事项组件
│   │   └── Sidebar.jsx        # 侧边栏组件
│   ├── services/         # 业务逻辑层
│   │   └── NotebookManager.js # 笔记管理服务
│   └── styles/          # 样式文件
│       └── main.css     # 主样式表
└── dist/               # 构建输出目录
```

## 💾 数据存储

### 笔记数据
- **存储位置**: `{用户数据目录}/kanote/notebooks/`
- **文件格式**: JSON文件，每个笔记一个文件
- **文件命名**: `{笔记ID}.json`

### 待办事项数据
- **存储方式**: localStorage
- **键名**: `kanote-todos`
- **格式**: JSON数组

### 数据结构示例
```json
// 笔记数据结构
{
  "id": "unique-id",
  "title": "笔记标题",
  "content": "笔记内容",
  "category": "personal",
  "tags": ["标签1", "标签2"],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}

// TodoList数据结构
[
  {
    "id": 1,
    "text": "待办事项内容",
    "completed": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

## 🛠️ 开发指南

### 开发环境设置
```bash
# 克隆仓库
git clone https://github.com/huaeryi/poi-plugin-kanote.git
cd poi-plugin-kanote

# 安装依赖
npm install

# 开发模式（实时编译）
npm run dev

# 生产构建
npm run build

# 检查代码
npm run lint
```

### 技术栈
- **前端框架**: React 18.2.0
- **构建工具**: Webpack 5.88.0
- **样式**: 纯CSS3（适配POI主题）
- **存储**: fs-extra + localStorage
- **POI集成**: Electron APIs

### 开发说明
- React和ReactDOM通过webpack externals引用POI内置版本
- 使用CommonJS2格式输出以兼容POI插件系统
- 样式使用POI标准色彩（#2f343c背景色）
- 自动保存机制避免数据丢失

## ⚙️ 配置选项

### 主题颜色
在`main.css`中自定义颜色：
```css
--poi-bg-color: #2f343c;      /* POI背景色 */
--poi-text-color: #ffffff;    /* POI文字色 */
--poi-accent-color: #0066cc;  /* POI强调色 */
```

## 📝 更新日志

### v1.0.0 (2025-10-10)
- 📝 笔记本功能
- ✅ TodoList任务管理


**免责声明**: 这是一个社区开发的第三方插件，与官方POI无关。使用时请注意数据备份。