<template>
  <div class="ai-chat-container">
    <!-- 左侧历史会话区域 -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">历史会话</h3>
        <t-button 
          theme="primary" 
          variant="outline" 
          size="small" 
          class="new-chat-btn"
          @click="startNewConversation">
          <t-icon name="add" size="16px" />
          新建对话
        </t-button>
      </div>
      
      <div class="chat-history">
        <div 
          v-for="conversation in conversations" 
          :key="conversation.id"
          :class="['history-item', { active: conversation.id === currentConversationId }]"
          @click="loadConversation(conversation.id)">
          <div class="history-content">
            <div class="history-title">{{ conversation.name || '新对话' }}</div>
            <div class="history-preview">{{ conversation.summary || '点击查看对话内容...' }}</div>
            <div class="history-time">{{ formatTime(conversation.created_at) }}</div>
          </div>
          <div class="history-actions">
            <t-button variant="text" size="small" @click.stop="renameConversation(conversation.id)">
              <t-icon name="edit" size="14px" />
            </t-button>
            <t-button variant="text" size="small" @click.stop="deleteConversation(conversation.id)">
              <t-icon name="delete" size="14px" />
            </t-button>
          </div>
        </div>
        
        <!-- 默认示例对话 -->
        <div v-if="conversations.length === 0" class="history-item active">
          <div class="history-content">
            <div class="history-title">学术研究助手</div>
            <div class="history-preview">开始您的学术研究之旅...</div>
            <div class="history-time">刚刚</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <!-- 工具栏 -->
      <div class="chat-toolbar">
        <div class="feature-toggles">
          <t-button 
            variant="text" 
            size="small" 
            :class="{ active: features.webSearch }"
            @click="toggleFeature('webSearch')">
            <t-icon name="internet" size="16px" />
            网络搜索
          </t-button>
          <t-button 
            variant="text" 
            size="small" 
            :class="{ active: features.codeMode }"
            @click="toggleFeature('codeMode')">
            <t-icon name="code" size="16px" />
            代码模式
          </t-button>
          <t-button 
            variant="text" 
            size="small" 
            :class="{ active: features.agentMode }"
            @click="toggleFeature('agentMode')">
            <t-icon name="user-setting" size="16px" />
            Agent模式
          </t-button>
          <t-button 
            variant="text" 
            size="small" 
            :class="{ active: features.dataReport }"
            @click="toggleFeature('dataReport')">
            <t-icon name="chart-bar" size="16px" />
            数据报表
          </t-button>
        </div>
        
        <div class="file-upload-area" v-if="uploadedFile">
          <div class="file-preview">
            <t-icon :name="FileHandler.getFileIcon(uploadedFile.type)" size="16px" />
            <span class="file-name">{{ uploadedFile.name }}</span>
            <span class="file-size">({{ FileHandler.formatFileSize(uploadedFile.size) }})</span>
            <t-button variant="text" size="small" @click="clearUploadedFile">
              <t-icon name="close" size="14px" />
            </t-button>
          </div>
        </div>
      </div>
      
      <!-- 聊天内容区域 -->
      <div class="chat-content">
        <div class="chat-messages">
          <!-- 动态消息列表 -->
          <div 
            v-for="(message, index) in messages" 
            :key="message.id"
            :class="['message-item', message.type]">
            
            <!-- 头像 -->
            <div class="message-avatar">
              <t-icon 
                :name="message.type === MessageType.USER ? 'user' : 'logo-chrome'" 
                size="24px" />
            </div>
            
            <!-- 消息内容 -->
            <div class="message-content">
              <!-- 文件附件 -->
              <div v-if="message.file" class="message-file">
                <div class="file-attachment">
                  <t-icon :name="FileHandler.getFileIcon(message.file.type)" size="16px" />
                  <span>{{ message.file.name }}</span>
                </div>
              </div>
              
              <!-- 消息文本 -->
              <div class="message-text" v-html="message.content"></div>
              
              <!-- 检索资源显示 -->
              <div v-if="message.retrieverResources && message.retrieverResources.length > 0" class="retriever-resources">
                <div class="resources-title">
                  <t-icon name="link" size="14px" />
                  参考资源
                </div>
                <div class="resources-list">
                  <div 
                    v-for="resource in message.retrieverResources" 
                    :key="resource.segment_id"
                    class="resource-item">
                    <div class="resource-info">
                      <span class="resource-name">{{ resource.document_name }}</span>
                      <span class="resource-score">相关度: {{ (resource.score * 100).toFixed(1) }}%</span>
                    </div>
                    <div class="resource-content">{{ resource.content.substring(0, 200) }}...</div>
                  </div>
                </div>
              </div>
              
              <!-- 流式加载指示器 -->
              <div v-if="message.streaming" class="typing-indicator">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              
              <!-- 消息操作 -->
              <div class="message-actions" v-if="!message.streaming">
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                <div class="message-buttons">
                  <t-button variant="text" size="small" @click="copyMessage(message)">
                    <t-icon name="copy" size="14px" />
                  </t-button>
                  <t-button 
                    v-if="message.type === MessageType.ASSISTANT" 
                    variant="text" 
                    size="small" 
                    @click="regenerateMessage(index)">
                    <t-icon name="refresh" size="14px" />
                  </t-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 欢迎提示 -->
          <div v-if="messages.length === 0" class="welcome-screen">
            <div class="welcome-content">
              <div class="welcome-icon">
                <t-icon name="logo-chrome" size="48px" />
              </div>
              <h3>AI学术研究助手</h3>
              <p>我可以帮助您进行文献分析、研究方法指导、数据解读等学术相关工作</p>
              <div class="example-questions">
                <t-button 
                  variant="outline" 
                  size="small" 
                  @click="inputEnter('如何选择合适的研究方法？')">
                  如何选择合适的研究方法？
                </t-button>
                <t-button 
                  variant="outline" 
                  size="small" 
                  @click="inputEnter('帮我分析一篇学术论文的结构')">
                  帮我分析论文结构
                </t-button>
                <t-button 
                  variant="outline" 
                  size="small" 
                  @click="inputEnter('数据分析有哪些常用方法？')">
                  数据分析方法
                </t-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部输入区域 -->
      <div class="chat-input-container">
        <!-- 文件上传进度 -->
        <div v-if="uploading" class="upload-progress">
          <t-progress :percentage="uploadProgress" />
          <span>上传中... {{ uploadProgress }}%</span>
        </div>
        

        
        <!-- 输入框和工具 -->
        <div class="input-wrapper">
          <div class="input-tools">
            <t-upload 
              :show-upload-list="false"
              :before-upload="handleFileUpload"
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx">
              <t-button variant="text" size="small">
                <t-icon name="attachment" size="16px" />
              </t-button>
            </t-upload>
          </div>
          
          <!-- 聊天输入框 -->
          <div class="manual-input-wrapper">
            <div class="manual-input">
              <textarea 
                v-model="query"
                :disabled="loading || uploading"
                placeholder="请输入您的问题..."
                @keypress="handleKeyPress"
                @input="handleInput"
                class="message-textarea"
                rows="1"></textarea>
              <t-button 
                theme="primary" 
                :disabled="loading || uploading || !query.trim()"
                @click="handleManualSend"
                class="send-button">
                <t-icon v-if="loading" name="loading" />
                <t-icon v-else name="send" />
                {{ loading ? '发送中...' : '发送' }}
              </t-button>
            </div>
          </div>
          
          <!-- 停止按钮 -->
          <t-button 
            v-if="loading"
            variant="outline" 
            theme="danger"
            @click="handleStop"
            class="stop-button">
            <t-icon name="stop" />
            停止
          </t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import apiService from '../services/api.js'
