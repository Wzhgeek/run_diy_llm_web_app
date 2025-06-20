<template>
  <div class="chat-page">
    <!-- 三栏布局容器 -->
    <div class="chat-layout">
      <!-- 左侧对话历史面板 -->
      <div class="chat-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="sidebar-title" v-show="!sidebarCollapsed">
            <t-icon name="chat" />
            <span>对话历史</span>
          </div>
          <div class="sidebar-actions">
            <t-button 
              v-show="!sidebarCollapsed"
              variant="text" 
              size="small" 
              theme="primary"
              @click="newConversation"
            >
              <t-icon name="add" />
              新建
            </t-button>
            <t-button 
              variant="text" 
              size="small"
              @click="toggleSidebar"
            >
              <t-icon :name="sidebarCollapsed ? 'chevron-right' : 'chevron-left'" />
            </t-button>
          </div>
        </div>

        <div v-show="!sidebarCollapsed" class="sidebar-search">
          <t-input 
            v-model="searchQuery"
            placeholder="搜索对话..." 
            :prefixIcon="searchIcon"
            size="small"
          />
        </div>

        <div v-show="!sidebarCollapsed" class="conversation-list">
          <div 
            v-for="conv in filteredConversations" 
            :key="conv.id"
            class="conversation-item"
            :class="{ active: currentConversationId === conv.id }"
            @click="switchConversation(conv.id)"
          >
            <div class="conv-title">{{ conv.title }}</div>
            <div class="conv-meta">
              <span class="conv-time">{{ formatTime(conv.updateTime) }}</span>
              <span class="conv-count">{{ conv.messageCount }}条</span>
            </div>
            <div class="conv-actions">
              <t-dropdown :options="conversationMenuOptions" @click="handleConversationAction">
                <t-button variant="text" size="small">
                  <t-icon name="more" />
                </t-button>
              </t-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间主聊天区域 -->
      <div class="chat-main">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-info">
            <h2 class="chat-title">{{ currentConversation?.title || 'AI学术助手' }}</h2>
            <p class="chat-subtitle">智能学术研究对话助手</p>
          </div>
          
          <div class="chat-controls">
            <div class="model-selector">
              <t-select
                v-model="selectedModel"
                :options="modelOptions"
                style="width: 140px;"
                size="small"
              >
                <template #label="{ label }">
                  <span class="model-label">{{ label }}</span>
                </template>
              </t-select>
            </div>
            
            <t-button 
              class="thinking-toggle"
              :class="{ active: deepThinking }"
              variant="outline" 
              size="small"
              @click="toggleDeepThinking"
            >
              <t-icon name="lightbulb" />
              深度思考
            </t-button>

            <t-button 
              variant="text" 
              size="small"
              @click="toggleReportPanel"
            >
              <t-icon name="chart-bar" />
              数据报表
            </t-button>
          </div>
        </div>

        <!-- 主聊天容器 -->
        <div class="chat-container">
          <!-- 欢迎屏幕 -->
          <div v-if="chatList.length === 0" class="welcome-screen">
            <div class="welcome-content">
              <div class="welcome-icon">
                <t-icon name="chat" size="64px" />
              </div>
              <h3>欢迎使用AI学术助手</h3>
              <p>我可以帮助您进行学术研究、文献分析、论文写作等任务</p>
              
              <div class="example-prompts">
                <div class="prompt-category">
                  <h4>💡 学术研究</h4>
                  <div class="prompt-cards">
                    <div 
                      v-for="prompt in academicPrompts" 
                      :key="prompt.id"
                      class="prompt-card"
                      @click="usePrompt(prompt.text)"
                    >
                      <span>{{ prompt.text }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="prompt-category">
                  <h4>📝 论文写作</h4>
                  <div class="prompt-cards">
                    <div 
                      v-for="prompt in writingPrompts" 
                      :key="prompt.id"
                      class="prompt-card"
                      @click="usePrompt(prompt.text)"
                    >
                      <span>{{ prompt.text }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TDesign Chat组件 -->
          <t-chat
            v-else
            ref="chatRef"
            :clear-history="false"
            :data="chatList"
            :text-loading="loading"
            :is-stream-load="isStreamLoad"
            class="chat-messages"
            @scroll="handleChatScroll"
            @clear="clearConfirm"
          >
            <!-- 自定义消息内容 -->
            <template #content="{ item, index }">
              <!-- 思维链展示 -->
              <t-chat-reasoning 
                v-if="item.reasoning?.length > 0" 
                expand-icon-placement="right"
                :collapsed="index === 0 && !isStreamLoad"
                class="reasoning-section"
              >
                <template #header>
                  <t-chat-loading v-if="isStreamLoad && index === 0 && item.content.length === 0" text="正在深度思考..." />
                  <div v-else class="reasoning-header">
                    <t-icon name="check-circle" style="color: var(--success-color); font-size: 18px;" />
                    <span>思维链展示</span>
                    <t-tag size="small" variant="light" theme="success">深度分析</t-tag>
                  </div>
                </template>
                <t-chat-content :content="item.reasoning" />
              </t-chat-reasoning>
              
              <!-- 主要内容 -->
              <t-chat-content v-if="item.content.length > 0" :content="item.content" />
              
              <!-- 相关建议 -->
              <div v-if="item.suggestions?.length > 0" class="message-suggestions">
                <div class="suggestions-title">💡 相关建议</div>
                <div class="suggestion-chips">
                  <t-tag 
                    v-for="suggestion in item.suggestions" 
                    :key="suggestion"
                    variant="outline"
                    clickable
                    @click="usePrompt(suggestion)"
                  >
                    {{ suggestion }}
                  </t-tag>
                </div>
              </div>
            </template>

            <!-- 操作按钮 -->
            <template #actions="{ item }">
              <t-chat-action
                :content="item.content"
                :operation-btn="['good', 'bad', 'replay', 'copy', 'share']"
                @operation="handleOperation"
              />
            </template>

            <!-- 自定义输入区域 -->
            <template #footer>
              <div class="input-section">
                <!-- 快速功能按钮 -->
                <div class="quick-tools">
                  <t-button 
                    v-for="tool in quickTools" 
                    :key="tool.id"
                    variant="text" 
                    size="small"
                    :class="{ active: tool.id === activeQuickTool }"
                    @click="selectQuickTool(tool.id)"
                  >
                    <t-icon :name="tool.icon" />
                    <span>{{ tool.name }}</span>
                  </t-button>
                </div>

                <!-- 文件上传预览区 -->
                <div v-if="uploadedFiles.length > 0" class="file-preview-area">
                  <div class="file-list">
                    <div 
                      v-for="file in uploadedFiles" 
                      :key="file.id"
                      class="file-item"
                    >
                      <t-icon :name="getFileIcon(file.type)" />
                      <span class="file-name">{{ file.name }}</span>
                      <t-button 
                        variant="text" 
                        size="small" 
                        theme="danger"
                        @click="removeFile(file.id)"
                      >
                        <t-icon name="close" />
                      </t-button>
                    </div>
                  </div>
                </div>

                <!-- 主输入区域 -->
                <t-chat-input 
                  ref="chatInputRef"
                  :stop-disabled="!isStreamLoad" 
                  placeholder="请输入您的问题，支持拖拽文件上传..."
                  @send="handleSendMessage" 
                  @stop="stopGeneration"
                  @file-upload="handleFileUpload"
                >
                  <template #prefix>
                    <div class="input-prefix">
                      <!-- 文件上传按钮 -->
                      <t-upload
                        :action="uploadAction"
                        :multiple="true"
                        :show-upload-list="false"
                        :before-upload="beforeUpload"
                        @success="onUploadSuccess"
                      >
                        <t-button variant="text" size="small">
                          <t-icon name="attachment" />
                        </t-button>
                      </t-upload>

                      <!-- 图片上传按钮 -->
                      <t-button variant="text" size="small" @click="openImageUpload">
                        <t-icon name="image" />
                      </t-button>

                      <!-- 语音输入按钮 -->
                      <t-button 
                        variant="text" 
                        size="small"
                        :class="{ recording: isRecording }"
                        @click="toggleRecording"
                      >
                        <t-icon name="microphone" />
                      </t-button>
                    </div>
                  </template>

                  <template #suffix>
                    <div class="input-suffix">
                      <span class="char-count">{{ inputCharCount }}/2000</span>
                    </div>
                  </template>
                </t-chat-input>
              </div>
            </template>
          </t-chat>

          <!-- 回到底部按钮 -->
          <t-button 
            v-show="showScrollToBottom" 
            class="scroll-to-bottom"
            shape="circle"
            theme="primary"
            @click="scrollToBottom"
          >
            <t-icon name="chevron-down" />
          </t-button>
        </div>
      </div>

      <!-- 右侧数据报表面板 -->
      <div v-if="showReportPanel" class="report-panel">
        <div class="panel-header">
          <h3>数据报表</h3>
          <t-button variant="text" size="small" @click="toggleReportPanel">
            <t-icon name="close" />
          </t-button>
        </div>
        
        <div class="panel-content">
          <div class="stats-section">
            <h4>对话统计</h4>
            <div class="stat-item">
              <span>总对话数</span>
              <span>{{ conversationStats.total }}</span>
            </div>
            <div class="stat-item">
              <span>今日对话</span>
              <span>{{ conversationStats.today }}</span>
            </div>
            <div class="stat-item">
              <span>平均长度</span>
              <span>{{ conversationStats.avgLength }}轮</span>
            </div>
          </div>

          <div class="usage-chart">
            <h4>使用趋势</h4>
            <div class="chart-placeholder">
              <p>图表组件将在后续版本中实现</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { SearchIcon } from 'tdesign-icons-vue-next'

// 响应式数据
const chatRef = ref()
const chatInputRef = ref()
const loading = ref(false)
const isStreamLoad = ref(false)
const showScrollToBottom = ref(false)
const sidebarCollapsed = ref(false)
const showReportPanel = ref(false)
const selectedModel = ref('gpt-4')
const deepThinking = ref(false)
const searchQuery = ref('')
const currentConversationId = ref('default')
const activeQuickTool = ref('')
const uploadedFiles = ref([])
const isRecording = ref(false)
const inputCharCount = ref(0)

// 图标引用
const searchIcon = SearchIcon

// 模型选项
const modelOptions = [
  { label: 'GPT-4', value: 'gpt-4', description: '最强推理能力' },
  { label: 'Claude-3', value: 'claude-3', description: '平衡性能' },
  { label: 'GLM-4', value: 'glm-4', description: '中文优化' },
  { label: '文心一言', value: 'ernie', description: '百度出品' },
]

// 快速工具
const quickTools = [
  { id: 'web-search', name: '联网搜索', icon: 'search' },
  { id: 'code-mode', name: '代码模式', icon: 'code' },
  { id: 'agent-mode', name: 'Agent模式', icon: 'robot' },
  { id: 'translate', name: '翻译助手', icon: 'translate' },
]

// 示例提示词
const academicPrompts = [
  { id: 1, text: '帮我分析这篇论文的创新点' },
  { id: 2, text: '解释机器学习中的注意力机制' },
  { id: 3, text: '总结深度学习的发展历程' },
]

const writingPrompts = [
  { id: 1, text: '帮我润色这段学术文本' },
  { id: 2, text: '为我的研究生成相关文献' },
  { id: 3, text: '检查语法并提出改进建议' },
]

// 对话历史数据
const conversations = ref([
  {
    id: 'default',
    title: '学术研究讨论',
    updateTime: new Date(),
    messageCount: 5,
  },
  {
    id: 'conv2',
    title: '论文写作指导',
    updateTime: new Date(Date.now() - 86400000),
    messageCount: 12,
  },
])

// 当前对话
const currentConversation = computed(() => 
  conversations.value.find(c => c.id === currentConversationId.value)
)

// 过滤后的对话列表
const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  return conversations.value.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 聊天数据
const chatList = ref([])

// 对话统计
const conversationStats = computed(() => ({
  total: conversations.value.length,
  today: 3,
  avgLength: 8.5,
}))

// 对话菜单选项
const conversationMenuOptions = [
  { content: '重命名', value: 'rename' },
  { content: '导出', value: 'export' },
  { content: '删除', value: 'delete' },
]

// 方法定义
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleReportPanel = () => {
  showReportPanel.value = !showReportPanel.value
}

const toggleDeepThinking = () => {
  deepThinking.value = !deepThinking.value
}

const newConversation = () => {
  const newId = `conv_${Date.now()}`
  conversations.value.unshift({
    id: newId,
    title: '新对话',
    updateTime: new Date(),
    messageCount: 0,
  })
  currentConversationId.value = newId
  chatList.value = []
}

const switchConversation = (convId: string) => {
  currentConversationId.value = convId
  // 这里应该加载对应的聊天记录
  loadConversationMessages(convId)
}

const loadConversationMessages = (convId: string) => {
  // 模拟加载聊天记录
  if (convId === 'default') {
    chatList.value = [
      {
        avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
        name: 'AI助手',
        datetime: '今天 16:38',
        reasoning: '用户询问学术问题，需要提供专业且详细的回答...',
        content: `学术研究的核心在于**创新性**和**严谨性**。

### 关键要素：

1. **问题导向**：明确研究问题和假设
2. **方法科学**：选择合适的研究方法
3. **数据可靠**：确保数据的真实性和有效性
4. **逻辑清晰**：论证过程要有条理

建议您从感兴趣的领域开始，逐步深入研究。`,
        role: 'assistant',
        suggestions: ['如何选择研究方向？', '学术写作技巧', '文献综述方法'],
      },
      {
        avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
        name: '我',
        datetime: '今天 16:38',
        content: '请介绍一下学术研究的基本要素',
        role: 'user',
        reasoning: '',
      },
    ]
  } else {
    chatList.value = []
  }
}

const usePrompt = (promptText: string) => {
  // 将提示词填入输入框
  if (chatInputRef.value) {
    chatInputRef.value.setValue(promptText)
  }
}

const selectQuickTool = (toolId: string) => {
  activeQuickTool.value = activeQuickTool.value === toolId ? '' : toolId
}

const handleSendMessage = (inputValue: string) => {
  if (isStreamLoad.value || !inputValue.trim()) return

  // 添加用户消息
  const userMessage = {
    avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
    name: '我',
    datetime: new Date().toLocaleString(),
    content: inputValue,
    role: 'user',
    reasoning: '',
  }
  chatList.value.unshift(userMessage)

  // 添加AI回复占位
  const aiMessage = {
    avatar: 'https://tdesign.gtimg.com/site/chat-avatar.png',
    name: 'AI助手',
    datetime: new Date().toLocaleString(),
    content: '',
    reasoning: '',
    role: 'assistant',
    suggestions: [],
  }
  chatList.value.unshift(aiMessage)

  // 模拟AI回复
  simulateAIResponse(aiMessage)
}

const simulateAIResponse = (message: any) => {
  isStreamLoad.value = true
  loading.value = true

  const responses = [
    '这是一个很好的学术问题。让我来为您详细分析...',
    '根据最新的研究进展，我可以为您提供以下见解...',
    '在学术研究中，这个问题涉及多个方面，让我逐一说明...',
  ]
  
  const fullResponse = responses[Math.floor(Math.random() * responses.length)]
  const fullReasoning = deepThinking.value ? '正在分析问题的多个维度，包括理论基础、实践应用和最新研究进展...' : ''
  
  let currentIndex = 0
  let reasoningIndex = 0

  const streamInterval = setInterval(() => {
    if (reasoningIndex < fullReasoning.length) {
      message.reasoning += fullReasoning[reasoningIndex]
      reasoningIndex++
    } else if (currentIndex < fullResponse.length) {
      message.content += fullResponse[currentIndex]
      currentIndex++
    } else {
      // 添加建议
      message.suggestions = ['深入了解相关理论', '查看最新研究进展', '探索实际应用案例']
      clearInterval(streamInterval)
      isStreamLoad.value = false
      loading.value = false
    }
  }, 50)
}

const stopGeneration = () => {
  isStreamLoad.value = false
  loading.value = false
}

const handleChatScroll = ({ e }: { e: Event }) => {
  const target = e.target as HTMLElement
  const scrollTop = target.scrollTop
  showScrollToBottom.value = scrollTop < -100
}

const scrollToBottom = () => {
  if (chatRef.value) {
    chatRef.value.scrollToBottom({ behavior: 'smooth' })
  }
}

const clearConfirm = () => {
  chatList.value = []
}

const handleOperation = (type: string, options: any) => {
  console.log('操作类型:', type, '选项:', options)
}

const handleConversationAction = (option: any) => {
  console.log('对话操作:', option)
}

const formatTime = (time: Date) => {
  return time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 文件处理相关
const uploadAction = '/api/upload'

const handleFileUpload = (files: FileList) => {
  Array.from(files).forEach(file => {
    uploadedFiles.value.push({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      file: file
    })
  })
}

const beforeUpload = (file: File) => {
  const isValidSize = file.size / 1024 / 1024 < 10 // 10MB限制
  if (!isValidSize) {
    console.error('文件大小不能超过10MB')
  }
  return isValidSize
}

const onUploadSuccess = (response: any) => {
  console.log('上传成功:', response)
}

const removeFile = (fileId: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== fileId)
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('image')) return 'image'
  if (fileType.includes('pdf')) return 'file-pdf'
  if (fileType.includes('word')) return 'file-word'
  return 'file'
}

const openImageUpload = () => {
  // 实现图片上传逻辑
  console.log('打开图片上传')
}

const toggleRecording = () => {
  isRecording.value = !isRecording.value
  // 实现语音录制逻辑
}

// 初始化
onMounted(() => {
  loadConversationMessages('default')
})
</script>

<style scoped lang="less">
.chat-page {
  height: 100vh;
  overflow: hidden;
}

.chat-layout {
  display: flex;
  height: 100%;
  background: var(--bg-color);
}

// 左侧边栏样式 - 桌面端专用设计
.chat-sidebar {
  width: 20%; // 占据20%屏幕宽度
  min-width: 200px; // 最小宽度保证
  max-width: 280px; // 最大宽度限制
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal) ease;
  flex-shrink: 0; // 防止压缩

  &.collapsed {
    width: 60px; // 折叠时显示图标
    min-width: 60px;
  }

  .sidebar-header {
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px; // 固定高度

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
    }

    .sidebar-actions {
      display: flex;
      gap: var(--spacing-xs);
    }
  }

  .sidebar-search {
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
  }

  .conversation-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-sm);

    .conversation-item {
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background var(--transition-fast) ease;
      margin-bottom: var(--spacing-xs);
      position: relative;

      &:hover {
        background: var(--bg-color);
      }

      &.active {
        background: var(--td-brand-color);
        color: white;

        .conv-meta {
          color: rgba(255, 255, 255, 0.8);
        }
      }

      .conv-title {
        font-weight: 500;
        font-size: 13px;
        margin-bottom: var(--spacing-xs);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .conv-meta {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: var(--text-tertiary);
      }

      .conv-actions {
        position: absolute;
        top: var(--spacing-xs);
        right: var(--spacing-xs);
        opacity: 0;
        transition: opacity var(--transition-fast) ease;
      }

      &:hover .conv-actions {
        opacity: 1;
      }
    }
  }
}

