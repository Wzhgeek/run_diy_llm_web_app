# Dify API 集成使用说明

本项目已完成与 Dify API 的全面集成，支持会话型应用、知识库管理、工作流应用等完整功能。

## 🚀 功能概览

### 1. 会话型应用 (AI Chat)
- ✅ 流式对话响应
- ✅ 多模态文件上传（图片、文档、音频）
- ✅ 会话历史管理
- ✅ 消息反馈功能
- ✅ 建议问题生成
- ✅ 语音转文字/文字转语音

### 2. 知识库管理 (Knowledge Base)
- ✅ 知识库创建/删除
- ✅ 文档上传（文本/文件）
- ✅ 实时索引状态监控
- ✅ 知识库检索
- ✅ 分段管理

### 3. 工作流应用 (Workflow)
- ✅ 工作流执行
- ✅ 实时状态监控
- ✅ 节点执行跟踪
- ✅ 执行日志查看

### 4. 文本生成应用 (Completion)
- ✅ 文本生成
- ✅ 流式/阻塞模式
- ✅ 多模态输入支持

## 📋 环境配置

### 必需的环境变量

```bash
# API 配置
VITE_API_BASE_URL=http://127.0.0.1:5001/v1  # Dify API 地址
VITE_API_KEY=your-dify-api-key-here         # Dify API 密钥
VITE_USER=your-user-id-here                 # 用户标识

# 功能开关
VITE_ENABLE_AUDIO=true                      # 启用音频功能
VITE_ENABLE_FILE_UPLOAD=true               # 启用文件上传
VITE_ENABLE_KNOWLEDGE_BASE=true            # 启用知识库
VITE_ENABLE_WORKFLOW=true                  # 启用工作流

# 文件上传限制 (MB)
VITE_MAX_FILE_SIZE=50                      # 通用文件大小限制
VITE_MAX_IMAGE_SIZE=10                     # 图片文件大小限制
VITE_MAX_AUDIO_SIZE=50                     # 音频文件大小限制
VITE_MAX_VIDEO_SIZE=100                    # 视频文件大小限制
```

### 配置验证

在应用启动时会自动验证配置：

```typescript
import { validateConfig } from '@/config/env'

const { isValid, errors } = validateConfig()
if (!isValid) {
  console.error('配置验证失败:', errors)
}
```

## 🛠 API 服务使用

### 基础用法

```typescript
import apiService from '@/services/api'

// 更新API配置
apiService.updateConfig({
  baseUrl: 'http://your-dify-instance:5001/v1',
  apiKey: 'your-api-key',
  user: 'your-user-id'
})
```

### 会话型应用

```typescript
// 发送消息
const response = await apiService.sendMessage({
  query: '你好，请介绍一下你自己',
  conversation_id: 'optional-conversation-id',
  inputs: { key: 'value' },
  files: [
    {
      type: 'image',
      transfer_method: 'local_file',
      upload_file_id: 'file-id'
    }
  ]
})

// 处理流式响应
const reader = response.body.getReader()
// ... 流式处理逻辑
```

### 知识库管理

```typescript
// 创建知识库
const dataset = await apiService.createDataset('我的知识库', '描述信息')

// 上传文档
const result = await apiService.createDocumentByFile(dataset.id, file)

// 检索知识库
const searchResult = await apiService.retrieveDataset(dataset.id, '检索关键词', {
  retrieval_model: {
    search_method: 'semantic_search',
    top_k: 3
  }
})
```

### 工作流应用

```typescript
// 执行工作流
const response = await apiService.runWorkflow({
  inputs: { query: '处理这个请求' },
  response_mode: 'streaming'
})

// 获取工作流状态
const status = await apiService.getWorkflowStatus('workflow-run-id')
```

## 📱 Store 使用指南

### Chat Store

```typescript
import { useChatStore } from '@/stores'

const chatStore = useChatStore()

// 发送消息
await chatStore.sendMessage('你好', {
  files: [uploadedFile],
  inputs: { context: 'research' }
})

// 上传文件
const uploadResponse = await chatStore.uploadFile(file)

// 语音功能
const text = await chatStore.audioToText(audioFile)
const audioBlob = await chatStore.textToAudio('要转换的文本')
```

