<template>
  <div class="h-full flex" :class="[themeStore.getThemeClass('background'), 'bg-gradient-to-br dark:' + themeStore.getThemeClass('backgroundSecondary')]">
    <!-- 左侧会话历史 -->
    <div 
      :class="[
        'sidebar-modern transition-all duration-500 ease-in-out border-r backdrop-blur-xl',
        themeStore.getThemeClass('border'),
        themeStore.getThemeClass('cardBackground'),
        chatStore.sidebarCollapsed ? 'w-20' : 'w-80'
      ]"
    >
      <!-- 头部 -->
      <div class="h-20 px-6 border-b flex items-center justify-between" :class="themeStore.getThemeClass('border')">
        <transition name="fade" mode="out-in">
          <div v-show="!chatStore.sidebarCollapsed" class="flex items-center space-x-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shadow-lg', themeStore.getThemeClass('primary')]">
              <t-icon name="pantone" size="18px" class="text-white" />
            </div>
            <div>
              <h3 :class="themeStore.getThemeClass('textPrimary')" class="font-bold">研究记录</h3>
              <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs">{{ chatStore.conversations.length }} 个会话</p>
            </div>
          </div>
        </transition>
        
        <button 
          @click="chatStore.createNewConversation"
          :class="[
            'text-white px-4 py-2 text-sm rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105',
            themeStore.getThemeClass('primary'),
            'hover:' + themeStore.getThemeClass('primaryHover'),
            chatStore.sidebarCollapsed ? 'w-10 h-10 p-0' : ''
          ]"
        >
          <t-icon name="plus" size="24px" />
          <span v-show="!chatStore.sidebarCollapsed" class="ml-2">新建</span>
        </button>
      </div>

      <!-- 会话列表 -->
      <div class="flex-1 overflow-y-auto p-3 conversation-list">
        <transition name="fade" mode="out-in">
        <div v-show="!chatStore.sidebarCollapsed" class="space-y-2">
          <!-- 会话列表为空提示 -->
          <div v-if="chatStore.conversations.length === 0" class="text-center py-8">
            <div :class="['w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg', themeStore.getThemeClass('accent')]">
              <t-icon name="message-square" size="20px" :class="themeStore.getThemeClass('textSecondary')" />
            </div>
            <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm">
              还没有研究记录
            </p>
            <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs mt-1">
              点击上方"新建"按钮开始对话
            </p>
          </div>
          
          <!-- 会话项 -->
          <div 
            v-for="conversation in chatStore.conversations"
            :key="conversation.id"
            :class="[
                'group p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] border',
              conversation.id === chatStore.currentConversationId
                  ? [themeStore.getThemeClass('primaryLight'), themeStore.getThemeClass('border'), themeStore.getThemeClass('shadow')]
                  : ['hover:' + themeStore.getThemeClass('accent'), 'border-transparent']
            ]"
            @click="loadConversationWithDebug(conversation.id)"
          >
            <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0 space-y-2">
                  <div class="flex items-center space-x-2">
                    <div :class="['w-2 h-2 rounded-full', conversation.id === chatStore.currentConversationId ? 'animate-pulse' : '', themeStore.getThemeClass('primary')]"></div>
                    <p :class="themeStore.getThemeClass('textPrimary')" class="text-sm font-semibold truncate">
                  {{ conversation.name || '新研究' }}
                </p>
                  </div>
                  <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs line-clamp-2">
                    {{ getConversationSummary(conversation) }}
                </p>
                  <div :class="themeStore.getThemeClass('textSecondary')" class="flex items-center space-x-3 text-xs">
                    <span>{{ formatTime(conversation.created_at) }}</span>
                    <span>•</span>
                    <span>{{ getCachedMessageCount(conversation) }} 条记录</span>
                    <span v-if="(conversation as any).hasUnread" :class="['w-2 h-2 rounded-full animate-pulse', themeStore.getThemeClass('warning')]"></span>
                  </div>
              </div>
                
              <t-dropdown>
                  <button :class="['opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all duration-200', 'hover:' + themeStore.getThemeClass('accent')]">
                    <t-icon name="view-list" size="24px" :class="themeStore.getThemeClass('textSecondary')" />
                  </button>
                <t-dropdown-menu>
                  <t-dropdown-item @click="renameConversation(conversation.id)">
                      <t-icon name="edit" size="14px" class="mr-2" />
                    重命名
                  </t-dropdown-item>
                    <t-dropdown-item @click="shareConversation(conversation.id)">
                      <t-icon name="share-1" size="14px" class="mr-2" />
                      分享
                    </t-dropdown-item>
                    <t-dropdown-item @click="duplicateConversation(conversation.id)">
                      <t-icon name="copy" size="14px" class="mr-2" />
                      复制
                    </t-dropdown-item>
                  <t-dropdown-item @click="deleteConversation(conversation.id)">
                      <t-icon name="delete" size="14px" class="mr-2" />
                    删除
                  </t-dropdown-item>
                </t-dropdown-menu>
              </t-dropdown>
            </div>
            </div>
          </div>
        </transition>
        
        <!-- 收缩状态的会话列表 -->
        <div v-show="chatStore.sidebarCollapsed" class="space-y-3 conversation-list-collapsed">
          <!-- 显示更多会话，最多12个 -->
          <div 
            v-for="conversation in chatStore.conversations.slice(0, 25)"
            :key="conversation.id"
            :class="[
              'w-12 h-12 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center hover:scale-110 relative',
              conversation.id === chatStore.currentConversationId
                ? [themeStore.getThemeClass('primary'), 'text-white shadow-lg']
                : [themeStore.getThemeClass('accent'), 'hover:' + themeStore.getThemeClass('accentLight'), themeStore.getThemeClass('textSecondary')]
            ]"
            @click="loadConversationWithDebug(conversation.id)"
            :title="conversation.name || '新研究'"
          >
            <span class="text-xs font-bold">{{ getConversationInitial(conversation) }}</span>
            <div v-if="(conversation as any).hasUnread" :class="['absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse', themeStore.getThemeClass('warning')]"></div>
          </div>
          
          <!-- 显示更多会话指示 -->
          <div v-if="chatStore.conversations.length > 12" :class="['text-center text-xs mt-2', themeStore.getThemeClass('textSecondary')]">
            +{{ chatStore.conversations.length - 12 }} 个会话
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边栏切换按钮 -->
    <div class="relative">
      <button 
        @click="chatStore.toggleSidebar"
        :class="[
          'absolute top-6 -left-4 z-10 p-2 backdrop-blur-xl border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105',
          themeStore.getThemeClass('cardBackground'),
          themeStore.getThemeClass('border')
        ]"
      >
        <t-icon 
          :name="chatStore.sidebarCollapsed ? 'chevron-right' : 'chevron-left'" 
          size="16px" 
          :class="themeStore.getThemeClass('textSecondary')"
        />
      </button>
    </div>

    <!-- 右侧聊天区域 -->
    <div :class="[
      'flex flex-col relative transition-all duration-300 backdrop-blur-xl',
      themeStore.getThemeClass('cardBackground'),
      showReportPanel ? 'flex-1' : 'flex-1'
    ]">
      <!-- 聊天消息区域 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto space-y-6">
          <!-- 欢迎屏幕 -->
          <div v-if="chatStore.messages.length === 0" class="text-center py-20 space-y-8">
            <!-- AI助手头像 -->
            <div class="relative w-24 h-24 mx-auto mb-8">
              <div :class="['absolute inset-0 rounded-3xl animate-pulse shadow-xl', themeStore.getThemeClass('gradient')]"></div>
              <div :class="['absolute inset-2 rounded-2xl flex items-center justify-center backdrop-blur-sm', themeStore.getThemeClass('cardBackground')]">
                <t-icon name="chart-ring" size="64px" :class="themeStore.getThemeClass('textSecondary')" />
              </div>
              <div :class="['absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg', themeStore.getThemeClass('success')]">
                <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div class="space-y-4">
              <h3 :class="['text-3xl font-bold bg-clip-text text-transparent', themeStore.getThemeClass('gradient')]">AI科研助手</h3>
              <p :class="themeStore.getThemeClass('textPrimary')" class="text-lg max-w-2xl mx-auto">
                您的智能学术研究伙伴，助力科研创新与学术探索
            </p>
            </div>
            
            <!-- 功能特色 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div :class="['backdrop-blur-sm p-6 rounded-3xl text-center border hover:scale-105 transition-all duration-300 hover:shadow-xl', themeStore.getThemeClass('accent'), themeStore.getThemeClass('border')]">
                <div :class="['w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg', themeStore.getThemeClass('primary')]">
                  <t-icon name="book-open" size="20px" class="text-white" />
                </div>
                <h4 :class="themeStore.getThemeClass('textPrimary')" class="font-semibold mb-2">文献分析</h4>
                <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm">深度解读学术论文</p>
              </div>
              <div :class="['backdrop-blur-sm p-6 rounded-3xl text-center border hover:scale-105 transition-all duration-300 hover:shadow-xl', themeStore.getThemeClass('accent'), themeStore.getThemeClass('border')]">
                <div :class="['w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg', themeStore.getThemeClass('info')]">
                  <t-icon name="lightbulb" size="20px" class="text-white" />
                </div>
                <h4 :class="themeStore.getThemeClass('textPrimary')" class="font-semibold mb-2">研究指导</h4>
                <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm">创新方法建议</p>
              </div>
              <div :class="['backdrop-blur-sm p-6 rounded-3xl text-center border hover:scale-105 transition-all duration-300 hover:shadow-xl', themeStore.getThemeClass('accent'), themeStore.getThemeClass('border')]">
                <div :class="['w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg', themeStore.getThemeClass('warning')]">
                  <t-icon name="chart-bar" size="20px" class="text-white" />
                </div>
                <h4 :class="themeStore.getThemeClass('textPrimary')" class="font-semibold mb-2">数据解读</h4>
                <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm">专业数据分析</p>
              </div>
            </div>
            
            <!-- 示例问题 -->
            <div class="space-y-4">
              <h4 :class="themeStore.getThemeClass('textPrimary')" class="text-lg font-semibold">探索科研问题：</h4>
            <div class="flex flex-wrap justify-center gap-3">
                <button 
                  v-for="example in exampleQuestions"
                  :key="example"
                  @click="sendExampleMessage(example)"
                  :class="[
                    'px-4 py-2 text-sm rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-lg border',
                    themeStore.getThemeClass('primaryLight'),
                    themeStore.getThemeClass('textAccent'),
                    themeStore.getThemeClass('border')
                  ]"
                >
                  {{ example }}
                </button>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div 
            v-for="message in chatStore.messages" 
            :key="message.id"
            :class="[
              'flex animate-fade-in-up',
              message.type === 'user' ? 'justify-end' : 'justify-start'
            ]"
          >
            <!-- 用户消息 -->
            <div 
              v-if="message.type === 'user'"
              :class="[
                'text-white px-6 py-4 rounded-3xl shadow-lg max-w-[80%] hover:scale-[1.02] transition-all duration-300',
                themeStore.getThemeClass('primary')
              ]"
            >
              <!-- 文件附件 -->
              <div v-if="message.file" :class="['mb-3 p-3 rounded-2xl backdrop-blur-sm', themeStore.getThemeClass('accent')]">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-white/30 rounded-xl flex items-center justify-center">
                  <t-icon name="link-1" size="16px" class="text-white" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ message.file.name }}</p>
                    <p class="text-xs text-white/80">附件文件</p>
                  </div>
                </div>
              </div>

              <!-- 消息内容 -->
              <div class="prose prose-sm prose-invert max-w-none text-white" v-html="message.content"></div>

              <!-- 消息时间 -->
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                <span class="text-xs text-white/80">{{ formatTime(message.timestamp) }}</span>
                <button @click="copyMessage(message)" class="p-1 rounded-xl hover:bg-white/20 transition-colors">
                  <t-icon name="copy" size="12px" class="text-white/80" />
                </button>
              </div>
            </div>

            <!-- AI助手消息 -->
            <div 
              v-else
              class="flex items-start space-x-4 max-w-[85%]"
            >
              <!-- AI头像 -->
              <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shrink-0', themeStore.getThemeClass('primary')]">
                <t-icon name="cpu" size="18px" class="text-white" />
              </div>
              
              <div :class="['backdrop-blur-xl px-6 py-4 rounded-3xl shadow-lg border flex-1 hover:shadow-xl transition-all duration-300', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border')]">
                <!-- 消息内容 -->
                <div :class="['prose prose-sm dark:prose-invert max-w-none', themeStore.getThemeClass('textPrimary')]" v-html="getDisplayContent(message)"></div>

                <!-- HTML报表文件图标 -->
                <div v-if="hasHtmlReport(message)" class="mt-4">
                  <div 
                    v-for="(report, index) in extractHtmlReport(message.content || '')"
                    :key="index"
                    @click="openReportPanel(`数据报表 ${index + 1}`, report)"
                    :class="[
                      'flex items-center space-x-3 p-4 rounded-2xl cursor-pointer hover:bg-gradient-to-r transition-all duration-300 border',
                      themeStore.getThemeClass('warning'),
                      'hover:' + themeStore.getThemeClass('warning'),
                      themeStore.getThemeClass('border')
                    ]"
                  >
                    <div :class="['w-8 h-8 rounded-xl flex items-center justify-center shadow-lg', themeStore.getThemeClass('warning')]">
                      <t-icon name="bar-chart-3" size="16px" class="text-white" />
                    </div>
                    <div class="flex-1">
                      <p :class="themeStore.getThemeClass('textPrimary')" class="text-sm font-medium">数据报表 {{ index + 1 }}</p>
                      <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs">点击查看科研报表</p>
                    </div>
                    <t-icon name="chevron-right" size="14px" :class="themeStore.getThemeClass('textSecondary')" />
                  </div>
                </div>

                <!-- 流式加载指示器 -->
                <div v-if="message.streaming" class="mt-4">
                  <div class="flex items-center space-x-2">
                    <div :class="['w-2 h-2 rounded-full animate-pulse', themeStore.getThemeClass('primary')]"></div>
                    <div :class="['w-2 h-2 rounded-full animate-pulse delay-100', themeStore.getThemeClass('info')]"></div>
                    <div :class="['w-2 h-2 rounded-full animate-pulse delay-200', themeStore.getThemeClass('success')]"></div>
                    <span :class="themeStore.getThemeClass('textSecondary')" class="text-xs ml-2">思考中...</span>
                  </div>
                </div>

                <!-- 消息操作 -->
                <div v-if="!message.streaming" :class="['flex items-center justify-between mt-4 pt-4 border-t', themeStore.getThemeClass('border')]">
                  <span :class="themeStore.getThemeClass('textSecondary')" class="text-xs">{{ formatTime(message.timestamp) }}</span>
                  <div class="flex items-center space-x-2">
                    <button @click="copyMessage(message)" :class="['p-2 rounded-xl transition-colors', 'hover:' + themeStore.getThemeClass('accent')]">
                      <t-icon name="copy" size="12px" :class="themeStore.getThemeClass('textSecondary')" />
                    </button>
                    <button @click="regenerateMessage(message)" :class="['p-2 rounded-xl transition-colors', 'hover:' + themeStore.getThemeClass('accent')]">
                      <t-icon name="refresh" size="12px" :class="themeStore.getThemeClass('textSecondary')" />
                    </button>
                    <button @click="likeMessage(message)" :class="['p-2 rounded-xl transition-colors', 'hover:' + themeStore.getThemeClass('accent')]">
                      <t-icon name="heart" size="12px" :class="themeStore.getThemeClass('textSecondary')" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部输入区域 -->
      <div :class="['border-t backdrop-blur-xl p-6', themeStore.getThemeClass('border'), themeStore.getThemeClass('cardBackground')]">
        <div class="max-w-[1980px] mx-auto">
          <!-- 停止生成按钮 -->
          <div v-if="isLoading" class="flex justify-center mb-4">
            <button 
              @click="stopGeneration"
              :class="[
                'flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 border hover:shadow-lg',
                themeStore.getThemeClass('error'),
                'hover:' + themeStore.getThemeClass('error'),
                'text-white'
              ]"
            >
              <t-icon name="square" size="16px" />
              <span>停止生成</span>
            </button>
          </div>

          <!-- 主输入区域 -->
          <div class="relative">
            <!-- 功能按钮行 -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <!-- 网络搜索 -->
                <button 
                  @click="toggleWebSearch"
                  :class="[
                    'flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm transition-all duration-300 hover:scale-105 border',
                    enableWebSearch ? 
                      [themeStore.getThemeClass('info'), themeStore.getThemeClass('border'), 'text-white shadow-lg'] : 
                      [themeStore.getThemeClass('accent'), 'hover:' + themeStore.getThemeClass('accentLight'), themeStore.getThemeClass('textSecondary'), themeStore.getThemeClass('border')]
                  ]"
                  :disabled="enableAgentMode"
                >
                  <t-icon name="search" size="14px" />
                  <span>网络搜索</span>
                </button>

                <!-- 代码模式 -->
                <button 
                  @click="toggleCodeMode"
                  :class="[
                    'flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm transition-all duration-300 hover:scale-105 border',
                    enableCode ? 
                      [themeStore.getThemeClass('success'), themeStore.getThemeClass('border'), 'text-white shadow-lg'] : 
                      [themeStore.getThemeClass('accent'), 'hover:' + themeStore.getThemeClass('accentLight'), themeStore.getThemeClass('textSecondary'), themeStore.getThemeClass('border')]
                  ]"
                  :disabled="enableAgentMode"
                >
                  <t-icon name="code" size="14px" />
                  <span>代码模式</span>
                </button>

                <!-- Agent模式 -->
                <button 
                  @click="toggleAgentMode"
                  :class="[
                    'flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm transition-all duration-300 hover:scale-105 border',
                    enableAgentMode ? 
                      [themeStore.getThemeClass('primary'), themeStore.getThemeClass('border'), 'text-white shadow-lg'] : 
                      [themeStore.getThemeClass('accent'), 'hover:' + themeStore.getThemeClass('accentLight'), themeStore.getThemeClass('textSecondary'), themeStore.getThemeClass('border')]
                  ]"
                >
                  <t-icon name="zap" size="14px" />
                  <span>智能Agent</span>
                </button>

                <!-- 数据报表 -->
                <button 
                  @click="toggleDataReport"
                  :class="[
                    'flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm transition-all duration-300 hover:scale-105 border',
                    enableDataReport ? 
                      [themeStore.getThemeClass('warning'), themeStore.getThemeClass('border'), 'text-white shadow-lg'] : 
                      [themeStore.getThemeClass('accent'), 'hover:' + themeStore.getThemeClass('accentLight'), themeStore.getThemeClass('textSecondary'), themeStore.getThemeClass('border')]
                  ]"
                  :disabled="uploadFiles.length > 0 || enableAgentMode"
                >
                  <t-icon name="fork" size="14px" />
                  <span>数据报表</span>
                </button>
              </div>

              <!-- 状态提示 -->
              <div v-if="enableAgentMode || enableDataReport" :class="['text-sm', themeStore.getThemeClass('textSecondary')]">
                <span v-if="enableAgentMode" :class="['px-3 py-1 rounded-2xl border', themeStore.getThemeClass('primaryLight'), themeStore.getThemeClass('textAccent'), themeStore.getThemeClass('border')]">
                  🧠 智能Agent模式
                </span>
                <span v-if="enableDataReport" :class="['px-3 py-1 rounded-2xl border ml-2', themeStore.getThemeClass('warning'), 'text-white', themeStore.getThemeClass('border')]">
                  📊 数据报表模式
                </span>
              </div>
            </div>

            <!-- 文件上传预览 -->
            <div v-if="uploadFiles.length > 0" class="mb-4">
              <div :class="['flex items-center space-x-3 p-4 rounded-2xl border', themeStore.getThemeClass('primaryLight'), themeStore.getThemeClass('border')]">
                <div class="flex items-center space-x-3 flex-1">
                  <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg', themeStore.getThemeClass('primary')]">
                    <t-icon name="paperclip" size="16px" class="text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p :class="themeStore.getThemeClass('textPrimary')" class="text-sm font-medium truncate">{{ getUploadFileName() }}</p>
                    <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs">附件文件</p>
                  </div>
                </div>
                <button @click="clearFiles" :class="['p-2 rounded-xl transition-colors', 'hover:' + themeStore.getThemeClass('accent')]">
                  <t-icon name="x" size="14px" :class="themeStore.getThemeClass('textSecondary')" />
                </button>
              </div>
            </div>

            <!-- 输入框 -->
            <div :class="['relative backdrop-blur-xl border rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border'), 'focus-within:' + themeStore.getThemeClass('borderHover'), 'focus-within:ring-2']">
              <!-- 输入区域 -->
              <div class="flex items-end p-4 space-x-4">
                <!-- 文件上传按钮 -->
                <t-upload
                  v-model="uploadFiles"
                  :auto-upload="false"
                  :show-upload-progress="false"
                  :multiple="false"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  class="shrink-0"
                >
                  <button :class="['p-3 rounded-2xl transition-all duration-300 hover:scale-105 group', themeStore.getThemeClass('accent'), 'hover:' + themeStore.getThemeClass('accentLight')]">
                    <t-icon name="link-1" size="18px" :class="[themeStore.getThemeClass('textSecondary'), 'group-hover:' + themeStore.getThemeClass('textAccent')]" />
                  </button>
                </t-upload>

                <!-- 文本输入 -->
                <div class="flex-1">
                  <textarea
                    v-model="inputMessage"
                    @keydown="handleKeyDown"
                    placeholder="输入您的科研问题..."
                    :class="['w-full bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-base leading-6', themeStore.getThemeClass('textPrimary'), 'placeholder-' + themeStore.getThemeClass('textSecondary')]"
                    :rows="inputMessage.includes('\n') ? Math.min(inputMessage.split('\n').length + 1, 6) : 1"
                    :style="{ maxHeight: '144px' }"
                  ></textarea>
                </div>

                <!-- 发送按钮 -->
                <button 
                  @click="sendMessage"
                  :disabled="!inputMessage.trim() && uploadFiles.length === 0"
                  :class="[
                    'p-3 rounded-2xl disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:scale-100 shrink-0 shadow-lg hover:shadow-xl',
                    themeStore.getThemeClass('primary'),
                    'hover:' + themeStore.getThemeClass('primaryHover'),
                    'disabled:opacity-50'
                  ]"
                >
                  <t-icon 
                    :name="isLoading ? 'loader' : 'send'" 
                    size="18px"
                    class="text-white"
                    :class="isLoading ? 'animate-spin' : ''"
                  />
                </button>
              </div>

              <!-- 底部提示 -->
              <div :class="['px-4 pb-3 flex items-center justify-between text-xs', themeStore.getThemeClass('textSecondary')]">
                <span>按回车发送，Shift+回车换行</span>
                <span>{{ inputMessage.length }}/2000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据报表预览面板 -->
    <div 
      v-if="showReportPanel && currentReport"
      :class="['w-1/2 backdrop-blur-xl border-l flex flex-col transition-all duration-300', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border')]"
    >
      <!-- 报表面板头部 -->
      <div :class="['flex items-center justify-between p-6 border-b', themeStore.getThemeClass('border')]">
        <div class="flex items-center space-x-3">
          <div :class="['w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg', themeStore.getThemeClass('warning')]">
            <t-icon name="bar-chart-3" size="18px" class="text-white" />
          </div>
          <h3 :class="themeStore.getThemeClass('textPrimary')" class="font-semibold">{{ currentReport.name }}</h3>
        </div>
        <div class="flex items-center space-x-2">
          <!-- 预览/代码切换 -->
          <div :class="['flex rounded-2xl p-1 border', themeStore.getThemeClass('accent'), themeStore.getThemeClass('border')]">
            <button 
              @click="reportViewMode = 'preview'"
              :class="[
                'px-4 py-2 text-sm rounded-xl transition-all duration-300',
                reportViewMode === 'preview' ? 
                  [themeStore.getThemeClass('primary'), 'text-white shadow-lg'] : 
                  [themeStore.getThemeClass('textSecondary'), 'hover:' + themeStore.getThemeClass('accentLight')]
              ]"
            >
              预览
            </button>
            <button 
              @click="reportViewMode = 'code'"
              :class="[
                'px-4 py-2 text-sm rounded-xl transition-all duration-300',
                reportViewMode === 'code' ? 
                  [themeStore.getThemeClass('primary'), 'text-white shadow-lg'] : 
                  [themeStore.getThemeClass('textSecondary'), 'hover:' + themeStore.getThemeClass('accentLight')]
              ]"
            >
              代码
            </button>
          </div>
          <button 
            @click="closeReportPanel"
            :class="['p-2 rounded-2xl transition-colors', 'hover:' + themeStore.getThemeClass('accent')]"
          >
            <t-icon name="x" size="16px" :class="themeStore.getThemeClass('textSecondary')" />
          </button>
        </div>
      </div>

      <!-- 报表内容 -->
      <div class="flex-1 overflow-hidden">
        <!-- 预览模式 -->
        <div v-if="reportViewMode === 'preview'" class="h-full overflow-auto p-6">
          <MarkitdownRenderer :content="currentReport.content" :isHtml="true" />
        </div>

        <!-- 代码模式 -->
        <div v-else class="h-full overflow-auto">
          <MarkitdownRenderer 
            :content="currentReport.htmlCode" 
            :isStreaming="true" 
            :streamContent="currentReport.htmlCode" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useThemeStore } from '@/stores/theme'