// 主聊天区域 - 桌面端优化
.chat-main {
  flex: 1; // 占据剩余空间，约60-65%
  display: flex;
  flex-direction: column;
  background: var(--bg-white);
  min-width: 0; // 允许收缩
}

.chat-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-white);
  height: 64px; // 桌面端舒适高度
  flex-shrink: 0;

  .chat-info {
    .chat-title {
      margin: 0;
      font-size: 20px; // 桌面端较大字体
      font-weight: 600;
      color: var(--text-primary);
    }

    .chat-subtitle {
      margin: 0;
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  .chat-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg); // 桌面端宽松间距

    .model-selector {
      .model-label {
        font-weight: 500;
        font-size: 14px;
      }
    }

    .thinking-toggle {
      font-size: 14px;
      
      &.active {
        background: var(--td-brand-color);
        color: white;
        border-color: var(--td-brand-color);
      }
    }
  }
}

.chat-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// 欢迎屏幕 - 桌面端优化
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl);

  .welcome-content {
    text-align: center;
    max-width: 900px; // 桌面端更宽的内容区
    width: 100%;

    .welcome-icon {
      color: var(--td-brand-color);
      margin-bottom: var(--spacing-xl);
    }

    h3 {
      font-size: 28px; // 桌面端大标题
      font-weight: 600;
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }

    p {
      font-size: 18px; // 桌面端较大字体
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xxl);
    }

    .example-prompts {
      .prompt-category {
        margin-bottom: var(--spacing-xxl);

        h4 {
          font-size: 18px; // 桌面端较大字体
          font-weight: 600;
          margin-bottom: var(--spacing-lg);
          color: var(--text-primary);
          text-align: left;
        }

        .prompt-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); // 桌面端更宽的卡片
          gap: var(--spacing-lg);

          .prompt-card {
            padding: var(--spacing-lg); // 桌面端宽松间距
            background: var(--bg-color);
            border-radius: var(--radius-lg);
            cursor: pointer;
            transition: all var(--transition-fast) ease;
            border: 1px solid transparent;

            &:hover {
              background: var(--td-brand-color);
              color: white;
              transform: translateY(-2px);
              box-shadow: var(--shadow-normal);
            }

            span {
              font-size: 15px; // 桌面端合适字体
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
}

// 聊天消息样式
.chat-messages {
  flex: 1;
  min-height: 0;
}

.reasoning-section {
  margin-bottom: var(--spacing-lg);

  .reasoning-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }
}

.message-suggestions {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-lg);

  .suggestions-title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
  }

  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }
}

