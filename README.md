
# 📝 KaNote — POI笔记插件

一个为 POI（插件宿主）打造的轻量级笔记与待办插件，方便舰队管理、练级与捞船记录。

![POI Plugin](https://img.shields.io/badge/POI-Plugin-blue.svg)
![Version](https://img.shields.io/badge/version-1.1.5-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## ✨ 功能特色

- 练级计划：通过 POI 的 store 读取舰娘数据，支持在练级任务中绑定舰娘并显示详细信息
- 笔记（Notebook）：分类、标签、全文搜索、自动保存

## ⚙️ 插件安装
1. 在 POI 的插件管理界面或资源市场搜索 "poi-plugin-kanote" 并安装，或将打包后的插件目录放入 POI 的插件目录并重启 POI。
2. 在 POI 中打开 KaNote，即可开始使用笔记与待办功能。
  
## 🚀 快速开始

系统要求：POI v6.3.3+，Node.js 14+

安装（开发流程）：


```powershell
# 克隆仓库
git clone https://github.com/huaeryi/poi-plugin-kanote.git
cd poi-plugin-kanote

# 安装依赖
npm install

# 本地构建
npm run build

# 将打包结果安装到 POI（Windows）
.\install.bat
```

## 🗂️ 项目结构
```
.
├─ index.js               # 插件入口（POI 集成点）
├─ package.json           # 项目与插件元信息
├─ install.bat            # Windows 下的安装脚本（把插件复制到 POI 插件目录）
├─ src/                   # 源码（React 组件、服务、样式）
│  ├─ components/         # UI 组件：Notebook, TodoList, ShipSelector 等
│  ├─ services/           # 数据管理：NotebookManager, ShipDataService 等
│  └─ styles/             # 全局样式
├─ dist/                  # 打包输出（生产构建产物）
└─ README.md              # 项目说明
```

