// 聊天工具函数
import { nextTick } from 'vue'

// 消息类型枚举
export const MessageType = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
}

// 生成唯一ID
export function generateId() {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 格式化时间
export function formatTime(timestamp) {
  if (!timestamp) return '刚刚'
  
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  return time.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理流式响应
export class StreamProcessor {
  constructor(onMessage, onComplete, onError) {
    this.onMessage = onMessage
    this.onComplete = onComplete
    this.onError = onError
    this.reader = null
    this.decoder = new TextDecoder()
    this.buffer = ''
  }

  async processStream(response) {
    try {
      this.reader = response.body.getReader()
      
      while (true) {
        const { done, value } = await this.reader.read()
        
        if (done) {
          this.onComplete?.()
          break
        }
        
        // 解码数据块
        const chunk = this.decoder.decode(value, { stream: true })
        this.buffer += chunk
        
        // 处理完整的行
        const lines = this.buffer.split('\n')
        this.buffer = lines.pop() || '' // 保留不完整的行
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          try {
            // 处理SSE格式的数据
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))
              this.onMessage?.(data)
            }
          } catch (error) {
            console.warn('解析流数据出错:', error, line)
          }
        }
      }
    } catch (error) {
      this.onError?.(error)
    }
  }

  stop() {
    if (this.reader) {
      this.reader.cancel()
      this.reader = null
    }
  }
}

// 消息渲染器
export class MessageRenderer {
  constructor() {
    this.messageQueue = []
    this.isProcessing = false
  }

  // 添加消息到渲染队列
  queueMessage(message) {
    this.messageQueue.push(message)
    this.processQueue()
  }

  // 处理渲染队列
  async processQueue() {
    if (this.isProcessing) return
    
    this.isProcessing = true
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      await this.renderMessage(message)
    }
    
    this.isProcessing = false
  }

  // 渲染单个消息
  async renderMessage(message) {
    // 使用Vue的nextTick确保DOM更新
    await nextTick()
    
    // 滚动到底部
    this.scrollToBottom()
  }

  // 滚动到底部
  scrollToBottom() {
    const chatContainer = document.querySelector('.chat-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }
}

// 文件处理工具
export class FileHandler {
  static getSupportedTypes() {
    return {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      document: [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
    }
  }

  static getFileType(mimeType) {
    const types = this.getSupportedTypes()
    
    for (const [type, mimes] of Object.entries(types)) {
      if (mimes.includes(mimeType)) {
        return type
      }
    }
    
    return 'unknown'
  }

  static getFileIcon(mimeType) {
    const type = this.getFileType(mimeType)
    
    const iconMap = {
      image: 'image',
      document: 'file-text',
      audio: 'sound',
      video: 'video',
      unknown: 'file'
    }
    
    return iconMap[type] || 'file'
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static validateFile(file, maxSize = 10 * 1024 * 1024) {
    const errors = []
    
    if (file.size > maxSize) {
      errors.push(`文件大小超过限制 (${this.formatFileSize(maxSize)})`)
    }
    
    const fileType = this.getFileType(file.type)
    if (fileType === 'unknown') {
      errors.push('不支持的文件类型')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Markdown渲染工具（简化版）
export class MarkdownRenderer {
  static render(content) {
    if (!content) return ''
    
    // 简单的Markdown渲染
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }
}

// 通知工具
export class NotificationManager {
  static show(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    
    // 添加样式
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      zIndex: '9999',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s ease'
    })
    
    // 根据类型设置背景色
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
    notification.style.backgroundColor = colors[type] || colors.info
    
    // 添加到页面
    document.body.appendChild(notification)
    
    // 显示动画
    setTimeout(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateY(0)'
    }, 10)
    
    // 自动移除
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateY(-20px)'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, duration)
  }
}

// 存储工具
export class StorageManager {
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('存储数据失败:', error)
    }
  }

  static getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn('读取数据失败:', error)
      return defaultValue
    }
  }

  static removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('删除数据失败:', error)
    }
  }
} 