// 输入区域样式
.input-section {
  border-top: 1px solid var(--border-color);
  background: var(--bg-white);

  .quick-tools {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);

    .t-button {
      font-size: 14px;
      
      &.active {
        background: var(--td-brand-color);
        color: white;
      }
    }
  }

  .file-preview-area {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);

    .file-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);

      .file-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--bg-color);
        border-radius: var(--radius-md);

        .file-name {
          font-size: 13px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .input-prefix, .input-suffix {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .input-suffix {
    .char-count {
      font-size: 13px;
      color: var(--text-tertiary);
    }
  }

  .recording {
    background: var(--danger-color) !important;
    color: white !important;
  }
}

// 滚动到底部按钮
.scroll-to-bottom {
  position: absolute;
  bottom: 120px;
  right: var(--spacing-xl);
  z-index: 10;
  box-shadow: var(--shadow-normal);
}

// 右侧报表面板 - 桌面端优化
.report-panel {
  width: 40%; // 占据18%屏幕宽度

  background: var(--bg-white);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .panel-header {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px; // 与聊天头部保持一致

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .panel-content {
    flex: 1;
    padding: var(--spacing-lg);
    overflow-y: auto;

    .stats-section {
      margin-bottom: var(--spacing-xxl);

      h4 {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: var(--spacing-lg);
        color: var(--text-primary);
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-md) 0;
        border-bottom: 1px solid var(--border-color);
        font-size: 14px;

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .usage-chart {
      h4 {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: var(--spacing-lg);
        color: var(--text-primary);
      }

      .chart-placeholder {
        height: 220px; // 桌面端更高的图表区域
        background: var(--bg-color);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary);
        font-size: 14px;
      }
    }
  }
}

// 简化的响应式适配 - 仅桌面端
@media (max-width: 1400px) {
  .chat-sidebar {
    width: 22%; // 略微增加比例
    min-width: 180px;
  }
  
  .report-panel {
    width: 20%;
    min-width: 200px;
  }
}

@media (max-width: 1200px) {
  .chat-sidebar {
    width: 25%; // 进一步增加比例
    min-width: 160px;
  }
  
  .report-panel {
    width: 22%;
    min-width: 180px;
  }
}
</style> 