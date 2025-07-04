// API配置文件
export const config = {
  // Dify API配置
  dify: {
    // 开发环境使用代理，生产环境使用直接地址
    baseUrl: import.meta.env.DEV ? '/api' : 'http://118.196.22.104:8888/v1',
    apiKey: 'app-2cJYxmDStBzrb47X22DRzLVr', // 请替换为您的Dify API密钥
    endpoints: {
      chat: '/chat-messages',
      conversations: '/conversations',
      upload: '/files/upload',
      stop: '/chat-messages/{message_id}/stop'
    }
  },
  
  // 应用配置
  app: {
    name: 'AI Chat Assistant',
    version: '1.0.0',
    user: 'web-user'
  },
  
  // 聊天配置
  chat: {
    maxMessageLength: 4000,
    streamTimeout: 30000,
    retryCount: 3,
    supportedFileTypes: {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      video: ['video/mp4', 'video/avi', 'video/mov']
    },
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }
}

// 环境变量支持
if (import.meta.env.VITE_DIFY_API_KEY) {
  config.dify.apiKey = import.meta.env.VITE_DIFY_API_KEY
}
if (import.meta.env.VITE_DIFY_BASE_URL) {
  config.dify.baseUrl = import.meta.env.VITE_DIFY_BASE_URL
}
if (import.meta.env.VITE_APP_NAME) {
  config.app.name = import.meta.env.VITE_APP_NAME
}
if (import.meta.env.VITE_MAX_FILE_SIZE) {
  config.chat.maxFileSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE)
}

export default config 