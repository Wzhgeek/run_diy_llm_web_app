# AI聊天功能使用说明

## 功能概述

本项目基于Vue 3和TDesign组件库构建，集成了Dify AI对话API，提供了完整的AI聊天解决方案。

### 主要功能

- 🤖 **AI对话**: 支持与AI助手进行实时对话
- 📁 **文件上传**: 支持上传图片、文档、音频、视频等多种格式文件
- 🔄 **流式响应**: 实时显示AI回复内容，支持停止生成
- 💾 **会话管理**: 历史对话保存、删除、重命名
- 🔧 **功能开关**: 网络搜索、代码模式、Agent模式、数据报表等
- 📱 **响应式设计**: 支持移动端和桌面端

## 配置说明

### 1. 环境变量配置

复制 `env.example` 文件为 `.env`，并配置以下变量：

```bash
# Dify API 配置
VITE_DIFY_API_KEY=app-your-dify-api-key-here    # 必填：您的Dify API密钥
VITE_DIFY_BASE_URL=https://api.dify.ai/v1        # API基础URL

# 应用配置
VITE_APP_NAME=AI Chat Assistant                  # 应用名称
VITE_APP_VERSION=1.0.0                          # 应用版本

# 功能开关
VITE_ENABLE_FILE_UPLOAD=true                    # 是否启用文件上传
VITE_ENABLE_WEB_SEARCH=true                     # 是否启用网络搜索
VITE_ENABLE_CODE_MODE=true                      # 是否启用代码模式
VITE_ENABLE_AGENT_MODE=true                     # 是否启用Agent模式
VITE_ENABLE_DATA_REPORT=true                    # 是否启用数据报表

# 文件上传限制
VITE_MAX_FILE_SIZE=10485760                     # 最大文件大小(字节)
VITE_ALLOWED_FILE_TYPES=image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx
```

### 2. Dify API密钥获取

1. 访问 [Dify控制台](https://dify.ai/)
2. 创建或选择一个应用
3. 在应用设置中找到API密钥
4. 复制密钥并配置到环境变量中

## 文件结构

```
src/
├── components/
│   └── AIChat.vue          # 主聊天组件
├── config/
│   └── index.js           # 配置文件
├── services/
│   └── api.js             # API服务
└── utils/
    └── chatUtils.js       # 聊天工具函数
```

## 组件使用

### 基本用法

```vue
<template>
  <AIChat />
</template>

<script>
import AIChat from './components/AIChat.vue'

export default {
  components: {
    AIChat
  }
}
</script>
```

### 高级配置

```javascript
// 在组件中自定义配置
import { config } from './config/index.js'

// 修改配置
config.dify.apiKey = 'your-custom-api-key'
config.chat.maxFileSize = 20 * 1024 * 1024 // 20MB
```

## API接口说明

### 主要API方法

| 方法 | 说明 | 参数 |
|------|------|------|
| `sendMessage(data)` | 发送消息 | 消息数据对象 |
| `getConversations()` | 获取会话列表 | 无 |
| `getMessages(conversationId)` | 获取会话消息 | 会话ID |
| `uploadFile(file)` | 上传文件 | File对象 |
| `stopGeneration(taskId)` | 停止生成 | 任务ID |
| `deleteConversation(conversationId)` | 删除会话 | 会话ID |
| `renameConversation(conversationId, name)` | 重命名会话 | 会话ID, 新名称 |

### 消息格式

```javascript
// 发送消息
{
  query: "用户输入的问题",
  conversation_id: "会话ID（可选）",
  inputs: {
    enable_web_search: 1,    // 是否启用网络搜索
    enable_code: 0,          // 是否启用代码模式
    enable_agent_mode: 0,    // 是否启用Agent模式
    enable_data_report: 0    // 是否启用数据报表
  }
}

// 流式响应格式
{
  event: "message",
  conversation_id: "会话ID",
  task_id: "任务ID",
  answer: "AI回复内容片段"
}
```

## 支持的文件类型

- **图片**: JPEG, PNG, GIF, WebP, SVG
- **文档**: PDF, DOC, DOCX, TXT, XLS, XLSX
- **音频**: MP3, WAV, OGG
- **视频**: MP4, AVI, MOV, WMV

## 功能特性

### 1. 实时对话
- 支持流式响应，实时显示AI回复
- 可以随时停止生成
- 支持重新生成回复

### 2. 文件处理
- 拖拽上传文件
- 文件类型和大小验证
- 上传进度显示
- 文件预览

### 3. 会话管理
- 自动保存对话历史
- 会话重命名和删除
- 会话搜索和过滤

### 4. 功能扩展
- 网络搜索：可以搜索实时信息
- 代码模式：优化代码相关问题
- Agent模式：启用智能代理功能
- 数据报表：生成数据分析报表

## 样式定制

组件使用TDesign设计规范，支持主题定制：

```css
/* 自定义主题色 */
:root {
  --td-brand-color: #667eea;
  --td-brand-color-hover: #5a6fd8;
}

/* 自定义聊天界面样式 */
.ai-chat-container {
  --chat-primary-color: #667eea;
  --chat-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 注意事项

1. **API密钥安全**: 不要在前端代码中硬编码API密钥，使用环境变量
2. **文件上传限制**: 根据需要调整文件大小和类型限制
3. **网络请求**: 确保网络环境能够访问Dify API
4. **浏览器兼容**: 建议使用现代浏览器，支持ES2020+特性

## 故障排除

### 常见问题

1. **API请求失败**
   - 检查API密钥是否正确
   - 检查网络连接
   - 查看浏览器控制台错误信息

2. **文件上传失败**
   - 检查文件大小和类型
   - 确认文件上传功能已启用
   - 检查网络状态

3. **消息不显示**
   - 检查Vue组件是否正确渲染
   - 查看控制台是否有JavaScript错误
   - 确认数据绑定是否正确

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础AI对话功能
- 集成文件上传
- 添加会话管理
- 实现功能开关

## 技术支持

如果遇到问题，请检查：
1. 环境变量配置是否正确
2. Dify API服务是否正常
3. 浏览器控制台错误信息
4. 网络连接状态

---

*基于Vue 3 + TDesign + Dify API 构建* 