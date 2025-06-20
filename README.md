# AI学术研究助手

一个专为学术研究者设计的智能化平台，基于Vue 3和TDesign Chat组件构建，集成AI对话、文献处理、知识库管理等核心功能。

## 🚀 项目特性

- **智能对话**：集成TDesign Chat组件，支持流式输出和思维链展示
- **现代化UI**：基于TDesign设计语言，响应式布局
- **模块化架构**：清晰的项目结构，易于维护和扩展
- **TypeScript支持**：完整的类型检查和智能提示

## 📋 开发进度

### 已完成 ✅
- [x] 项目初始化和基础架构搭建
- [x] TDesign组件库集成
- [x] 路由系统配置
- [x] 样式系统建立（CSS变量、基础样式、布局样式）
- [x] 主布局组件开发（AppLayout、Sidebar）
- [x] 工作台页面基础版本
- [x] AI对话页面核心功能（基于TDesign Chat）
- [x] 404错误页面

### 进行中 🚧
- [ ] 文献处理功能开发
- [ ] 知识库管理功能开发
- [ ] 用户指南页面内容
- [ ] 设置页面功能

### 计划中 📅
- [ ] AI接口集成
- [ ] 文件上传功能
- [ ] 数据持久化
- [ ] 用户认证系统
- [ ] 主题切换功能

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: TDesign Vue Next + TDesign Chat
- **构建工具**: Vite
- **路由管理**: Vue Router
- **状态管理**: Pinia
- **样式方案**: Less + CSS Variables
- **代码规范**: ESLint + Prettier

## 📦 安装依赖

```bash
npm install
```

## 🚀 启动开发

```bash
npm run dev
```

## 🏗️ 构建生产

```bash
npm run build
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── layout/         # 布局组件
│   ├── chat/           # 聊天相关组件
│   ├── common/         # 通用组件
│   └── business/       # 业务组件
├── views/              # 页面组件
├── router/             # 路由配置
├── stores/             # 状态管理
├── composables/        # 组合式函数
├── utils/              # 工具函数
├── styles/             # 样式文件
├── assets/             # 静态资源
└── api/                # API接口
```

## 🎨 设计规范

### 色彩系统
- **主品牌色**: #6366f1 (学术紫)
- **成功色**: #28a745
- **警告色**: #ffc107
- **危险色**: #dc3545

### 间距系统
基于4px的8倍数体系：4px, 8px, 16px, 24px, 32px, 48px

### 组件规范
- 遵循TDesign设计规范
- 统一的圆角设计（4px-16px）
- 标准的阴影层级
- 一致的动画时长（0.15s-0.5s）

## 🔧 开发指南

### 添加新页面
1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在 `src/components/layout/Sidebar.vue` 添加导航菜单

### 样式开发
- 使用CSS变量定义颜色和尺寸
- 组件样式使用scoped样式
- 全局样式放在 `src/styles/` 目录

### 组件开发
- 使用Composition API
- 添加TypeScript类型定义
- 遵循单一职责原则

## 📖 相关文档

- [产品计划书](./产品计划书.md)
- [页面设计重构文档](./页面设计重构文档.md)
- [TDesign文档](https://tdesign.tencent.com/vue-next/overview)
- [Vue 3文档](https://vuejs.org/)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**开发状态**: 🚧 积极开发中

**当前版本**: v0.1.0 (基础架构阶段)

**下一个里程碑**: AI对话功能完善和文献处理功能开发