import MarkitdownRenderer from '@/components/MarkitdownRenderer.vue'

const chatStore = useChatStore()
const themeStore = useThemeStore()

// 输入消息
const inputMessage = ref('')
const uploadFiles = ref([])

// 功能按钮状态
const enableWebSearch = ref(false)
const enableCode = ref(false)
const enableAgentMode = ref(false)
const enableDataReport = ref(false)

// 流式输出状态
const currentTaskId = ref<string | null>(null)

// 数据报表相关状态
const showReportPanel = ref(false)
const currentReport = ref<{
  name: string
  content: string
  htmlCode: string
} | null>(null)
const reportViewMode = ref<'preview' | 'code'>('preview')

// 示例问题
const exampleQuestions = ref([
  '如何设计严谨的实验方案？',
  '帮我分析这篇论文的研究方法',
  '数据统计分析的最佳实践',
  '文献综述的撰写技巧'
])

// 计算属性
const isLoading = computed(() => chatStore.isLoading)

// 获取消息数量（带缓存）
const conversationCountCache = ref<Map<string, number>>(new Map())

function getCachedMessageCount(conversation: any) {
  const cacheKey = conversation.id
  
  // 检查缓存
  if (conversationCountCache.value.has(cacheKey)) {
    return conversationCountCache.value.get(cacheKey) || 0
  }
  
  // 计算消息数量
  let count = 0
  
  // 优先从API返回的消息数量
  if (conversation.message_count && typeof conversation.message_count === 'number') {
    count = conversation.message_count
  }
  // 其次从本地messages数组
  else if (conversation.messages && Array.isArray(conversation.messages)) {
    count = conversation.messages.length
  }
  // 如果是当前会话，从store中获取
  else if (conversation.id === chatStore.currentConversationId) {
    count = chatStore.messages.length
  }
  
  // 缓存结果
  conversationCountCache.value.set(cacheKey, count)
  
  return count
}

