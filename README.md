# DniMap - 在线思维导图工具
DniMap是一个基于TypeScript + React + Zustand + Konva.js构建的思维导图工具

# 主要功能
- 🎨 画布操作
  - ✅ 支持以鼠标为中心的画布缩放
  - ✅ 支持惯性滚动与流畅拖拽
  - ✅ 支持导出为JPG/PNG/PDF/SVG
  - ✅ 大纲索引节点
- 📝 文本与编辑
  - ✅ 支持节点原地编辑添加
  - ✅ 支持多种格式导入导出（.json/.md/.xlsx/.xmind/.dmp）
  - ✅ 支持撤销重做功能
  - 🚧 快捷键操作
  - ❌ 打开文件另存为
  - ❌ 个性化操作（主题/样式）
- 📊 布局与连线
  - ✅ 支持四种树布局结构（left-to-right/right-to-left/center/top-to-bottom）
  - ✅ 动态折叠与尺寸调整
  - ✅ 平滑节点连线
- 💾 数据管理
  - ✅ localforage持久化无感知自动保存

# 技术栈
### 前端
- React + Vite: 高性能的前端开发框架。
- TypeScript: 强类型语言，提升代码可读性和开发效率，减少运行时错误。
- Zustand: 轻量级状态管理库，与 localforage 集成实现自动持久化。
- Konva.js: 专注于 Canvas 的 2D 图形渲染库，支持复杂的画布操作（如缩放、拖拽、文本编辑等）。
- Ant Design: 企业级 UI 组件库，加速界面开发。

# 开发环境设置
1. 克隆仓库
```bash
git clone https://github.com/aynya/DniMap.git
```

2. 安装依赖
```bash
cd DniMap
npm install
```

3. 启动
```bash
npm run dev
```
