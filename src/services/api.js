import config from '../config/index.js'

// API基础类
class ApiService {
  constructor() {
    this.baseUrl = config.dify.baseUrl
    this.apiKey = config.dify.apiKey
    this.user = config.app.user
  }

  // 获取请求头
  getHeaders(isFormData = false) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
    }
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    return headers
  }

  // 处理API响应
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API请求失败: ${response.status} - ${error}`)
    }
    return response
  }

  // 发送聊天消息
  async sendMessage(data) {
    const url = `${this.baseUrl}${config.dify.endpoints.chat}`
    
    const requestData = {
      inputs: data.inputs || {},
      query: data.query || '',
      response_mode: 'streaming',
      conversation_id: data.conversation_id || '',
      user: this.user,
      auto_generate_name: true
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData)
    })

    return this.handleResponse(response)
  }

  // 获取会话列表
  async getConversations(lastId = '', limit = 20) {
    const params = new URLSearchParams({
      user: this.user,
      last_id: lastId,
      limit: limit.toString()
    })
    
    const url = `${this.baseUrl}${config.dify.endpoints.conversations}?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('获取会话列表失败')
    }

    return response.json()
  }

  // 获取会话消息
  async getMessages(conversationId, limit = 20) {
    const params = new URLSearchParams({
      user: this.user,
      conversation_id: conversationId || '',
      limit: limit.toString()
    })
    
    // 使用正确的消息端点，baseUrl已经包含/v1
    const url = `${this.baseUrl}/messages?${params}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`获取消息列表失败: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  // 停止生成
  async stopGeneration(taskId) {
    const url = `${this.baseUrl}${config.dify.endpoints.stop.replace('{message_id}', taskId)}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ user: this.user })
    })

    return this.handleResponse(response)
  }

  // 上传文件
  async uploadFile(file) {
    const url = `${this.baseUrl}${config.dify.endpoints.upload}`
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user', this.user)

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData
    })

    if (!response.ok) {
      throw new Error('文件上传失败')
    }

    return response.json()
  }

  // 重命名会话
  async renameConversation(conversationId, name) {
    const url = `${this.baseUrl}${config.dify.endpoints.conversations}/${conversationId}/name`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        name: name,
        user: this.user 
      })
    })

    return this.handleResponse(response)
  }

  // 删除会话
  async deleteConversation(conversationId) {
    const url = `${this.baseUrl}${config.dify.endpoints.conversations}/${conversationId}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ user: this.user })
    })

    return this.handleResponse(response)
  }
}

// 创建API服务实例
const apiService = new ApiService()

export default apiService 