// 获取会话摘要
function getConversationSummary(conversation: any) {
  // 优先使用API返回的摘要
  if (conversation.summary) {
    return conversation.summary
  }
  
  // 如果有消息，使用第一条用户消息作为摘要
  if (conversation.messages && conversation.messages.length > 0) {
    const firstUserMessage = conversation.messages.find((msg: any) => msg.type === 'user')
    if (firstUserMessage && firstUserMessage.content) {
      return firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    }
  }
  
  // 如果是当前会话，从store中获取
  if (conversation.id === chatStore.currentConversationId && chatStore.messages.length > 0) {
    const firstUserMessage = chatStore.messages.find((msg: any) => msg.type === 'user')
    if (firstUserMessage && firstUserMessage.content) {
      return firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    }
  }
  
  return '开始您的科研探索之旅...'
}

// 获取会话首字母
function getConversationInitial(conversation: any) {
  const name = conversation.name || '新研究'
  return name.charAt(0).toUpperCase()
}

// 复制会话
function duplicateConversation(id: string) {
  const conversation = chatStore.conversations.find(conv => conv.id === id)
  if (conversation) {
    const newConversation = {
      ...conversation,
      id: Date.now().toString(),
      name: `${conversation.name || '新研究'} (副本)`,
      created_at: Date.now()
    }
    chatStore.conversations.unshift(newConversation)
    
    // 清空缓存
    conversationCountCache.value.clear()
  }
}

