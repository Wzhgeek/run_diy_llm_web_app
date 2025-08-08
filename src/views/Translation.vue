<template>
  <div class="h-full overflow-auto">
    <div class="max-w-7xl mx-auto p-8 space-y-8">
      <!-- 页面标题 -->
      <div class="text-center space-y-4 animate-fade-in-up">
        <div class="flex items-center justify-center space-x-3">
          <div class="icon-container icon-success w-16 h-16">
            <t-icon name="translate" size="32px" />
          </div>
          <div>
            <h1 class="text-4xl font-bold text-gradient">文献翻译</h1>
            <p class="text-lg text-slate-600 dark:text-slate-300">智能学术文档翻译与分析</p>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="data-grid animate-fade-in-up" style="animation-delay: 200ms">
        <div class="metric-card">
          <div class="icon-container icon-primary w-12 h-12 mb-4">
            <t-icon name="file-text" size="24px" />
          </div>
          <div class="metric-number">{{ stats.totalDocuments }}</div>
          <div class="metric-label">已处理文档</div>
        </div>
        <div class="metric-card">
          <div class="icon-container icon-success w-12 h-12 mb-4">
            <t-icon name="check-circle" size="24px" />
          </div>
          <div class="metric-number">{{ stats.successfulTranslations }}</div>
          <div class="metric-label">翻译成功</div>
        </div>
        <div class="metric-card">
          <div class="icon-container icon-warning w-12 h-12 mb-4">
            <t-icon name="clock" size="24px" />
          </div>
          <div class="metric-number">{{ stats.averageTime }}</div>
          <div class="metric-label">平均用时(分钟)</div>
        </div>
      </div>

      <!-- 主要功能区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 文件上传区域 -->
        <div class="research-card p-8 animate-fade-in-up" style="animation-delay: 400ms">
          <div class="flex items-center space-x-3 mb-6">
            <div class="icon-container icon-primary">
              <t-icon name="upload" size="20px" />
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">上传文档</h2>
          </div>

          <!-- 拖拽上传区域 -->
          <div 
            class="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center transition-all duration-300 hover:border-primary-400 dark:hover:border-primary-500"
            :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-900/20': isDragging }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
          >
            <div class="space-y-6">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-3xl flex items-center justify-center">
                <t-icon name="cloud-upload" size="40px" class="text-primary-600 dark:text-primary-400" />
              </div>
              
              <div class="space-y-2">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  拖拽文件到此处或点击上传
                </h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  支持 PDF、Word、TXT 格式，最大 10MB
                </p>
              </div>

              <t-upload
                v-model="uploadFiles"
                :auto-upload="false"
                :multiple="false"
                accept=".pdf,.doc,.docx,.txt"
                @change="handleFileSelect"
                class="inline-block"
              >
                <button class="btn-primary px-6 py-3">
                  <t-icon name="folder-open" size="18px" />
                  <span class="ml-2">选择文件</span>
                </button>
              </t-upload>
            </div>
          </div>

          <!-- 已选择的文件 -->
          <div v-if="selectedFile" class="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div class="flex items-center space-x-4">
              <div class="icon-container icon-success w-12 h-12">
                <t-icon name="file-text" size="20px" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 dark:text-slate-100">{{ selectedFile.name }}</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ formatFileSize(selectedFile.size) }} • {{ selectedFile.type.split('/')[1].toUpperCase() }}
                </p>
              </div>
              <button @click="removeFile" class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <t-icon name="close" size="16px" class="text-slate-400" />
              </button>
            </div>
          </div>

          <!-- 翻译设置 -->
          <div class="mt-6 space-y-4">
            <h3 class="font-semibold text-slate-900 dark:text-slate-100">翻译设置</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">源语言</label>
                <select v-model="translationSettings.sourceLanguage" class="input-modern">
                  <option value="auto">自动检测</option>
                  <option value="en">英文</option>
                  <option value="zh">中文</option>
                  <option value="ja">日文</option>
                  <option value="ko">韩文</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">目标语言</label>
                <select v-model="translationSettings.targetLanguage" class="input-modern">
                  <option value="zh">中文</option>
                  <option value="en">英文</option>
                  <option value="ja">日文</option>
                  <option value="ko">韩文</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">翻译模式</label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  v-for="mode in translationModes"
                  :key="mode.value"
                  @click="translationSettings.mode = mode.value"
                  :class="[
                    'p-3 rounded-xl border-2 transition-all duration-300 text-left',
                    translationSettings.mode === mode.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  ]"
                >
                  <div class="font-medium text-slate-900 dark:text-slate-100">{{ mode.label }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ mode.description }}</div>
                </button>
              </div>
            </div>
          </div>

          <!-- 开始翻译按钮 -->
          <button 
            @click="startTranslation"
            :disabled="!selectedFile || isTranslating"
            class="w-full mt-6 btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <t-icon 
              :name="isTranslating ? 'loading' : 'play'" 
              size="20px"
              :class="isTranslating ? 'animate-spin' : ''"
            />
            <span class="ml-2">
              {{ isTranslating ? '翻译中...' : '开始翻译' }}
            </span>
          </button>
        </div>

        <!-- 翻译结果区域 -->
        <div class="research-card p-8 animate-fade-in-up" style="animation-delay: 600ms">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="icon-container icon-success">
                <t-icon name="translate" size="20px" />
              </div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">翻译结果</h2>
            </div>
            <div v-if="translationResult" class="flex items-center space-x-2">
              <button @click="downloadResult" class="btn-secondary px-3 py-2 text-sm">
                <t-icon name="download" size="14px" />
                <span class="ml-1">下载</span>
              </button>
              <button @click="copyResult" class="btn-ghost px-3 py-2 text-sm">
                <t-icon name="copy" size="14px" />
                <span class="ml-1">复制</span>
              </button>
            </div>
          </div>

          <!-- 翻译进度 -->
          <div v-if="isTranslating" class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">翻译进度</span>
              <span class="text-sm font-bold text-primary-600 dark:text-primary-400">{{ translationProgress }}%</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div 
                class="h-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
                :style="{ width: `${translationProgress}%` }"
              ></div>
            </div>
            <div class="text-center">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">正在分析文档内容...</p>
            </div>
          </div>

          <!-- 翻译结果展示 -->
          <div v-else-if="translationResult" class="space-y-6">
            <!-- 原文预览 -->
            <div class="space-y-3">
              <h3 class="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <div class="w-3 h-3 bg-slate-400 rounded-full"></div>
                <span>原文预览</span>
              </h3>
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl max-h-40 overflow-y-auto">
                <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {{ translationResult.originalText.substring(0, 300) }}...
                </p>
              </div>
            </div>

            <!-- 译文 -->
            <div class="space-y-3">
              <h3 class="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span>翻译结果</span>
              </h3>
              <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl max-h-60 overflow-y-auto">
                <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {{ translationResult.translatedText }}
                </p>
              </div>
            </div>

            <!-- 翻译信息 -->
            <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>翻译质量: <span class="font-semibold text-emerald-600">{{ translationResult.quality }}</span></span>
              <span>用时: {{ translationResult.duration }}s</span>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center py-20 space-y-4">
            <div class="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <t-icon name="file-text" size="32px" class="text-slate-400" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">等待翻译</h3>
              <p class="text-slate-500 dark:text-slate-400">请先上传文档并配置翻译设置</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 翻译历史 -->
      <div class="research-card p-6 animate-fade-in-up" style="animation-delay: 800ms">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="icon-container icon-warning">
              <t-icon name="history" size="20px" />
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">翻译历史</h2>
          </div>
          <button class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            查看全部
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(history, index) in translationHistory"
            :key="history.id"
            class="floating-card p-4 cursor-pointer hover:shadow-glow transition-all duration-300"
            :style="{ animationDelay: `${1000 + index * 100}ms` }"
          >
            <div class="flex items-start space-x-3">
              <div class="icon-container w-10 h-10" :class="getFileTypeIcon(history.fileType)">
                <t-icon name="file-text" size="16px" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-slate-900 dark:text-slate-100 truncate">{{ history.fileName }}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ history.sourceLanguage }} → {{ history.targetLanguage }}
                </p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ formatTime(history.timestamp) }}</p>
              </div>
              <div class="badge badge-success">已完成</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 响应式数据
