import type { StreamEvent } from '@/types'

/**
 * 解析Server-Sent Events格式的流式数据
 */
export async function parseStreamResponse(
  response: Response,
  onEvent: (event: StreamEvent) => void | Promise<void>,
  onError?: (error: Error) => void
): Promise<void> {
  if (!response.body) {
    throw new Error('响应体为空')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // 保留最后一行可能不完整的数据
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine === '') continue
        
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6).trim()
          if (data === '') continue
          
          try {
            const event = JSON.parse(data) as StreamEvent
            await onEvent(event)
          } catch (parseError) {
            console.warn('解析流式数据失败:', parseError, data)
            if (onError) {
              onError(new Error(`解析失败: ${parseError}`))
            }
          }
        }
      }
    }
  } catch (error) {
    if (onError) {
      onError(error as Error)
    } else {
      throw error
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * 创建一个流式响应处理器
 */
export class StreamHandler {
  private eventHandlers = new Map<string, Array<(event: StreamEvent) => void | Promise<void>>>()
  private errorHandlers: Array<(error: Error) => void> = []
  private isProcessing = false

  /**
   * 注册事件处理器
   */
  on(eventType: string, handler: (event: StreamEvent) => void | Promise<void>): this {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
    return this
  }

  /**
   * 注册错误处理器
   */
  onError(handler: (error: Error) => void): this {
    this.errorHandlers.push(handler)
    return this
  }

  /**
   * 处理单个事件
   */
  private async handleEvent(event: StreamEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.event) || []
    const allHandlers = this.eventHandlers.get('*') || []
    
    // 执行特定事件的处理器
    for (const handler of handlers) {
      try {
        await handler(event)
      } catch (error) {
        this.handleError(error as Error)
      }
    }
    
    // 执行通用事件处理器
    for (const handler of allHandlers) {
      try {
        await handler(event)
      } catch (error) {
        this.handleError(error as Error)
      }
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error)
      } catch (handlerError) {
        console.error('错误处理器执行失败:', handlerError)
      }
    }
  }

  /**
   * 处理流式响应
   */
  async processStream(response: Response): Promise<void> {
    if (this.isProcessing) {
      throw new Error('已有流正在处理中')
    }

    this.isProcessing = true
    try {
      await parseStreamResponse(
        response,
        (event) => this.handleEvent(event),
        (error) => this.handleError(error)
      )
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 清理所有处理器
   */
  clear(): void {
    this.eventHandlers.clear()
    this.errorHandlers = []
  }

  /**
   * 获取当前处理状态
   */
  get processing(): boolean {
    return this.isProcessing
  }
}

/**
 * 创建一个新的流处理器实例
 */
export function createStreamHandler(): StreamHandler {
  return new StreamHandler()
}

/**
 * 处理Dify聊天流式响应的预设处理器
 */
export function createChatStreamHandler(callbacks: {
  onMessage?: (content: string, messageId?: string) => void
  onMessageEnd?: (messageId?: string, conversationId?: string, metadata?: any) => void
  onThought?: (thought: string, toolName?: string) => void
  onError?: (error: string) => void
  onComplete?: () => void
}): StreamHandler {
  const handler = new StreamHandler()

  handler.on('message', (event) => {
    if (callbacks.onMessage && event.answer) {
      callbacks.onMessage(event.answer, event.message_id)
    }
  })

  handler.on('message_end', (event) => {
    if (callbacks.onMessageEnd) {
      callbacks.onMessageEnd(event.id, event.conversation_id, event.metadata)
    }
    if (callbacks.onComplete) {
      callbacks.onComplete()
    }
  })

  handler.on('agent_thought', (event) => {
    if (callbacks.onThought && event.data?.thought) {
      callbacks.onThought(event.data.thought, event.data.tool)
    }
  })

  handler.on('error', (event) => {
    if (callbacks.onError) {
      callbacks.onError(event.data?.message || '未知错误')
    }
  })

  handler.onError((error) => {
    if (callbacks.onError) {
      callbacks.onError(error.message)
    }
  })

  return handler
}

/**
 * 处理Dify工作流流式响应的预设处理器
 */
export function createWorkflowStreamHandler(callbacks: {
  onWorkflowStart?: (workflowRun: any) => void
  onNodeStart?: (node: any) => void
  onNodeFinish?: (node: any) => void
  onWorkflowFinish?: (workflowRun: any) => void
  onError?: (error: string) => void
}): StreamHandler {
  const handler = new StreamHandler()

  handler.on('workflow_started', (event) => {
    if (callbacks.onWorkflowStart && event.data) {
      callbacks.onWorkflowStart(event.data)
    }
  })

  handler.on('node_started', (event) => {
    if (callbacks.onNodeStart && event.data) {
      callbacks.onNodeStart(event.data)
    }
  })

  handler.on('node_finished', (event) => {
    if (callbacks.onNodeFinish && event.data) {
      callbacks.onNodeFinish(event.data)
    }
  })

  handler.on('workflow_finished', (event) => {
    if (callbacks.onWorkflowFinish && event.data) {
      callbacks.onWorkflowFinish(event.data)
    }
  })

  handler.on('error', (event) => {
    if (callbacks.onError) {
      callbacks.onError(event.data?.message || '工作流执行错误')
    }
  })

  handler.onError((error) => {
    if (callbacks.onError) {
      callbacks.onError(error.message)
    }
  })

  return handler
}

/**
 * 工具函数：检查响应是否为流式响应
 */
export function isStreamResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type')
  return contentType?.includes('text/event-stream') || 
         contentType?.includes('text/plain') ||
         false
}

/**
 * 工具函数：创建中断控制器
 */
export function createAbortController(): {
  controller: AbortController
  signal: AbortSignal
  abort: () => void
} {
  const controller = new AbortController()
  
  return {
    controller,
    signal: controller.signal,
    abort: () => controller.abort()
  }
} 