// 清空会话计数缓存
function clearConversationCache() {
  conversationCountCache.value.clear()
}

// 监听会话变化，清空缓存
watch(() => chatStore.conversations, () => {
  clearConversationCache()
}, { deep: true })

// 监听当前会话消息变化，更新缓存
watch(() => chatStore.messages, (newMessages) => {
  if (chatStore.currentConversationId) {
    conversationCountCache.value.set(chatStore.currentConversationId, newMessages.length)
  }
}, { deep: true })

// 功能按钮切换方法
function toggleWebSearch() {
  if (enableAgentMode.value) return
  enableWebSearch.value = !enableWebSearch.value
}

function toggleCodeMode() {
  if (enableAgentMode.value) return
  enableCode.value = !enableCode.value
}

function toggleAgentMode() {
  enableAgentMode.value = !enableAgentMode.value
  if (enableAgentMode.value) {
    // Agent模式启用时，禁用其他模式
    enableWebSearch.value = false
    enableCode.value = false
    enableDataReport.value = false
  }
}

function toggleDataReport() {
  if (enableAgentMode.value || uploadFiles.value.length > 0) return
  enableDataReport.value = !enableDataReport.value
}

// 数据报表相关方法
function openReportPanel(reportName: string, htmlContent: string) {
  currentReport.value = {
    name: reportName,
    content: htmlContent,
    htmlCode: htmlContent
  }
  showReportPanel.value = true
}

