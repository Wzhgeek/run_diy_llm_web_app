<template>
  <div class="h-full overflow-auto">
    <div class="max-w-7xl mx-auto p-8 space-y-8">
      <!-- 欢迎横幅 -->
      <div class="relative">
        <div :class="['glass-card p-8 overflow-hidden backdrop-blur-xl border rounded-3xl', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border')]">
          <!-- 背景装饰 -->
          <div :class="['absolute inset-0 bg-gradient-to-r opacity-20', themeStore.getThemeClass('gradient')]"></div>
          <div :class="['absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30', themeStore.getThemeClass('primary')]"></div>
          <div :class="['absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-20', themeStore.getThemeClass('warning')]"></div>
          
          <div class="relative flex items-center justify-between">
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div :class="['w-2 h-8 rounded-full', themeStore.getThemeClass('gradient')]"></div>
                <div>
                  <h1 :class="['text-3xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent', themeStore.getThemeClass('gradient')]">
                    欢迎回来，{{ userName }}
                  </h1>
                  <p :class="themeStore.getThemeClass('textSecondary')" class="text-lg">
                    让我们一起探索知识的边界
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-6 text-sm">
                <div class="flex items-center space-x-2" :class="themeStore.getThemeClass('textSecondary')">
                  <div :class="['w-2 h-2 rounded-full animate-pulse', themeStore.getThemeClass('success')]"></div>
                  <span>系统运行正常</span>
                </div>
                <div class="flex items-center space-x-2" :class="themeStore.getThemeClass('textSecondary')">
                  <t-icon name="time" size="14px" />
                  <span>{{ currentTime }}</span>
                </div>
              </div>
            </div>
            
            <div class="hidden lg:block">
              <div class="relative w-24 h-24">
                <div :class="['absolute inset-0 rounded-3xl animate-float shadow-lg', themeStore.getThemeClass('primary')]"></div>
                <div :class="['absolute inset-2 rounded-2xl flex items-center justify-center', themeStore.getThemeClass('cardBackground')]">
                  <t-icon name="highlight-1" size="64px" :class="themeStore.getThemeClass('textSecondary')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速统计 -->
      <div class="data-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(stat, index) in stats" 
          :key="stat.label"
          :class="['metric-card p-6 rounded-3xl backdrop-blur-xl border animate-fade-in-up hover:scale-[1.02] transition-all duration-300', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border')]"
          :style="{ animationDelay: `${index * 150}ms` }"
        >
          <div class="flex items-center justify-between mb-4">
            <div :class="['icon-container w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg', themeStore.getThemeClass(stat.iconClass)]">
              <t-icon :name="stat.icon" size="24px" class="text-white" />
            </div>
            <div :class="['badge px-3 py-1 rounded-xl text-xs font-medium', themeStore.getThemeClass(stat.badgeClass)]">
              {{ stat.change }}
            </div>
          </div>
          <div class="text-left">
            <div :class="['metric-number text-2xl font-bold', themeStore.getThemeClass('textPrimary')]">{{ stat.value }}</div>
            <div :class="['metric-label text-sm font-medium', themeStore.getThemeClass('textSecondary')]">{{ stat.label }}</div>
            <div :class="['text-xs mt-1', themeStore.getThemeClass('textSecondary')]">
              {{ stat.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- 主要功能区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 快速启动 -->
        <div :class="['research-card p-6 rounded-3xl backdrop-blur-xl border animate-fade-in-up', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border')]" style="animation-delay: 600ms">
          <div class="flex items-center space-x-3 mb-6">
            <div :class="['icon-container w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg', themeStore.getThemeClass('primary')]">
              <t-icon name="rocket" size="20px" class="text-white" />
            </div>
            <h2 :class="themeStore.getThemeClass('textPrimary')" class="text-xl font-bold">快速启动</h2>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <router-link
              v-for="action in quickActions"
              :key="action.name"
              :to="action.path"
              :class="['group p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl', themeStore.getThemeClass('border'), 'hover:' + themeStore.getThemeClass('borderHover')]"
            >
              <div class="flex items-start space-x-3">
                <div :class="['icon-container w-10 h-10 rounded-xl flex items-center justify-center shadow-lg', themeStore.getThemeClass(action.iconClass)]">
                  <t-icon :name="action.icon" size="18px" class="text-white" />
                </div>
                <div class="flex-1">
                  <h3 :class="['font-semibold mb-1 transition-colors', themeStore.getThemeClass('textPrimary'), 'group-hover:' + themeStore.getThemeClass('textAccent')]">
                    {{ action.title }}
                  </h3>
                  <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm">
                    {{ action.description }}
                  </p>
                </div>
                <t-icon name="chevron-right" size="16px" :class="['transition-all duration-300 group-hover:translate-x-1', themeStore.getThemeClass('textSecondary'), 'group-hover:' + themeStore.getThemeClass('textAccent')]" />
              </div>
            </router-link>
          </div>
        </div>

        <!-- 最近活动 -->
        <div :class="['research-card p-6 rounded-3xl backdrop-blur-xl border animate-fade-in-up', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border')]" style="animation-delay: 750ms">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div :class="['icon-container w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg', themeStore.getThemeClass('success')]">
                <t-icon name="history" size="20px" class="text-white" />
              </div>
              <h2 :class="themeStore.getThemeClass('textPrimary')" class="text-xl font-bold">最近活动</h2>
            </div>
            <button :class="['text-sm font-medium', themeStore.getThemeClass('textSecondary'), 'hover:' + themeStore.getThemeClass('textAccent')]">
              查看全部
            </button>
          </div>
          
          <div class="space-y-3">
            <div 
              v-for="(activity, index) in recentActivities" 
              :key="activity.id"
              :class="['group flex items-start space-x-3 p-3 rounded-2xl transition-all duration-200 hover:scale-[1.02]', 'hover:' + themeStore.getThemeClass('accent')]"
              :style="{ animationDelay: `${900 + index * 100}ms` }"
            >
              <div :class="['icon-container w-8 h-8 rounded-xl flex items-center justify-center shadow-lg', themeStore.getThemeClass(activity.iconClass)]">
                <t-icon :name="activity.icon" size="14px" class="text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p :class="['text-sm font-medium transition-colors', themeStore.getThemeClass('textPrimary'), 'group-hover:' + themeStore.getThemeClass('textAccent')]">
                  {{ activity.title }}
                </p>
                <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs mt-1">
                  {{ activity.time }} · {{ activity.type }}
                </p>
              </div>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <t-icon name="chevron-right" size="14px" :class="themeStore.getThemeClass('textSecondary')" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 研究进展 -->
      <div :class="['research-card p-6 rounded-3xl backdrop-blur-xl border animate-fade-in-up', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border')]" style="animation-delay: 1200ms">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div :class="['icon-container w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg', themeStore.getThemeClass('warning')]">
              <t-icon name="trending-up" size="20px" class="text-white" />
            </div>
            <div>
              <h2 :class="themeStore.getThemeClass('textPrimary')" class="text-xl font-bold">研究进展</h2>
              <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm">本周研究活动概览</p>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="(progress, index) in researchProgress"
            :key="progress.title"
            class="space-y-3"
            :style="{ animationDelay: `${1400 + index * 100}ms` }"
          >
            <div class="flex items-center justify-between">
              <span :class="themeStore.getThemeClass('textPrimary')" class="text-sm font-medium">
                {{ progress.title }}
              </span>
              <span :class="themeStore.getThemeClass('textAccent')" class="text-sm font-bold">
                {{ progress.percentage }}%
              </span>
            </div>
            <div :class="['w-full rounded-full h-2', themeStore.getThemeClass('accent')]">
              <div 
                :class="['h-2 rounded-full transition-all duration-1000 ease-out', themeStore.getThemeClass(progress.colorClass)]"
                :style="{ width: `${progress.percentage}%` }"
              ></div>
            </div>
            <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs">
              {{ progress.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- 快捷工具栏 -->
      <div :class="['floating-card p-4 rounded-3xl backdrop-blur-xl border animate-fade-in-up', themeStore.getThemeClass('cardBackground'), themeStore.getThemeClass('border')]" style="animation-delay: 1800ms">
        <div class="flex flex-wrap items-center justify-center gap-4">
          <button 
            v-for="tool in quickTools"
            :key="tool.name"
            :class="['flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg', themeStore.getThemeClass('accent'), 'hover:' + themeStore.getThemeClass('accentLight')]"
            @click="tool.action"
          >
            <t-icon :name="tool.icon" size="16px" :class="themeStore.getThemeClass('textSecondary')" />
            <span :class="themeStore.getThemeClass('textPrimary')" class="text-sm font-medium">{{ tool.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// 用户信息
const userName = ref('研究员')
const currentTime = ref('')

// 快速统计数据
const stats = ref([
  {
    label: '今日对话',
    value: '23',
    change: '+12%',
    description: '较昨日增长',
    icon: 'chat',
    iconClass: 'primary' as const,
    badgeClass: 'success' as const
  },
  {
    label: '处理文档',
    value: '8',
    change: '+25%',
    description: '本周已完成',
    icon: 'file',
    iconClass: 'info' as const,
    badgeClass: 'success' as const
  },
  {
    label: '知识条目',
    value: '156',
    change: '+5%',
    description: '知识库增长',
    icon: 'book',
    iconClass: 'warning' as const,
    badgeClass: 'info' as const
  },
  {
    label: '研究进度',
    value: '78%',
    change: '+8%',
    description: '本月完成度',
    icon: 'trending-up',
    iconClass: 'success' as const,
    badgeClass: 'warning' as const
  }
])

// 快速启动
const quickActions = ref([
  {
    name: 'ai-chat',
    path: '/ai-chat',
    title: 'AI对话',
    description: '开始智能对话',
    icon: 'chat',
    iconClass: 'primary' as const
  },
  {
    name: 'translation',
    path: '/translation',
    title: '文献翻译',
    description: '翻译学术文档',
    icon: 'translate',
    iconClass: 'info' as const
  },
  {
    name: 'knowledge',
    path: '/knowledge',
    title: '知识库',
    description: '管理研究资料',
    icon: 'folder',
    iconClass: 'warning' as const
  },
  {
    name: 'data-analysis',
    path: '/data-analysis',
    title: '数据分析',
    description: '统计与可视化',
    icon: 'chart-bar',
    iconClass: 'success' as const
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '完成论文翻译：机器学习在医学诊断中的应用',
    time: '2小时前',
    type: '文献翻译',
    icon: 'translate',
    iconClass: 'info' as const
  },
  {
    id: 2,
    title: '与AI助手讨论研究方法论',
    time: '4小时前',
    type: 'AI对话',
    icon: 'chat',
    iconClass: 'primary' as const
  },
  {
    id: 3,
    title: '上传新的研究数据集',
    time: '昨天',
    type: '数据管理',
    icon: 'database',
    iconClass: 'success' as const
  },
  {
    id: 4,
    title: '创建知识库条目：深度学习基础',
    time: '2天前',
    type: '知识管理',
    icon: 'book',
    iconClass: 'warning' as const
  }
])

// 研究进展
const researchProgress = ref([
  {
    title: '文献调研',
    percentage: 85,
    description: '已完成主要文献收集',
    colorClass: 'primary' as const
  },
  {
    title: '数据收集',
    percentage: 60,
    description: '数据采集进行中',
    colorClass: 'info' as const
  },
  {
    title: '实验设计',
    percentage: 40,
    description: '实验方案制定中',
    colorClass: 'warning' as const
  }
])

// 快捷工具
const quickTools = ref([
  {
    name: '快速笔记',
    icon: 'edit',
    action: () => console.log('快速笔记')
  },
  {
    name: '语音转文字',
    icon: 'microphone',
    action: () => console.log('语音转文字')
  },
  {
    name: '文档扫描',
    icon: 'scan',
    action: () => console.log('文档扫描')
  },
  {
    name: '计算器',
    icon: 'calculator',
    action: () => console.log('计算器')
  }
])

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

let timeInterval: any = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000) // 每分钟更新一次
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* 动画效果 */
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

/* 玻璃拟态效果 */
.glass-card {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.floating-card {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* 渐变文本 */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.text-transparent {
  color: transparent;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .research-card {
    padding: 1rem;
  }
}
</style> 