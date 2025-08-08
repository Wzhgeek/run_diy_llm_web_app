// 环境配置
interface AppConfig {
  // API配置
  apiBaseUrl: string
  apiKey: string
  knowledgeApiKey: string  // 添加知识库专用API密钥
  user: string
  
  // 应用配置
  appTitle: string
  appDescription: string
  
  // 功能开关
  enableAudio: boolean
  enableFileUpload: boolean
  enableKnowledgeBase: boolean
  enableWorkflow: boolean
  
  // 文件上传限制 (MB)
  maxFileSize: number
  maxImageSize: number
  maxAudioSize: number
  maxVideoSize: number
  
  // 支持的文件类型
  supportedImageTypes: string[]
  supportedDocumentTypes: string[]
  supportedAudioTypes: string[]
  
  // 调试配置
  debug: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  
  // 主题配置
  defaultTheme: 'light' | 'dark'
  enableThemeSwitch: boolean
}

// 默认配置
const defaultConfig: AppConfig = {
  // API配置
  apiBaseUrl: 'http://118.196.22.104:8888/v1',
  apiKey: 'app-2cJYxmDStBzrb47X22DRzLVr',
  knowledgeApiKey: 'dataset-ZRqkO8WqC0phHATJ2u3T6VZy',
  user: 'web-user',
  
  // 应用配置
  appTitle: '智研助手',
  appDescription: 'AI Research Assistant',
  
  // 功能开关
  enableAudio: false,
  enableFileUpload: true,
  enableKnowledgeBase: true,
  enableWorkflow: true,
  
  // 文件上传限制
  maxFileSize: 15,
  maxImageSize: 10,
  maxAudioSize: 50,
  maxVideoSize: 100,
  
  // 支持的文件类型
  supportedImageTypes: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'],
  supportedDocumentTypes: ['txt', 'pdf', 'doc', 'docx', 'md', 'csv', 'xlsx'],
  supportedAudioTypes: ['mp3', 'wav', 'm4a', 'mp4', 'mpeg', 'mpga', 'webm'],
  
  // 调试配置
  debug: true,
  logLevel: 'debug',
  
  // 主题配置
  defaultTheme: 'light',
  enableThemeSwitch: true
}

// 从环境变量获取配置
function getEnvConfig(): Partial<AppConfig> {
  return {
    // API配置
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    apiKey: import.meta.env.VITE_API_KEY,
    knowledgeApiKey: import.meta.env.VITE_KNOWLEDGE_API_KEY,
    user: import.meta.env.VITE_USER,
    
    // 应用配置
    appTitle: import.meta.env.VITE_APP_TITLE,
    appDescription: import.meta.env.VITE_APP_DESCRIPTION,
    
    // 功能开关
    enableAudio: import.meta.env.VITE_ENABLE_AUDIO === 'true',
    enableFileUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',
    enableKnowledgeBase: import.meta.env.VITE_ENABLE_KNOWLEDGE_BASE === 'true',
    enableWorkflow: import.meta.env.VITE_ENABLE_WORKFLOW === 'true',
    
    // 文件上传限制
    maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE),
    maxImageSize: Number(import.meta.env.VITE_MAX_IMAGE_SIZE),
    maxAudioSize: Number(import.meta.env.VITE_MAX_AUDIO_SIZE),
    maxVideoSize: Number(import.meta.env.VITE_MAX_VIDEO_SIZE),
    
    // 支持的文件类型
    supportedImageTypes: import.meta.env.VITE_SUPPORTED_IMAGE_TYPES?.split(','),
    supportedDocumentTypes: import.meta.env.VITE_SUPPORTED_DOCUMENT_TYPES?.split(','),
    supportedAudioTypes: import.meta.env.VITE_SUPPORTED_AUDIO_TYPES?.split(','),
    
    // 调试配置
    debug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
    
    // 主题配置
    defaultTheme: import.meta.env.VITE_DEFAULT_THEME as 'light' | 'dark',
    enableThemeSwitch: import.meta.env.VITE_ENABLE_THEME_SWITCH === 'true'
  }
}

// 合并配置
function createConfig(): AppConfig {
  const envConfig = getEnvConfig()
  
  // 过滤掉undefined的值
  const filteredEnvConfig = Object.fromEntries(
    Object.entries(envConfig).filter(([_, value]) => value !== undefined)
  )
  
  return {
    ...defaultConfig,
    ...filteredEnvConfig
  }
}

// 导出配置实例
export const appConfig = createConfig()

// 配置验证
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 检查必需的API配置
  if (!appConfig.apiKey) {
    errors.push('API Key 未配置')
  }
  
  if (!appConfig.apiBaseUrl) {
    errors.push('API Base URL 未配置')
  }
  
  // 检查文件大小限制
  if (appConfig.maxFileSize <= 0) {
    errors.push('文件大小限制配置无效')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 获取文件类型支持信息
export function getFileTypeSupport() {
  return {
    images: appConfig.supportedImageTypes,
    documents: appConfig.supportedDocumentTypes,
    audio: appConfig.supportedAudioTypes,
    
    // 获取所有支持的文件类型
    all: [
      ...appConfig.supportedImageTypes,
      ...appConfig.supportedDocumentTypes,
      ...appConfig.supportedAudioTypes
    ]
  }
}

// 检查文件类型是否支持
export function isFileTypeSupported(fileType: string): boolean {
  const extension = fileType.toLowerCase().replace('.', '')
  const allTypes = getFileTypeSupport().all
  return allTypes.includes(extension)
}

// 检查文件大小是否符合限制
export function isFileSizeValid(file: File): boolean {
  const fileSizeMB = file.size / (1024 * 1024)
  
  if (file.type.startsWith('image/')) {
    return fileSizeMB <= appConfig.maxImageSize
  } else if (file.type.startsWith('audio/')) {
    return fileSizeMB <= appConfig.maxAudioSize
  } else if (file.type.startsWith('video/')) {
    return fileSizeMB <= appConfig.maxVideoSize
  } else {
    return fileSizeMB <= appConfig.maxFileSize
  }
}

// 获取文件大小限制说明
export function getFileSizeLimitText(fileType?: string): string {
  if (fileType?.startsWith('image/')) {
    return `图片文件不能超过 ${appConfig.maxImageSize}MB`
  } else if (fileType?.startsWith('audio/')) {
    return `音频文件不能超过 ${appConfig.maxAudioSize}MB`
  } else if (fileType?.startsWith('video/')) {
    return `视频文件不能超过 ${appConfig.maxVideoSize}MB`
  } else {
    return `文件不能超过 ${appConfig.maxFileSize}MB`
  }
}

// 调试日志
export function debugLog(message: string, ...args: any[]): void {
  if (appConfig.debug && appConfig.logLevel === 'debug') {
    console.log(`[DEBUG] ${message}`, ...args)
  }
}

// 信息日志
export function infoLog(message: string, ...args: any[]): void {
  if (['debug', 'info'].includes(appConfig.logLevel)) {
    console.info(`[INFO] ${message}`, ...args)
  }
}

// 警告日志
export function warnLog(message: string, ...args: any[]): void {
  if (['debug', 'info', 'warn'].includes(appConfig.logLevel)) {
    console.warn(`[WARN] ${message}`, ...args)
  }
}

// 错误日志
export function errorLog(message: string, ...args: any[]): void {
  console.error(`[ERROR] ${message}`, ...args)
}

export default appConfig 