function closeReportPanel() {
  showReportPanel.value = false
  currentReport.value = null
}

// 处理HTML报表标签
function extractHtmlReport(content: string) {
  const htmlReportRegex = /<html_report>([\s\S]*?)<\/html_report>/g
  const matches = []
  let match
  
  while ((match = htmlReportRegex.exec(content)) !== null) {
    matches.push(match[1])
  }
  
  return matches
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 发送消息
async function sendMessage() {
  if (!inputMessage.value.trim() && uploadFiles.value.length === 0) return
  
  try {
    // 构建inputs参数，确保所有功能参数都有值
    const inputs: Record<string, any> = {
      enable_web_search: enableWebSearch.value ? 1 : 0,
      enable_code: enableCode.value ? 1 : 0,
      enable_agent_mode: enableAgentMode.value ? 1 : 0,
      enable_data_report: enableDataReport.value ? 1 : 0
    }
    
    // 准备文件数组
    const files = uploadFiles.value.length > 0 ? uploadFiles.value as File[] : undefined
    
    await chatStore.sendMessage(inputMessage.value, {
      files,
      inputs
    })
    
    // 清空输入
    inputMessage.value = ''
    uploadFiles.value = []
    
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

// 发送示例消息
function sendExampleMessage(message: string) {
  inputMessage.value = message
  sendMessage()
}

// 复制消息
function copyMessage(message: any) {
  const content = message.content || ''
  navigator.clipboard.writeText(content)
    .then(() => {
      // 显示复制成功提示
    })
}

// 重新生成消息
function regenerateMessage(message: any) {
  // 重新发送最后一条用户消息
  const lastUserMessage = chatStore.messages.find(m => m.type === 'user' && m.timestamp < message.timestamp)
  if (lastUserMessage && lastUserMessage.content) {
    sendExampleMessage(lastUserMessage.content)
  }
}

// 点赞消息
function likeMessage(message: any) {
  // 实现点赞逻辑
  console.log('点赞消息:', message.id)
}

// 重命名对话
function renameConversation(id: string) {
  // 实现重命名逻辑
  console.log('重命名对话:', id)
}

// 分享对话
function shareConversation(id: string) {
  // 实现分享逻辑
  console.log('分享对话:', id)
}

// 删除对话
function deleteConversation(id: string) {
  // 从conversations中删除指定对话
  const index = chatStore.conversations.findIndex(conv => conv.id === id)
  if (index !== -1) {
    chatStore.conversations.splice(index, 1)
    if (chatStore.currentConversationId === id) {
      chatStore.createNewConversation()
    }
  }
}

// 清除文件
function clearFiles() {
  uploadFiles.value = []
}

// 格式化时间
function formatTime(time: number | string | Date) {
  // 处理空值或undefined
  if (!time) {
    return '刚刚'
  }
  
  try {
    const date = new Date(time)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '刚刚'
    }
    
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.warn('时间格式化失败:', time, error)
    return '刚刚'
  }
}

// 获取上传文件名称
function getUploadFileName() {
  return uploadFiles.value.length > 0 ? (uploadFiles.value[0] as File).name : ''
}

// 获取显示内容
function getDisplayContent(message: any) {
  // 确保内容存在，否则返回空字符串
  const content = message.content || ''
  
  // 在流式输出过程中，移除可能不完整的HTML报表标签
  if (message.streaming) {
    // 流式输出时，移除任何可能的html_report标签（包括不完整的）
    return content
      .replace(/<html_report>[\s\S]*?<\/html_report>/g, '')
      .replace(/<html_report>[\s\S]*$/g, '') // 移除不完整的开始标签
      .trim()
  }
  // 流式输出完成后，移除完整的HTML报表标签，只显示其他内容
  return content.replace(/<html_report>[\s\S]*?<\/html_report>/g, '').trim()
}

// 判断是否有HTML报表
function hasHtmlReport(message: any) {
  // 只在流式输出完成后才检测HTML报表，避免不完整的标签导致布局问题
  if (message.streaming) {
    return false
  }
  // 确保内容存在
  const content = message.content || ''
  // 检查是否包含完整的HTML报表标签
  return /<html_report>[\s\S]*?<\/html_report>/.test(content)
}

// 停止生成
async function stopGeneration() {
  try {
    await chatStore.stopGeneration()
  } catch (error) {
    console.error('停止生成失败:', error)
  }
}

// 组件挂载
onMounted(() => {
  chatStore.loadConversations()
})

// 添加新的会话加载方法
async function loadConversationWithDebug(id: string) {
  console.log('🔄 开始加载对话:', id)
  
  try {
    console.log('📊 当前会话列表:', chatStore.conversations.length, '个会话')
    console.log('🎯 目标会话信息:', chatStore.conversations.find(conv => conv.id === id))
    
    // 调用store的加载方法
    console.log('🌐 调用API加载会话消息...')
    await chatStore.loadConversation(id)
    
    console.log('✅ API调用完成')
    console.log('📨 加载的消息数量:', chatStore.messages.length)
    console.log('🆔 当前会话ID:', chatStore.currentConversationId)
    
    if (chatStore.messages.length > 0) {
      console.log('📝 消息列表:', chatStore.messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: (msg.content || '').substring(0, 50) + '...',
        timestamp: new Date(msg.timestamp).toLocaleString()
      })))
    } else {
      console.log('⚠️ 没有从API获取到消息，尝试从本地数据加载...')
      
      // 如果没有消息，尝试从本地会话数据加载
      const conversation = chatStore.conversations.find(conv => conv.id === id)
      if (conversation && conversation.messages && conversation.messages.length > 0) {
        console.log('💾 从本地会话数据加载消息:', conversation.messages.length, '条')
        console.log('📝 本地消息:', conversation.messages)
        
        // 清空当前消息并重新加载
        chatStore.messages.splice(0)
        conversation.messages.forEach(msg => {
          chatStore.addMessage(msg)
        })
        
        console.log('✅ 本地消息加载完成，当前消息数:', chatStore.messages.length)
      } else {
        console.log('❌ 该会话没有历史消息或消息为空')
        
        // 显示提示消息
        const infoMessage = {
          id: Date.now().toString(),
          type: 'assistant' as const,
          content: '这是一个新的对话，还没有历史消息。您可以开始提问！',
          timestamp: Date.now()
        }
        chatStore.addMessage(infoMessage)
      }
    }
    
    console.log('🎉 会话加载完成！')
    
  } catch (error) {
    console.error('❌ 加载会话失败:', error)
    
    // 显示错误提示
    const errorMessage = {
      id: Date.now().toString(),
      type: 'assistant' as const,
      content: `加载历史会话时出现错误：${error instanceof Error ? error.message : String(error)}\n\n请检查网络连接或稍后再试。您也可以创建新对话继续使用。`,
      timestamp: Date.now()
    }
    chatStore.addMessage(errorMessage)
  }
}
</script> 

