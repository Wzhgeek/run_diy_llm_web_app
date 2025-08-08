import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation, Message, StreamEvent, UploadResponse } from '@/types'
import { ChatStatus } from '@/types'
import apiService from '@/services/api'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const conversations = ref<Conversation[]>([])
  const currentConversationId = ref<string | null>(null)
  const messages = ref<Message[]>([])
  const status = ref<ChatStatus>(ChatStatus.IDLE)
  const sidebarCollapsed = ref(false)
  const uploadedFiles = ref<UploadResponse[]>([])
  const suggestedQuestions = ref<string[]>([])
  const currentTaskId = ref<string | null>(null)
  const streamEvents = ref<StreamEvent[]>([])
  const isRecording = ref(false)
  const enableAudio = ref(false)

  // 计算属性
  const currentConversation = computed(() => 
    conversations.value.find(conv => conv.id === currentConversationId.value)
  )
  
  const isLoading = computed(() => status.value === ChatStatus.LOADING)
  const isTyping = computed(() => status.value === ChatStatus.TYPING)
  const hasUploadedFiles = computed(() => uploadedFiles.value.length > 0)
  const canSendMessage = computed(() => 
    status.value === ChatStatus.IDLE && !isRecording.value
  )

  // Actions
  const setStatus = (newStatus: ChatStatus) => {
    status.value = newStatus
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const addMessage = (message: Message) => {
    messages.value.push(message)
    updateConversationMessages()
  }

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    const index = messages.value.findIndex(msg => msg.id === messageId)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
      updateConversationMessages()
    }
  }

  const updateConversationMessages = () => {
    if (currentConversationId.value) {
      const conversation = conversations.value.find(conv => conv.id === currentConversationId.value)
      if (conversation) {
        conversation.messages = [...messages.value]
        conversation.updated_at = Date.now()
      }
    }
  }

  // =============================================================================
  // 会话管理
  // =============================================================================

  const loadConversations = async () => {
    try {
      setStatus(ChatStatus.LOADING)
      
      const response = await apiService.getConversations()
      if (response.data) {
        // 修复API返回的时间格式
        const fixedConversations = response.data.map(conv => ({
          ...conv,
          // 确保时间是毫秒级时间戳
          created_at: conv.created_at && typeof conv.created_at === 'number' 
            ? (conv.created_at < 10000000000 ? conv.created_at * 1000 : conv.created_at)
            : Date.now(),
          updated_at: conv.updated_at && typeof conv.updated_at === 'number'
            ? (conv.updated_at < 10000000000 ? conv.updated_at * 1000 : conv.updated_at) 
            : Date.now()
        }))
        conversations.value = fixedConversations
      }
    } catch (error) {
      console.error('加载会话列表失败:', error)
      setStatus(ChatStatus.ERROR)
      // 使用模拟数据作为fallback
      conversations.value = [
        {
          id: 'demo-1',
          name: '学术研究助手',
          summary: '关于机器学习论文分析的对话...',
          created_at: Date.now() - 86400000,
          updated_at: Date.now() - 3600000,
          messages: [
            {
              id: 'msg-1',
              type: 'user',
              content: '你好，能帮我分析一下机器学习的最新趋势吗？',
              timestamp: Date.now() - 7200000
            },
            {
              id: 'msg-2', 
              type: 'assistant',
              content: '当然！机器学习领域正在快速发展，主要趋势包括：\n\n1. **大型语言模型(LLM)**：GPT、BERT等预训练模型的广泛应用\n2. **多模态学习**：结合文本、图像、音频的综合AI系统\n3. **联邦学习**：保护隐私的分布式机器学习\n4. **自动机器学习(AutoML)**：降低ML门槛的自动化工具\n5. **可解释AI**：让AI决策过程更透明\n\n您对哪个方面比较感兴趣？',
              timestamp: Date.now() - 7100000
            },
            {
              id: 'msg-3',
              type: 'user', 
              content: '我对大型语言模型特别感兴趣，能详细介绍一下吗？',
              timestamp: Date.now() - 6900000
            },
            {
              id: 'msg-4',
              type: 'assistant',
              content: '大型语言模型(LLM)是当前AI领域的热点！\n\n**核心特点：**\n- 参数规模巨大（数十亿到数万亿参数）\n- 基于Transformer架构\n- 通过大规模文本预训练获得强大语言理解能力\n\n**主要模型：**\n- GPT系列（OpenAI）\n- BERT、RoBERTa（Google）\n- LLaMA（Meta）\n- PaLM（Google）\n- Claude（Anthropic）\n\n**应用场景：**\n- 文本生成与创作\n- 代码编程助手\n- 知识问答\n- 文档摘要\n- 语言翻译\n\n需要我深入某个特定方面吗？',
              timestamp: Date.now() - 6800000
            }
          ]
        },
        {
          id: 'demo-2',
          name: '数据分析咨询',
          summary: '关于数据可视化方法的讨论...',
          created_at: Date.now() - 172800000,
          updated_at: Date.now() - 86400000,
          messages: [
            {
              id: 'msg-5',
              type: 'user',
              content: '我有一些销售数据需要分析，应该用什么方法？',
              timestamp: Date.now() - 172800000
            },
            {
              id: 'msg-6',
              type: 'assistant', 
              content: '销售数据分析有很多有效方法：\n\n**描述性分析：**\n- 趋势分析：观察销售额随时间变化\n- 季节性分析：识别周期性模式\n- 地域分析：不同区域销售表现\n\n**可视化工具：**\n- 折线图：展示趋势\n- 条形图：比较不同类别\n- 热力图：地理分布\n- 漏斗图：销售流程转化\n\n**高级分析：**\n- 客户细分(RFM分析)\n- 预测建模\n- 异常检测\n\n您的数据包含哪些维度？',
              timestamp: Date.now() - 172700000
            }
          ]
        },
        {
          id: 'demo-3',
          name: '文献综述指导',
          summary: '如何撰写高质量的文献综述...',
          created_at: Date.now() - 259200000,
          updated_at: Date.now() - 172800000,
          messages: [
            {
              id: 'msg-7',
              type: 'user',
              content: '如何写好一篇文献综述？',
              timestamp: Date.now() - 259200000
            },
            {
              id: 'msg-8',
              type: 'assistant',
              content: '撰写优秀文献综述的关键步骤：\n\n**1. 确定研究范围**\n- 明确研究问题\n- 设定时间范围\n- 确定关键词\n\n**2. 系统性文献搜索**\n- 使用多个数据库\n- 制定搜索策略\n- 记录搜索过程\n\n**3. 文献筛选与评估**\n- 建立纳入/排除标准\n- 评估文献质量\n- 提取关键信息\n\n**4. 组织与分析**\n- 主题分类\n- 对比分析\n- 识别研究空白\n\n**5. 撰写与修改**\n- 逻辑结构清晰\n- 批判性分析\n- 提出研究建议\n\n需要在哪个步骤提供详细指导？',
              timestamp: Date.now() - 259100000
            }
          ]
        }
      ]
    } finally {
      setStatus(ChatStatus.IDLE)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      setStatus(ChatStatus.LOADING)
      currentConversationId.value = conversationId
      
      const response = await apiService.getMessages(conversationId)
      if (response.data) {
        messages.value = response.data
      } else {
        // 从本地conversations中加载消息
        const conversation = conversations.value.find(conv => conv.id === conversationId)
        if (conversation) {
          messages.value = conversation.messages || []
        }
      }
      
      setStatus(ChatStatus.IDLE)
    } catch (error) {
      console.error('加载会话消息失败:', error)
      setStatus(ChatStatus.ERROR)
      // 从本地conversations中加载消息作为fallback
      const conversation = conversations.value.find(conv => conv.id === conversationId)
      if (conversation) {
        messages.value = conversation.messages || []
      }
    }
  }

  const createNewConversation = () => {
    currentConversationId.value = null
    messages.value = []
    uploadedFiles.value = []
    suggestedQuestions.value = []
    currentTaskId.value = null
    streamEvents.value = []
    setStatus(ChatStatus.IDLE)
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      await apiService.deleteConversation(conversationId)
      
      conversations.value = conversations.value.filter(conv => conv.id !== conversationId)
      
      // 如果删除的是当前会话，创建新会话
      if (currentConversationId.value === conversationId) {
        createNewConversation()
      }
    } catch (error) {
      console.error('删除会话失败:', error)
      throw error
    }
  }

  const renameConversation = async (conversationId: string, newName: string) => {
    try {
      await apiService.renameConversation(conversationId, newName)
      
      // 更新本地会话名称
      const conversation = conversations.value.find(conv => conv.id === conversationId)
      if (conversation) {
        conversation.name = newName
      }
    } catch (error) {
      console.error('重命名会话失败:', error)
      throw error
    }
  }

  // =============================================================================
  // 消息发送
  // =============================================================================

  const sendMessage = async (content: string, options?: {
    files?: File[]
    inputs?: Record<string, any>
  }) => {
    if (!content.trim() && !options?.files?.length) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: Date.now(),
      file: options?.files?.[0] ? {
        name: options.files[0].name,
        type: options.files[0].type,
        url: URL.createObjectURL(options.files[0])
      } : undefined
    }

    addMessage(userMessage)
    setStatus(ChatStatus.TYPING)

    try {
      // 准备文件信息
      const fileData = uploadedFiles.value.map(file => ({
        type: file.mime_type.startsWith('image/') ? 'image' : 'document',
        transfer_method: 'local_file' as const,
        upload_file_id: file.id
      }))

      // 发送消息
      const response = await apiService.sendMessage({
        inputs: options?.inputs || {},
        query: content,
        conversation_id: currentConversationId.value || undefined,
        files: fileData
      })

      // 处理流式响应
      await handleStreamingResponse(response)

    } catch (error) {
      console.error('发送消息失败:', error)
      setStatus(ChatStatus.ERROR)
      
      // 添加错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，发送消息时出现错误。请稍后再试。',
        timestamp: Date.now()
      }
      addMessage(errorMessage)
    } finally {
      setStatus(ChatStatus.IDLE)
      clearUploadedFiles()
    }
  }

  const handleStreamingResponse = async (response: Response) => {
    if (!response.body) {
      throw new Error('流式响应无效')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let assistantMessage: Message | null = null

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // 保留最后一行可能不完整的数据
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '') continue
            
            try {
              const event = JSON.parse(data) as StreamEvent
              streamEvents.value.push(event)
              
              await handleStreamEvent(event, assistantMessage)
              
              // 更新assistantMessage引用
              if (event.event === 'message' && !assistantMessage) {
                assistantMessage = messages.value[messages.value.length - 1]
              }
            } catch (parseError) {
              console.warn('解析流式数据失败:', parseError, data)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  const handleStreamEvent = async (event: StreamEvent, assistantMessage: Message | null) => {
    switch (event.event) {
      case 'message':
        if (!assistantMessage) {
          // 创建新的助手消息
          const newMessage: Message = {
            id: event.message_id || Date.now().toString(),
            type: 'assistant',
            content: event.answer || '',
            timestamp: Date.now(),
            streaming: true
          }
          addMessage(newMessage)
        } else {
          // 更新现有消息
          assistantMessage.content += event.answer || ''
          updateMessage(assistantMessage.id, { content: assistantMessage.content })
        }
        break

      case 'message_end':
        if (assistantMessage) {
          updateMessage(assistantMessage.id, { streaming: false })
        }
        
        // 更新会话信息
        if (event.conversation_id && !currentConversationId.value) {
          currentConversationId.value = event.conversation_id
          // 重新加载会话列表以获取新创建的会话
          await loadConversations()
        }
        
        // 获取建议问题
        if (event.id) {
          await loadSuggestedQuestions(event.id)
        }
        
        // 设置任务ID用于可能的停止操作
        currentTaskId.value = event.id || null
        break

      case 'error':
        setStatus(ChatStatus.ERROR)
        console.error('流式响应错误:', event)
        break
    }
  }

  // =============================================================================
  // 文件上传
  // =============================================================================

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    try {
      const uploadResponse = await apiService.uploadFile(file)
      uploadedFiles.value.push(uploadResponse)
      return uploadResponse
    } catch (error) {
      console.error('上传文件失败:', error)
      throw error
    }
  }

  const removeUploadedFile = (fileId: string) => {
    uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== fileId)
  }

  const clearUploadedFiles = () => {
    uploadedFiles.value = []
  }

  // =============================================================================
  // 建议问题
  // =============================================================================

  const loadSuggestedQuestions = async (messageId: string) => {
    try {
      const response = await apiService.getSuggestedQuestions(messageId)
      if (response.data) {
        suggestedQuestions.value = response.data
      }
    } catch (error) {
      console.error('加载建议问题失败:', error)
      // 忽略错误，不显示建议问题
    }
  }

  const clearSuggestedQuestions = () => {
    suggestedQuestions.value = []
  }

  // =============================================================================
  // 音频功能
  // =============================================================================

  const startRecording = () => {
    isRecording.value = true
  }

  const stopRecording = () => {
    isRecording.value = false
  }

  const audioToText = async (audioFile: File): Promise<string> => {
    try {
      const response = await apiService.audioToText(audioFile)
      return response.text
    } catch (error) {
      console.error('语音转文字失败:', error)
      throw error
    }
  }

  const textToAudio = async (text: string, messageId?: string): Promise<Blob> => {
    try {
      const response = await apiService.textToAudio(text, messageId)
      return await response.blob()
    } catch (error) {
      console.error('文字转语音失败:', error)
      throw error
    }
  }

  // =============================================================================
  // 消息操作
  // =============================================================================

  const feedbackMessage = async (messageId: string, rating: 'like' | 'dislike') => {
    try {
      await apiService.feedbackMessage(messageId, rating)
      
      // 更新本地消息的反馈状态
      const message = messages.value.find(msg => msg.id === messageId)
      if (message) {
        updateMessage(messageId, { feedback: rating })
      }
    } catch (error) {
      console.error('消息反馈失败:', error)
      throw error
    }
  }

  const stopGeneration = async () => {
    if (currentTaskId.value) {
      try {
        await apiService.stopGeneration(currentTaskId.value)
        setStatus(ChatStatus.IDLE)
        
        // 更新最后一条消息的状态
        const lastMessage = messages.value[messages.value.length - 1]
        if (lastMessage && lastMessage.type === 'assistant' && lastMessage.streaming) {
          updateMessage(lastMessage.id, { 
            streaming: false, 
            content: lastMessage.content + '\n\n[生成已停止]' 
          })
        }
      } catch (error) {
        console.error('停止生成失败:', error)
        throw error
      }
    }
  }

  // =============================================================================
  // 工具方法
  // =============================================================================

  const getMessageById = (messageId: string) => {
    return messages.value.find(msg => msg.id === messageId)
  }

  const getConversationById = (conversationId: string) => {
    return conversations.value.find(conv => conv.id === conversationId)
  }

  const getRecentConversations = (limit = 10) => {
    return conversations.value
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, limit)
  }

  const searchMessages = (query: string) => {
    return messages.value.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    )
  }

  const getMessagesByType = (type: 'user' | 'assistant') => {
    return messages.value.filter(msg => msg.type === type)
  }

  // =============================================================================
  // 初始化和清理
  // =============================================================================

  const initialize = async () => {
    await loadConversations()
  }

  const reset = () => {
    conversations.value = []
    currentConversationId.value = null
    messages.value = []
    uploadedFiles.value = []
    suggestedQuestions.value = []
    currentTaskId.value = null
    streamEvents.value = []
    isRecording.value = false
    status.value = ChatStatus.IDLE
  }

  return {
    // 状态
    conversations,
    currentConversationId,
    messages,
    status,
    sidebarCollapsed,
    uploadedFiles,
    suggestedQuestions,
    currentTaskId,
    streamEvents,
    isRecording,
    enableAudio,
    
    // 计算属性
    currentConversation,
    isLoading,
    isTyping,
    hasUploadedFiles,
    canSendMessage,
    
    // Actions
    setStatus,
    toggleSidebar,
    addMessage,
    updateMessage,
    
    // 会话管理
    loadConversations,
    loadConversation,
    createNewConversation,
    deleteConversation,
    renameConversation,
    
    // 消息发送
    sendMessage,
    handleStreamingResponse,
    handleStreamEvent,
    
    // 文件上传
    uploadFile,
    removeUploadedFile,
    clearUploadedFiles,
    
    // 建议问题
    loadSuggestedQuestions,
    clearSuggestedQuestions,
    
    // 音频功能
    startRecording,
    stopRecording,
    audioToText,
    textToAudio,
    
    // 消息操作
    feedbackMessage,
    stopGeneration,
    
    // 工具方法
    getMessageById,
    getConversationById,
    getRecentConversations,
    searchMessages,
    getMessagesByType,
    
    // 初始化和清理
    initialize,
    reset
  }
}) 