import { 
  generateId, 
  formatTime, 
  StreamProcessor, 
  MessageRenderer, 
  FileHandler, 
  MarkdownRenderer,
  NotificationManager,
  StorageManager,
  MessageType 
} from '../utils/chatUtils.js'

export default {
  name: 'AIChat',
  setup() {
    // 响应式数据
    const query = ref('')
    const loading = ref(false)
    const messages = ref([])
    const conversations = ref([])
    const currentConversationId = ref(null)
    const currentTask = ref(null)
    const streamProcessor = ref(null)
    const messageRenderer = new MessageRenderer()
    
    // 文件上传相关
    const uploadedFile = ref(null)
    const uploadProgress = ref(0)
    const uploading = ref(false)
    
    // 功能开关
    const features = reactive({
      webSearch: false,
      codeMode: false,
      agentMode: false,
      dataReport: false
    })

    // 初始化
    onMounted(async () => {
      await loadConversations()
      loadStoredSettings()
      initWelcomeMessage()
    })

    // 加载历史会话
    const loadConversations = async () => {
      try {
        const response = await apiService.getConversations()
        conversations.value = response.data || []
      } catch (error) {
        console.error('加载会话列表失败:', error)
        NotificationManager.show('加载会话列表失败', 'error')
      }
    }

    // 加载存储的设置
    const loadStoredSettings = () => {
      const storedFeatures = StorageManager.getItem('chatFeatures', {})
      Object.assign(features, storedFeatures)
    }

    // 保存设置
    const saveSettings = () => {
      StorageManager.setItem('chatFeatures', features)
    }

    // 初始化欢迎消息
    const initWelcomeMessage = () => {
      if (messages.value.length === 0) {
        const welcomeMessage = {
          id: generateId(),
          type: MessageType.ASSISTANT,
          content: '您好！我是您的AI学术研究助手。我可以帮助您进行文献分析、研究方法指导、数据解读等学术相关工作。请告诉我您需要什么帮助？',
          timestamp: new Date().toISOString()
        }
        messages.value.push(welcomeMessage)
      }
    }

    // 发送消息
    const inputEnter = async (inputValue) => {
      if (loading.value || !inputValue.trim()) return
      
      try {
        loading.value = true
        
        // 添加用户消息
        const userMessage = {
          id: generateId(),
          type: MessageType.USER,
          content: inputValue.trim(),
          timestamp: new Date().toISOString(),
          file: uploadedFile.value
        }
        messages.value.push(userMessage)
        
        // 清空输入框
        query.value = ''
        
        // 滚动到底部
        await nextTick()
        scrollToBottom()
        
        // 准备API请求数据
        const requestData = {
          query: inputValue.trim(),
          conversation_id: currentConversationId.value,
          inputs: {
            enable_web_search: features.webSearch ? 1 : 0,
            enable_code: features.codeMode ? 1 : 0,
            enable_agent_mode: features.agentMode ? 1 : 0,
            enable_data_report: features.dataReport ? 1 : 0
          }
        }

        // 处理文件上传
        if (uploadedFile.value) {
          const fileType = FileHandler.getFileType(uploadedFile.value.type)
          requestData.inputs[`input_${fileType}`] = {
            type: fileType,
            transfer_method: 'local_file',
            upload_file_id: uploadedFile.value.id
          }
          clearUploadedFile()
        }

        // 创建助手消息占位符
        const assistantMessage = {
          id: generateId(),
          type: MessageType.ASSISTANT,
          content: '',
          timestamp: new Date().toISOString(),
          streaming: true
        }
        messages.value.push(assistantMessage)

        // 发送请求并处理流式响应
        const response = await apiService.sendMessage(requestData)
        await handleStreamResponse(response, assistantMessage)

      } catch (error) {
        console.error('发送消息失败:', error)
        NotificationManager.show('发送消息失败: ' + error.message, 'error')
      } finally {
        loading.value = false
      }
    }

    // 处理流式响应
    const handleStreamResponse = async (response, messageObj) => {
      return new Promise((resolve, reject) => {
        let fullContent = ''
        
        const processor = new StreamProcessor(
          // onMessage
          (data) => {
            if (data.event === 'message') {
              fullContent += data.answer || ''
              messageObj.content = MarkdownRenderer.render(fullContent)
              
              // 更新会话ID和任务ID
              if (data.conversation_id) {
                currentConversationId.value = data.conversation_id
              }
              if (data.task_id) {
                currentTask.value = data.task_id
              }
              
              // 滚动到底部
              nextTick(() => scrollToBottom())
              
            } else if (data.event === 'message_end') {
              messageObj.streaming = false
              messageObj.messageId = data.id
              resolve()
            } else if (data.event === 'error') {
              reject(new Error(data.message || '生成失败'))
            }
          },
          // onComplete
          () => {
            messageObj.streaming = false
            resolve()
          },
          // onError
          (error) => {
            messageObj.streaming = false
            reject(error)
          }
        )
        
        streamProcessor.value = processor
        processor.processStream(response)
      })
    }

    // 停止生成
    const handleStop = async () => {
      if (streamProcessor.value) {
        streamProcessor.value.stop()
        streamProcessor.value = null
      }
      
      if (currentTask.value) {
        try {
          await apiService.stopGeneration(currentTask.value)
        } catch (error) {
          console.warn('停止生成失败:', error)
        }
      }
      
      loading.value = false
    }

    // 新建对话
    const startNewConversation = () => {
      currentConversationId.value = null
      messages.value = []
      initWelcomeMessage()
      NotificationManager.show('已开始新对话', 'success')
    }

    // 加载历史对话
    const loadConversation = async (conversationId) => {
      try {
        loading.value = true
        const response = await apiService.getMessages(conversationId)
        
        // 解析消息数据，每条API消息包含用户查询和AI回答
        const parsedMessages = []
        
        response.data.forEach(msg => {
          // 转换时间戳为ISO字符串
          const timestamp = new Date(msg.created_at * 1000).toISOString()
          
          // 添加用户消息
          if (msg.query) {
            parsedMessages.push({
              id: `${msg.id}-user`,
              type: MessageType.USER,
              content: msg.query,
              timestamp: timestamp,
              messageId: msg.id,
              file: msg.message_files && msg.message_files.length > 0 ? msg.message_files[0] : null
            })
          }
          
          // 添加AI回答
          if (msg.answer) {
            parsedMessages.push({
              id: `${msg.id}-assistant`,
              type: MessageType.ASSISTANT,
              content: MarkdownRenderer.render(msg.answer),
              timestamp: timestamp,
              messageId: msg.id,
              retrieverResources: msg.retriever_resources || []
            })
          }
        })
        
        // 按时间戳排序（最早的在前面）
        parsedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        
        messages.value = parsedMessages
        currentConversationId.value = conversationId
        
        await nextTick()
        scrollToBottom()
        
      } catch (error) {
        console.error('加载对话失败:', error)
        NotificationManager.show('加载对话失败', 'error')
      } finally {
        loading.value = false
      }
    }

    // 文件上传处理
    const handleFileUpload = async (file) => {
      if (!file) return
      
      // 验证文件
      const validation = FileHandler.validateFile(file)
      if (!validation.valid) {
        NotificationManager.show(validation.errors.join(', '), 'error')
        return
      }
      
      try {
        uploading.value = true
        uploadProgress.value = 0
        
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          if (uploadProgress.value < 90) {
            uploadProgress.value += 10
          }
        }, 200)
        
        const response = await apiService.uploadFile(file)
        
        clearInterval(progressInterval)
        uploadProgress.value = 100
        
        uploadedFile.value = {
          id: response.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: response.url
        }
        
        NotificationManager.show('文件上传成功', 'success')
        
      } catch (error) {
        console.error('文件上传失败:', error)
        NotificationManager.show('文件上传失败: ' + error.message, 'error')
      } finally {
        uploading.value = false
        uploadProgress.value = 0
      }
    }

    // 清除上传的文件
    const clearUploadedFile = () => {
      uploadedFile.value = null
    }

    // 滚动到底部
    const scrollToBottom = () => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }

    // 切换功能开关
    const toggleFeature = (feature) => {
      features[feature] = !features[feature]
      saveSettings()
      NotificationManager.show(
        `${getFeatureName(feature)} ${features[feature] ? '已启用' : '已关闭'}`, 
        'info'
      )
    }

    // 获取功能名称
    const getFeatureName = (feature) => {
      const names = {
        webSearch: '网络搜索',
        codeMode: '代码模式',
        agentMode: 'Agent模式',
        dataReport: '数据报表'
      }
      return names[feature] || feature
    }

    // 复制消息
    const copyMessage = async (message) => {
      try {
        await navigator.clipboard.writeText(message.content)
        NotificationManager.show('已复制到剪贴板', 'success')
      } catch (error) {
        console.error('复制失败:', error)
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = message.content
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        NotificationManager.show('已复制到剪贴板', 'success')
      }
    }

    // 重新生成消息
    const regenerateMessage = async (messageIndex) => {
      if (loading.value) return
      
      // 找到上一条用户消息
      const userMessage = messages.value[messageIndex - 1]
      if (userMessage && userMessage.type === MessageType.USER) {
        // 移除当前助手消息
        messages.value.splice(messageIndex, 1)
        // 重新发送
        await inputEnter(userMessage.content)
      }
    }

    // 删除会话
    const deleteConversation = async (conversationId) => {
      if (!confirm('确定要删除这个会话吗？')) return
      
      try {
        await apiService.deleteConversation(conversationId)
        await loadConversations()
        
        if (currentConversationId.value === conversationId) {
          startNewConversation()
        }
        
        NotificationManager.show('会话已删除', 'success')
      } catch (error) {
        console.error('删除会话失败:', error)
        NotificationManager.show('删除会话失败', 'error')
      }
    }

    // 重命名会话
    const renameConversation = async (conversationId) => {
      const newName = prompt('请输入新的会话名称:')
      if (!newName || !newName.trim()) return
      
      try {
        await apiService.renameConversation(conversationId, newName.trim())
        await loadConversations()
        NotificationManager.show('会话已重命名', 'success')
      } catch (error) {
        console.error('重命名会话失败:', error)
        NotificationManager.show('重命名会话失败', 'error')
      }
    }

    // 发送消息
    const handleManualSend = async () => {
      if (!query.value.trim()) {
        NotificationManager.show('请输入消息内容', 'warning')
        return
      }
      
      try {
        await inputEnter(query.value)
      } catch (error) {
        console.error('发送消息出错:', error)
        NotificationManager.show('发送失败: ' + error.message, 'error')
      }
    }

    // 处理键盘事件
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleManualSend()
      }
    }

    // 处理输入事件，自动调整高度
    const handleInput = (event) => {
      const textarea = event.target
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }



    return {
      // 响应式数据
      query,
      loading,
      messages,
      conversations,
      currentConversationId,
      uploadedFile,
      uploadProgress,
      uploading,
      features,
      
             // 方法
       inputEnter,
       handleStop,
       startNewConversation,
       loadConversation,
       handleFileUpload,
       clearUploadedFile,
       toggleFeature,
       copyMessage,
       regenerateMessage,
       deleteConversation,
       renameConversation,
       handleManualSend,
       handleKeyPress,
       handleInput,
      
      // 工具函数
      formatTime,
      FileHandler,
      MessageType
    }
  }
}
</script>