<style scoped>
/* 淡紫色科研主题动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 脉冲动画 */
.animate-pulse-soft {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-soft {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.7; 
    transform: scale(1.05);
  }
}

/* 科研主题的渐变背景 */
.bg-gradient-research {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.1) 0%, 
    rgba(124, 58, 237, 0.1) 25%, 
    rgba(99, 102, 241, 0.1) 50%, 
    rgba(79, 70, 229, 0.1) 75%, 
    rgba(67, 56, 202, 0.1) 100%);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(139, 92, 246, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgb(139, 92, 246), rgb(124, 58, 237));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgb(124, 58, 237), rgb(99, 102, 241));
}

/* 暗黑模式滚动条 */
.dark ::-webkit-scrollbar-track {
  background: rgba(139, 92, 246, 0.2);
}

.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(124, 58, 237, 0.6));
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(124, 58, 237, 0.8));
}

/* 会话列表专用滚动条样式 */
.conversation-list::-webkit-scrollbar {
  width: 6px;
}

.conversation-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.conversation-list::-webkit-scrollbar-thumb {
  background: var(--theme-primary, linear-gradient(135deg, rgb(139, 92, 246), rgb(124, 58, 237)));
  border-radius: 3px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.conversation-list::-webkit-scrollbar-thumb:hover {
  opacity: 1;
}

.conversation-list:hover::-webkit-scrollbar-thumb {
  opacity: 0.9;
}

/* 收缩状态会话列表滚动条 */
.conversation-list-collapsed::-webkit-scrollbar {
  width: 4px;
}

.conversation-list-collapsed::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-list-collapsed::-webkit-scrollbar-thumb {
  background: var(--theme-primary, linear-gradient(135deg, rgb(139, 92, 246), rgb(124, 58, 237)));
  border-radius: 2px;
  opacity: 0.5;
}

.conversation-list-collapsed::-webkit-scrollbar-thumb:hover {
  opacity: 0.8;
}

/* 会话列表滚动平滑化 */
.conversation-list,
.conversation-list-collapsed {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.7) transparent;
}