const uploadFiles = ref([])
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const isTranslating = ref(false)
const translationProgress = ref(0)
const translationResult = ref<any>(null)

// 统计数据
const stats = ref({
  totalDocuments: 47,
  successfulTranslations: 45,
  averageTime: 3.2
})

// 翻译设置
const translationSettings = ref({
  sourceLanguage: 'auto',
  targetLanguage: 'zh',
  mode: 'academic'
})

// 翻译模式
const translationModes = ref([
  {
    value: 'academic',
    label: '学术模式',
    description: '专业术语精准翻译'
  },
  {
    value: 'general',
    label: '通用模式',
    description: '日常文档翻译'
  }
])

// 翻译历史
const translationHistory = ref([
  {
    id: 1,
    fileName: '机器学习综述.pdf',
    sourceLanguage: '英文',
    targetLanguage: '中文',
    fileType: 'pdf',
    timestamp: Date.now() - 3600000
  },
  {
    id: 2,
    fileName: '深度学习论文.docx',
    sourceLanguage: '英文',
    targetLanguage: '中文',
    fileType: 'docx',
    timestamp: Date.now() - 7200000
  },
  {
    id: 3,
    fileName: '研究方法手册.txt',
    sourceLanguage: '英文',
    targetLanguage: '中文',
    fileType: 'txt',
    timestamp: Date.now() - 86400000
  }
])

// 拖拽事件处理
function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

// 文件选择处理
function handleFileSelect() {
  if (uploadFiles.value.length > 0) {
    selectedFile.value = uploadFiles.value[0] as File
  }
}

// 移除文件
function removeFile() {
  selectedFile.value = null
  uploadFiles.value = []
}

// 开始翻译
async function startTranslation() {
  if (!selectedFile.value) return
  
  isTranslating.value = true
  translationProgress.value = 0
  
  // 模拟翻译进度
  const progressInterval = setInterval(() => {
    translationProgress.value += Math.random() * 15
    if (translationProgress.value >= 100) {
      translationProgress.value = 100
      clearInterval(progressInterval)
      
      // 模拟翻译结果
      setTimeout(() => {
        translationResult.value = {
          originalText: 'This is a sample academic paper about machine learning algorithms and their applications in various domains...',
          translatedText: '这是一篇关于机器学习算法及其在各个领域应用的学术论文样本...',
          quality: '优秀',
          duration: 3.2
        }
        isTranslating.value = false
      }, 1000)
    }
  }, 200)
}

// 下载结果
function downloadResult() {
  // 实现下载逻辑
  console.log('下载翻译结果')
}

// 复制结果
function copyResult() {
  if (translationResult.value) {
    navigator.clipboard.writeText(translationResult.value.translatedText)
  }
}

// 格式化文件大小
function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 获取文件类型图标
function getFileTypeIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
      return 'icon-warning'
    case 'docx':
    case 'doc':
      return 'icon-primary'
    default:
      return 'icon-success'
  }
}

// 格式化时间
function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
/* 自定义动画 */
.animate-fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 拖拽区域样式 */
.drag-over {
  border-color: rgb(8 145 214);
  background-color: rgb(240 249 255);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style> 