<style scoped>
.ai-chat-container {
  width: 98%;
  height: 100%;
  display: flex;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 16px;
  gap: 2px;
  border-radius: 16px;
  overflow: hidden;
}

/* 左侧历史会话区域 */
.chat-sidebar {
  width: 300px;
  height: 98%;
  background: linear-gradient(180deg, #eedef8 0%, #fafbfc 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 16px 16px 0 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.new-chat-btn {
  border-radius: 12px;
  font-size: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.new-chat-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

/* 自定义滚动条样式 */
.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: rgba(226, 232, 240, 0.3);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%);
}

.history-item {
  margin: 8px 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 1px solid transparent;
  background: white;
}

.history-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.history-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.history-preview {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  font-size: 12px;
  color: #94a3b8;
}

/* 右侧聊天区域 */
.chat-main {
  /* flex: 1; */
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 98%;
  width: 98%;
}

.chat-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  height: 90%;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 聊天消息区域滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(226, 232, 240, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%);
}

/* 消息样式 */
.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-item.assistant {
  align-self: flex-start;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border: 2px solid white;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-text {
  background: white;
  padding: 16px 20px;
  border-radius: 20px 20px 20px 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  font-size: 14px;
  line-height: 1.6;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  position: relative;
}

.message-item.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px 20px 4px 20px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.message-time {
  font-size: 12px;
  color: #94a3b8;
  padding: 0 4px;
}

/* 工具栏样式 */
.chat-toolbar {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(10px);
}

.feature-toggles {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.feature-toggles .t-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.file-upload-area {
  margin-top: 12px;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 14px;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #64748b;
  font-size: 12px;
}

/* 历史会话操作按钮 */
.history-item {
  position: relative;
}

.history-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: none;
  gap: 4px;
}

.history-item:hover .history-actions {
  display: flex;
}

/* 消息文件附件 */
.message-file {
  margin-bottom: 8px;
}

.file-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

/* 消息操作区域 */
.message-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  opacity: 0.7;
}