/* Firefox 滚动条样式 */
.conversation-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.7) transparent;
}

.conversation-list-collapsed {
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.5) transparent;
}

/* 会话项动画增强 */
.conversation-list .group {
  transform-origin: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.conversation-list .group:hover {
  transform: scale(1.02) translateZ(0);
  box-shadow: 0 8px 30px rgba(var(--theme-primary-rgb, 139, 92, 246), 0.15);
}

.conversation-list .group.active {
  transform: scale(1.01);
  box-shadow: 0 4px 20px rgba(var(--theme-primary-rgb, 139, 92, 246), 0.2);
}

/* 会话项加载动画 */
@keyframes conversationSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.conversation-list .group {
  animation: conversationSlideIn 0.3s ease-out;
}

/* 未读消息指示器动画 */
@keyframes unreadPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.conversation-list [class*="animate-pulse"] {
  animation: unreadPulse 2s ease-in-out infinite;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .max-w-4xl {
    max-width: 100%;
    padding: 0 1rem;
  }
  
  .rounded-3xl {
    border-radius: 1.5rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
  
  .space-x-4 > * + * {
    margin-left: 0.75rem;
  }
  
  .space-x-3 > * + * {
    margin-left: 0.5rem;
  }
}

/* 延迟动画 */
.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

/* 文本裁剪 */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* 玻璃拟态效果 */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

/* 科研主题阴影 */
.shadow-research {
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
}

.shadow-research-lg {
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.2);
}

.dark .shadow-research {
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

.dark .shadow-research-lg {
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
}

/* 科研主题聚焦效果 */
.focus-within\:ring-purple-400\/20:focus-within {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

/* 科研主题渐变文本 */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-purple-600 {
  --tw-gradient-from: rgb(147 51 234);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(147, 51, 234, 0));
}

.via-violet-600 {
  --tw-gradient-stops: var(--tw-gradient-from), rgb(124 58 237), var(--tw-gradient-to, rgba(124, 58, 237, 0));
}

.to-indigo-600 {
  --tw-gradient-to: rgb(79 70 229);
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.text-transparent {
  color: transparent;
}
</style> 