### Knowledge Store

```typescript
import { useKnowledgeStore } from '@/stores'

const knowledgeStore = useKnowledgeStore()

// 初始化
await knowledgeStore.initialize()

// 创建知识库
const dataset = await knowledgeStore.createDataset('知识库名称')

// 上传文档
await knowledgeStore.createDocumentByFile(dataset.id, file)

// 检索
const results = await knowledgeStore.retrieveKnowledge(dataset.id, '查询词')
```

### Workflow Store

```typescript
import { useWorkflowStore } from '@/stores'

const workflowStore = useWorkflowStore()

// 执行工作流
await workflowStore.runWorkflow({
  query: '处理请求',
  context: 'additional data'
})

// 监控状态
console.log(workflowStore.isRunning)
console.log(workflowStore.currentWorkflowRun)
```

## 🌊 流式响应处理

### 使用流式处理工具

```typescript
import { createChatStreamHandler } from '@/utils/stream'

const handler = createChatStreamHandler({
  onMessage: (content, messageId) => {
    console.log('收到消息片段:', content)
  },
  onMessageEnd: (messageId, conversationId) => {
    console.log('消息接收完成')
  },
  onError: (error) => {
    console.error('流式响应错误:', error)
  }
})

await handler.processStream(response)
```

### 自定义流式处理

```typescript
import { StreamHandler } from '@/utils/stream'

const handler = new StreamHandler()

handler
  .on('message', (event) => {
    // 处理消息事件
  })
  .on('workflow_started', (event) => {
    // 处理工作流开始事件
  })
  .onError((error) => {
    // 处理错误
  })

await handler.processStream(response)
```

## 🔧 错误处理

### API 错误处理

```typescript
try {
  const result = await apiService.sendMessage({ query: 'test' })
} catch (error) {
  if (error.message.includes('401')) {
    // API Key 无效
  } else if (error.message.includes('429')) {
    // 请求频率超限
  } else {
    // 其他错误
  }
}
```

### Store 错误处理

```typescript
const chatStore = useChatStore()

// 监听错误状态
watch(() => chatStore.status, (status) => {
  if (status === ChatStatus.ERROR) {
    // 处理错误状态
  }
})
```

## 📊 文件上传

### 支持的文件类型

- **图片**: png, jpg, jpeg, webp, gif
- **文档**: txt, pdf, doc, docx, md, csv, xlsx  
- **音频**: mp3, wav, m4a, mp4, mpeg, mpga, webm

### 文件验证

```typescript
import { isFileTypeSupported, isFileSizeValid } from '@/config/env'

if (!isFileTypeSupported(file.name)) {
  throw new Error('不支持的文件类型')
}

if (!isFileSizeValid(file)) {
  throw new Error('文件大小超出限制')
}
```

## 🎯 最佳实践

### 1. 配置管理
- 使用环境变量管理敏感信息
- 在生产环境中验证所有必需配置
- 使用配置验证函数检查设置

### 2. 错误处理
- 为所有 API 调用添加错误处理
- 提供用户友好的错误提示
- 记录详细的错误信息用于调试

### 3. 性能优化
- 使用流式响应提升用户体验
- 合理设置文件大小限制
- 实现请求缓存机制

### 4. 用户体验
- 显示加载状态和进度
- 提供操作反馈
- 支持操作撤销/重试

## 🚨 注意事项

1. **API Key 安全**: 请勿在客户端代码中硬编码 API Key
2. **文件大小**: 注意文件上传大小限制，避免请求超时
3. **并发控制**: 避免同时发起过多 API 请求
4. **错误恢复**: 实现适当的错误恢复机制
5. **数据验证**: 对用户输入进行适当验证

## 🔗 相关链接

- [Dify 官方文档](https://docs.dify.ai/)
- [API 参考文档](https://docs.dify.ai/api)
- [错误码参考](https://docs.dify.ai/api/error-codes)

## 📞 技术支持

如有问题，请查看：
1. 控制台错误日志
2. 网络请求状态
3. API 配置是否正确
4. Dify 服务是否正常运行 