.message-buttons {
  display: flex;
  gap: 4px;
}

.message-item:hover .message-actions {
  opacity: 1;
}

/* 打字指示器 */
.typing-indicator {
  margin-top: 8px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 欢迎屏幕 */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.welcome-content {
  max-width: 500px;
}

.welcome-icon {
  margin-bottom: 24px;
  color: #667eea;
}

.welcome-content h3 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.welcome-content p {
  margin: 0 0 32px 0;
  color: #64748b;
  line-height: 1.6;
}

.example-questions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.example-questions .t-button {
  border-radius: 12px;
  padding: 12px 20px;
  text-align: left;
  transition: all 0.3s ease;
}

.example-questions .t-button:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
  transform: translateY(-1px);
}

/* 底部输入区域 */
.chat-input-container {
  position: sticky;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 1) 100%);
  border-top: 1px solid #e2e8f0;
  padding: 20px 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.upload-progress {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-tools {
  display: flex;
  gap: 4px;
}

.chat-input {
  flex: 1;
}

/* 手动输入框样式 */
.manual-input-wrapper {
  flex: 1;
}

.manual-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.manual-input:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 20px rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.message-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 0;
  max-height: 120px;
  min-height: 24px;
  font-family: inherit;
  background: transparent;
}

.message-textarea::placeholder {
  color: #94a3b8;
}

