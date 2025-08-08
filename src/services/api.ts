import type { 
  ApiResponse, 
  Conversation, 
  Message, 
  UploadResponse,
  Dataset,
  Document,
  DocumentSegment,
  WorkflowRun,
  AudioResponse,
  SuggestedQuestion,
  Parameters,
  MetaInfo,
  CompletionResponse,
  IndexingStatus
} from '@/types'
import { appConfig, debugLog, errorLog } from '@/config/env'

// API配置
const API_CONFIG = {
  baseUrl: appConfig.apiBaseUrl,
  endpoints: {
    // 会话型应用
    chatMessages: '/chat-messages',
    conversations: '/conversations',
    messages: '/messages',
    upload: '/files/upload',
    stop: '/chat-messages/{task_id}/stop',
    feedbacks: '/messages/{message_id}/feedbacks',
    suggested: '/messages/{message_id}/suggested',
    audioToText: '/audio-to-text',
    textToAudio: '/text-to-audio',
    parameters: '/parameters',
    meta: '/meta',
    
    // 知识库
    datasets: '/datasets',
    documents: '/datasets/{dataset_id}/documents',
    createDocByText: '/datasets/{dataset_id}/document/create-by-text',
    createDocByFile: '/datasets/{dataset_id}/document/create-by-file',
    updateDocByText: '/datasets/{dataset_id}/documents/{document_id}/update-by-text',
    updateDocByFile: '/datasets/{dataset_id}/documents/{document_id}/update-by-file',
    indexingStatus: '/datasets/{dataset_id}/documents/{batch}/indexing-status',
    segments: '/datasets/{dataset_id}/documents/{document_id}/segments',
    retrieve: '/datasets/{dataset_id}/retrieve',
    
    // 文本生成
    completionMessages: '/completion-messages',
    completionStop: '/completion-messages/{task_id}/stop',
    
    // 工作流
    workflowRun: '/workflows/run',
    workflowStatus: '/workflows/run/{workflow_id}',
    workflowStop: '/workflows/{task_id}/stop',
    workflowLogs: '/workflows/logs'
  }
}

// API基础类
class ApiService {
  private baseUrl: string
  private apiKey: string
  private knowledgeApiKey: string
  private user: string

  constructor() {
    this.baseUrl = appConfig.apiBaseUrl
    this.apiKey = appConfig.apiKey
    this.knowledgeApiKey = appConfig.knowledgeApiKey
    this.user = appConfig.user
    
    debugLog('API服务初始化', {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      hasKnowledgeApiKey: !!this.knowledgeApiKey,
      user: this.user
    })
  }

  // 更新API配置
  updateConfig(config: { baseUrl?: string; apiKey?: string; knowledgeApiKey?: string; user?: string }) {
    if (config.baseUrl) this.baseUrl = config.baseUrl
    if (config.apiKey) this.apiKey = config.apiKey
    if (config.knowledgeApiKey) this.knowledgeApiKey = config.knowledgeApiKey
    if (config.user) this.user = config.user
    
    debugLog('API配置更新', config)
  }

  // 获取请求头
  private getHeaders(isFormData = false, useKnowledgeKey = false): Record<string, string> {
    const apiKey = useKnowledgeKey ? this.knowledgeApiKey : this.apiKey
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
    }
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    // 调试日志
    debugLog('请求头信息', {
      useKnowledgeKey,
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
      authorizationHeader: headers['Authorization']
    })
    