.send-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.stop-button {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transition: all 0.3s ease;
}

.stop-button:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* 自定义输入框样式 */
.chat-input :deep(.t-chat-input) {
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.chat-input :deep(.t-chat-input:focus-within) {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 20px rgba(102, 126, 234, 0.2);
  background: white;
  transform: translateY(-1px);
}

.chat-input :deep(.t-chat-input__send-btn) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.chat-input :deep(.t-chat-input__send-btn:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 检索资源样式 */
.retriever-resources {
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.resources-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 8px;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-item {
  padding: 8px 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.2s ease;
}

.resource-item:hover {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.resource-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.resource-name {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.resource-score {
  font-size: 11px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.resource-content {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-chat-container {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }
  
  .chat-sidebar {
    width: 100%;
    height: 95%;
    border-radius: 16px;
  }
  
  .sidebar-header {
    border-radius: 16px 16px 0 0;
  }
  
  .chat-main {
    border-radius: 16px;
  }
  
  .chat-history {
    flex-direction: row;
    overflow-x: auto;
    padding: 16px;
  }
  
  .history-item {
    min-width: 200px;
    margin-right: 16px;
    border-radius: 12px;
  }
  
  .chat-input-container {
    padding: 16px;
    border-radius: 0 0 16px 16px;
  }
}
</style>