    return headers
  }

  // 处理API响应
  private async handleResponse<T>(response: Response): Promise<T> {
    debugLog('API响应', {
      url: response.url,
      status: response.status,
      statusText: response.statusText
    })
    
    if (!response.ok) {
      const error = await response.text()
      const errorMessage = `API请求失败: ${response.status} - ${error}`
      errorLog(errorMessage)
      throw new Error(errorMessage)
    }
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }
    
    return response as unknown as T
  }

  // 处理流式响应
  private async handleStreamResponse(response: Response): Promise<ReadableStream> {
    if (!response.ok) {
      const errorMessage = `API请求失败: ${response.status}`
      errorLog(errorMessage)
      throw new Error(errorMessage)
    }
    
    return response.body as ReadableStream
  }

  // =============================================================================
  // 会话型应用 API
  // =============================================================================

  // 发送聊天消息
  async sendMessage(data: {
    inputs?: Record<string, any>
    query: string
    conversation_id?: string
    files?: Array<{
      type: string
      transfer_method: string
      url?: string
      upload_file_id?: string
    }>
  }): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.chatMessages}`
    
    // 处理输入参数，确保文件参数格式正确
    const processedInputs = data.inputs || {}
    
    // 如果有文件，需要特别处理输入参数
    if (data.files && data.files.length > 0) {
      data.files.forEach(file => {
        if (file.type === 'image' && file.upload_file_id) {
          processedInputs.input_image = file.upload_file_id
        } else if (file.type === 'document' && file.upload_file_id) {
          processedInputs.input_file = file.upload_file_id
        }
      })
    }
    
    // 清理空值输入参数
    Object.keys(processedInputs).forEach(key => {
      if (processedInputs[key] === '' || processedInputs[key] === null || processedInputs[key] === undefined) {
        delete processedInputs[key]
      }
    })

    const requestData = {
      inputs: processedInputs,
      query: data.query,
      response_mode: 'streaming',
      conversation_id: data.conversation_id || '',
      user: this.user,
      files: data.files || []
    }

    debugLog('发送聊天消息', requestData)

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      errorLog('发送消息失败', { status: response.status, error: errorText })
      throw new Error(`发送消息失败: ${response.status} - ${errorText}`)
    }

    return response
  }

  // 获取会话列表
  async getConversations(lastId = '', limit = 20): Promise<ApiResponse<Conversation[]>> {
    const params = new URLSearchParams({
      user: this.user,
      last_id: lastId,
      limit: limit.toString()
    })
    
    const url = `${this.baseUrl}${API_CONFIG.endpoints.conversations}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    return this.handleResponse<ApiResponse<Conversation[]>>(response)
  }

  // 获取会话消息
  async getMessages(conversationId: string, limit = 20): Promise<ApiResponse<Message[]>> {
    const params = new URLSearchParams({
      user: this.user,
      conversation_id: conversationId,
      limit: limit.toString()
    })
    
    const url = `${this.baseUrl}${API_CONFIG.endpoints.messages}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    const apiResponse = await this.handleResponse<{
      limit: number
      has_more: boolean
      data: Array<{
        id: string
        conversation_id: string
        inputs: Record<string, any>
        query: string
        answer: string
        message_files: Array<{
          id: string
          type: string
          url: string
          belongs_to: string
        }>
        feedback: null | 'like' | 'dislike'
        retriever_resources: any[]
        created_at: number
      }>
    }>(response)

    // 转换API数据格式为内部Message格式
    const messages: Message[] = []
    
    // 按时间倒序遍历（API返回的是最新的在前）
    for (const apiMessage of apiResponse.data.reverse()) {
      // 添加用户消息
      messages.push({
        id: `user-${apiMessage.id}`,
        type: 'user',
        content: apiMessage.query,
        timestamp: apiMessage.created_at * 1000, // 转换为毫秒
        file: apiMessage.message_files.find(f => f.belongs_to === 'user') ? {
          name: '用户上传的文件',
          type: 'file',
          url: apiMessage.message_files.find(f => f.belongs_to === 'user')?.url || ''
        } : undefined
      })

      // 添加助手消息
      messages.push({
        id: apiMessage.id,
        type: 'assistant',
        content: apiMessage.answer,
        timestamp: apiMessage.created_at * 1000 + 1, // 稍微晚一点
        feedback: apiMessage.feedback,
        file: apiMessage.message_files.find(f => f.belongs_to === 'assistant') ? {
          name: 'AI生成的文件',
          type: 'file', 
          url: apiMessage.message_files.find(f => f.belongs_to === 'assistant')?.url || ''
        } : undefined
      })
    }

    return {
      limit: apiResponse.limit,
      has_more: apiResponse.has_more,
      data: messages
    }
  }

  // 停止生成
  async stopGeneration(taskId: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.stop.replace('{task_id}', taskId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ user: this.user })
    })

    if (!response.ok) {
      throw new Error(`停止生成失败: ${response.status}`)
    }

    return response
  }

  // 上传文件
  async uploadFile(file: File): Promise<UploadResponse> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.upload}`
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user', this.user)

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData
    })

    return this.handleResponse<UploadResponse>(response)
  }

  // 重命名会话
  async renameConversation(conversationId: string, name: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.conversations}/${conversationId}/name`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        name: name,
        user: this.user 
      })
    })

    if (!response.ok) {
      throw new Error(`重命名会话失败: ${response.status}`)
    }

    return response
  }

  // 删除会话
  async deleteConversation(conversationId: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.conversations}/${conversationId}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ user: this.user })
    })

    if (!response.ok) {
      throw new Error(`删除会话失败: ${response.status}`)
    }

    return response
  }

  // 消息反馈
  async feedbackMessage(messageId: string, rating: 'like' | 'dislike'): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.feedbacks.replace('{message_id}', messageId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        rating: rating,
        user: this.user 
      })
    })

    if (!response.ok) {
      throw new Error(`消息反馈失败: ${response.status}`)
    }

    return response
  }

  // 获取建议问题
  async getSuggestedQuestions(messageId: string): Promise<{ data: string[] }> {
    const params = new URLSearchParams({
      user: this.user
    })
    
    const url = `${this.baseUrl}${API_CONFIG.endpoints.suggested.replace('{message_id}', messageId)}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    return this.handleResponse<{ data: string[] }>(response)
  }

  // 语音转文字
  async audioToText(audioFile: File): Promise<{ text: string }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.audioToText}`
    
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('user', this.user)

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData
    })

    return this.handleResponse<{ text: string }>(response)
  }

  // 文字转语音
  async textToAudio(text: string, messageId?: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.textToAudio}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        text: text,
        user: this.user,
        message_id: messageId,
        streaming: false
      })
    })

    if (!response.ok) {
      throw new Error(`文字转语音失败: ${response.status}`)
    }

    return response
  }

  // 获取参数配置
  async getParameters(): Promise<Parameters> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.parameters}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    return this.handleResponse<Parameters>(response)
  }

  // 获取工具图标
  async getMeta(): Promise<MetaInfo> {
    const params = new URLSearchParams({
      user: this.user
    })
    
    const url = `${this.baseUrl}${API_CONFIG.endpoints.meta}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    return this.handleResponse<MetaInfo>(response)
  }

  // =============================================================================
  // 知识库管理 API
  // =============================================================================

  // 创建知识库
  async createDataset(name: string, description?: string): Promise<Dataset> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.datasets}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(false, true),
      body: JSON.stringify({
        name: name,
        description: description,
        permission: 'only_me'
      })
    })

    return this.handleResponse<Dataset>(response)
  }

  // 获取知识库列表
  async getDatasets(page = 1, limit = 20): Promise<ApiResponse<Dataset[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    const url = `${this.baseUrl}${API_CONFIG.endpoints.datasets}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(false, true)
    })

    return this.handleResponse<ApiResponse<Dataset[]>>(response)
  }

  // 删除知识库
  async deleteDataset(datasetId: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.datasets}/${datasetId}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(false, true)
    })

    if (!response.ok) {
      throw new Error(`删除知识库失败: ${response.status}`)
    }

    return response
  }

  // 通过文本创建文档
  async createDocumentByText(datasetId: string, data: {
    name: string
    text: string
    indexing_technique?: 'high_quality' | 'economy'
    process_rule?: any
  }): Promise<{ document: Document; batch: string }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.createDocByText.replace('{dataset_id}', datasetId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(false, true),
      body: JSON.stringify({
        name: data.name,
        text: data.text,
        indexing_technique: data.indexing_technique || 'high_quality',
        process_rule: data.process_rule || { mode: 'automatic' }
      })
    })

    return this.handleResponse<{ document: Document; batch: string }>(response)
  }

  // 通过文件创建文档
  async createDocumentByFile(datasetId: string, file: File, options?: {
    indexing_technique?: 'high_quality' | 'economy'
    process_rule?: any
  }): Promise<{ document: Document; batch: string }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.createDocByFile.replace('{dataset_id}', datasetId)}`
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('data', JSON.stringify({
      indexing_technique: options?.indexing_technique || 'high_quality',
      process_rule: options?.process_rule || { mode: 'automatic' }
    }))

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(true, true),
      body: formData
    })

    return this.handleResponse<{ document: Document; batch: string }>(response)
  }

  // 获取文档列表
  async getDocuments(datasetId: string, page = 1, limit = 20): Promise<ApiResponse<Document[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    const url = `${this.baseUrl}${API_CONFIG.endpoints.documents.replace('{dataset_id}', datasetId)}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(false, true)
    })

    return this.handleResponse<ApiResponse<Document[]>>(response)
  }

  // 获取文档索引状态
  async getIndexingStatus(datasetId: string, batch: string): Promise<{ data: IndexingStatus[] }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.indexingStatus
      .replace('{dataset_id}', datasetId)
      .replace('{batch}', batch)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(false, true)
    })

    return this.handleResponse<{ data: IndexingStatus[] }>(response)
  }

  // 删除文档
  async deleteDocument(datasetId: string, documentId: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.documents
      .replace('{dataset_id}', datasetId)}/${documentId}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(false, true)
    })

    if (!response.ok) {
      throw new Error(`删除文档失败: ${response.status}`)
    }

    return response
  }

  // 通过文本更新文档
  async updateDocumentByText(datasetId: string, documentId: string, data: {
    name: string
    text: string
  }): Promise<{ document: Document; batch: string }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.updateDocByText
      .replace('{dataset_id}', datasetId)
      .replace('{document_id}', documentId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(false, true),
      body: JSON.stringify({
        name: data.name,
        text: data.text
      })
    })

    return this.handleResponse<{ document: Document; batch: string }>(response)
  }

  // 通过文件更新文档
  async updateDocumentByFile(datasetId: string, documentId: string, file: File, options?: {
    name?: string
    indexing_technique?: 'high_quality' | 'economy'
    process_rule?: any
  }): Promise<{ document: Document; batch: string }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.updateDocByFile
      .replace('{dataset_id}', datasetId)
      .replace('{document_id}', documentId)}`
    
    const formData = new FormData()
    formData.append('file', file)
    
    const requestData: any = {
      indexing_technique: options?.indexing_technique || 'high_quality',
      process_rule: options?.process_rule || { mode: 'automatic' }
    }
    
    if (options?.name) {
      requestData.name = options.name
    }
    
    formData.append('data', JSON.stringify(requestData))

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(true, true),
      body: formData
    })

    return this.handleResponse<{ document: Document; batch: string }>(response)
  }

  // 检索知识库
  async retrieveDataset(datasetId: string, query: string, options?: {
    retrieval_model?: {
      search_method?: 'keyword_search' | 'semantic_search' | 'hybrid_search'
      reranking_enable?: boolean
      reranking_mode?: string
      top_k?: number
      score_threshold_enabled?: boolean
      score_threshold?: number
    }
  }): Promise<{
    query: { content: string }
    records: Array<{
      segment: DocumentSegment
      score: number
      tsne_position: any
    }>
  }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.retrieve.replace('{dataset_id}', datasetId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(false, true),
      body: JSON.stringify({
        query: query,
        retrieval_model: options?.retrieval_model || {
          search_method: 'semantic_search',
          reranking_enable: false,
          top_k: 3,
          score_threshold_enabled: false
        }
      })
    })

    return this.handleResponse(response)
  }

  // =============================================================================
  // 文本生成型应用 API
  // =============================================================================

  // 文本生成
  async generateCompletion(data: {
    inputs: Record<string, any>
    response_mode?: 'streaming' | 'blocking'
    files?: Array<{
      type: string
      transfer_method: string
      url?: string
      upload_file_id?: string
    }>
  }): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.completionMessages}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        inputs: data.inputs,
        response_mode: data.response_mode || 'streaming',
        user: this.user,
        files: data.files || []
      })
    })

    if (!response.ok) {
      throw new Error(`文本生成失败: ${response.status}`)
    }

    return response
  }

  // 停止文本生成
  async stopCompletion(taskId: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.completionStop.replace('{task_id}', taskId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ user: this.user })
    })

    if (!response.ok) {
      throw new Error(`停止文本生成失败: ${response.status}`)
    }

    return response
  }

  // =============================================================================
  // 工作流应用 API
  // =============================================================================

  // 执行工作流
  async runWorkflow(data: {
    inputs: Record<string, any>
    response_mode?: 'streaming' | 'blocking'
    files?: Array<{
      type: string
      transfer_method: string
      url?: string
      upload_file_id?: string
    }>
  }): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.workflowRun}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        inputs: data.inputs,
        response_mode: data.response_mode || 'streaming',
        user: this.user,
        files: data.files || []
      })
    })

    if (!response.ok) {
      throw new Error(`执行工作流失败: ${response.status}`)
    }

    return response
  }

  // 获取工作流执行状态
  async getWorkflowStatus(workflowId: string): Promise<WorkflowRun> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.workflowStatus.replace('{workflow_id}', workflowId)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    return this.handleResponse<WorkflowRun>(response)
  }

  // 停止工作流
  async stopWorkflow(taskId: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.workflowStop.replace('{task_id}', taskId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ user: this.user })
    })

    if (!response.ok) {
      throw new Error(`停止工作流失败: ${response.status}`)
    }

    return response
  }

  // 获取工作流日志
  async getWorkflowLogs(limit = 20): Promise<{
    page: number
    limit: number
    total: number
    has_more: boolean
    data: WorkflowRun[]
  }> {
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    
    const url = `${this.baseUrl}${API_CONFIG.endpoints.workflowLogs}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  // =============================================================================
  // 文档分段管理 API
  // =============================================================================

  // 获取文档分段列表
  async getDocumentSegments(datasetId: string, documentId: string, page = 1, limit = 20): Promise<{
    data: DocumentSegment[]
    doc_form: string
    has_more?: boolean
    total?: number
    page?: number
    limit?: number
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    
    const url = `${this.baseUrl}${API_CONFIG.endpoints.segments
      .replace('{dataset_id}', datasetId)
      .replace('{document_id}', documentId)}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(false, true)
    })

    return this.handleResponse(response)
  }

  // 新增文档分段
  async createDocumentSegments(datasetId: string, documentId: string, segments: Array<{
    content: string
    answer?: string
    keywords?: string[]
  }>): Promise<{
    data: DocumentSegment[]
    doc_form: string
  }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.segments
      .replace('{dataset_id}', datasetId)
      .replace('{document_id}', documentId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(false, true),
      body: JSON.stringify({ segments })
    })

    return this.handleResponse(response)
  }

  // 更新文档分段
  async updateDocumentSegment(datasetId: string, documentId: string, segmentId: string, segment: {
    content: string
    answer?: string
    keywords?: string[]
    enabled?: boolean
  }): Promise<{
    data: DocumentSegment[]
    doc_form: string
  }> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.segments
      .replace('{dataset_id}', datasetId)
      .replace('{document_id}', documentId)}/${segmentId}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(false, true),
      body: JSON.stringify({ segment })
    })

    return this.handleResponse(response)
  }

  // 删除文档分段
  async deleteDocumentSegment(datasetId: string, documentId: string, segmentId: string): Promise<Response> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.segments
      .replace('{dataset_id}', datasetId)
      .replace('{document_id}', documentId)}/${segmentId}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(false, true)
    })

    if (!response.ok) {
      throw new Error(`删除文档分段失败: ${response.status}`)
    }

    return response
  }
}

// 创建API服务实例
const apiService = new ApiService()

export default apiService 