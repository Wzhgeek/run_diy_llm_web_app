<template>
  <div id="app" :class="[
    'min-h-screen bg-gradient-to-br transition-all duration-300',
    themeStore.getThemeClass('background'),
    'dark:' + themeStore.getThemeClass('backgroundSecondary')
  ]">
    <!-- 主布局容器 -->
    <div class="flex h-screen relative">
      <!-- 侧边导航栏 -->
      <aside 
        :class="[
          'sidebar-modern relative z-20 transition-all duration-500 ease-in-out flex flex-col backdrop-blur-xl border-r',
          themeStore.getThemeClass('cardBackground'),
          themeStore.getThemeClass('border'),
          appStore.sidebarCollapsed ? 'w-20' : 'w-72'
        ]"
      >
        <!-- Logo区域 -->
        <div class="flex items-center h-20 px-6 relative">
          <div class="flex items-center space-x-4">
            <div class="icon-container group-hover:scale-110 transition-transform duration-300">
              <div :class="['w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center', themeStore.getThemeClass('primary')]">
                <t-icon name="beaker" size="20px" class="text-white" />
              </div>
            </div>
            <transition name="fade" mode="out-in">
              <div v-show="!appStore.sidebarCollapsed" class="flex flex-col">
                <h1 :class="['text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent', themeStore.getThemeClass('gradient')]">
                  智研助手
                </h1>
                <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs font-medium">
                  Research Assistant
                </p>
              </div>
            </transition>
          </div>
        </div>

        <!-- 导航菜单 -->
        <nav class="flex-1 px-3 py-6 space-y-2">
          <router-link
            v-for="navRoute in navigationRoutes"
            :key="navRoute.name"
            :to="navRoute.path"
            :class="[
              'nav-item group flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border relative overflow-hidden',
              route.name === navRoute.name 
                ? [themeStore.getThemeClass('primaryLight'), themeStore.getThemeClass('border'), themeStore.getThemeClass('shadow')]
                : ['hover:' + themeStore.getThemeClass('accent'), 'border-transparent']
            ]"
          >
            <div :class="['icon-container w-10 h-10 rounded-xl flex items-center justify-center shadow-lg', getNavIconClass(navRoute.meta.color)]">
              <t-icon :name="navRoute.meta.icon" size="20px" class="text-white" />
            </div>
            <transition name="fade" mode="out-in">
              <div v-show="!appStore.sidebarCollapsed" class="flex flex-col flex-1">
                <span :class="themeStore.getThemeClass('textPrimary')" class="text-sm font-medium">
                  {{ navRoute.meta.title }}
                </span>
                <span :class="themeStore.getThemeClass('textSecondary')" class="text-xs opacity-70">
                  {{ navRoute.meta.description }}
                </span>
              </div>
            </transition>
            <div v-show="!appStore.sidebarCollapsed && route.name === navRoute.name" 
                 :class="['ml-auto w-3 h-3 rounded-full animate-pulse', themeStore.getThemeClass('primary')]"></div>
          </router-link>
        </nav>

        <!-- 底部用户信息 -->
        <div :class="['p-4 border-t', themeStore.getThemeClass('border')]">
          <div :class="['flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] border', 'hover:' + themeStore.getThemeClass('accent'), 'border-transparent']">
            <div class="relative">
              <div :class="['w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center text-white font-semibold text-sm', themeStore.getThemeClass('success')]">
                研
              </div>
              <div :class="['absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full animate-pulse', themeStore.getThemeClass('success')]"></div>
            </div>
            <transition name="fade" mode="out-in">
              <div v-show="!appStore.sidebarCollapsed" class="flex-1 min-w-0">
                <p :class="themeStore.getThemeClass('textPrimary')" class="text-sm font-semibold">
                  {{ appStore.user?.name || '研究员' }}
                </p>
                <p :class="themeStore.getThemeClass('textSecondary')" class="text-xs">
                  {{ appStore.user?.email || 'researcher@edu.cn' }}
                </p>
              </div>
            </transition>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <!-- 顶部栏 -->
        <header :class="[
          'h-20 backdrop-blur-xl border-b flex items-center justify-between px-8',
          themeStore.getThemeClass('cardBackground'),
          themeStore.getThemeClass('border')
        ]">
          <div class="flex items-center space-x-6">
            <!-- 侧边栏切换按钮 -->
            <button 
              @click="appStore.toggleSidebar"
              :class="[
                'p-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg',
                themeStore.getThemeClass('accent'),
                'hover:' + themeStore.getThemeClass('accentLight')
              ]"
            >
              <t-icon 
                :name="appStore.sidebarCollapsed ? 'menu-unfold' : 'menu-fold'" 
                size="18px" 
                :class="themeStore.getThemeClass('textSecondary')"
              />
            </button>
            
            <!-- 页面标题 -->
            <div class="flex flex-col">
              <h2 :class="themeStore.getThemeClass('textPrimary')" class="text-xl font-bold">
                {{ currentRouteTitle }}
              </h2>
              <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm">
                {{ currentRouteDescription }}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <!-- 搜索 -->
            <div class="relative hidden md:block">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <t-icon name="search" size="16px" :class="themeStore.getThemeClass('textSecondary')" />
              </div>
              <input
                type="text"
                placeholder="搜索功能..."
                :class="[
                  'pl-10 pr-4 py-2 w-64 border-0 rounded-2xl text-sm transition-all duration-300',
                  themeStore.getThemeClass('accent'),
                  'placeholder:' + themeStore.getThemeClass('textSecondary'),
                  themeStore.getThemeClass('textPrimary'),
                  'focus:' + themeStore.getThemeClass('cardBackground'),
                  'focus:ring-2 focus:ring-' + themeStore.theme.colors.primary + '/20'
                ]"
              />
            </div>

            <!-- 主题选择器 -->
            <ThemeSelector />

            <!-- 通知 -->
            <button :class="[
              'relative p-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg',
              themeStore.getThemeClass('accent'),
              'hover:' + themeStore.getThemeClass('accentLight')
            ]">
              <t-icon name="notification" size="18px" :class="themeStore.getThemeClass('textSecondary')" />
              <div :class="['absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse', themeStore.getThemeClass('error')]"></div>
            </button>

            <!-- 明暗模式切换 -->
            <button 
              @click="appStore.toggleTheme"
              :class="[
                'p-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg',
                themeStore.getThemeClass('accent'),
                'hover:' + themeStore.getThemeClass('accentLight')
              ]"
            >
              <t-icon 
                :name="appStore.isDarkMode ? 'sunny' : 'moon'" 
                size="18px" 
                :class="themeStore.getThemeClass('textSecondary')"
              />
            </button>

            <!-- 设置菜单 -->
            <t-dropdown placement="bottom-right">
              <button :class="[
                'p-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg',
                themeStore.getThemeClass('accent'),
                'hover:' + themeStore.getThemeClass('accentLight')
              ]">
                <t-icon name="setting" size="18px" :class="themeStore.getThemeClass('textSecondary')" />
              </button>
              <t-dropdown-menu class="mt-2">
                <t-dropdown-item>
                  <t-icon name="user" size="16px" class="mr-2" />
                  个人中心
                </t-dropdown-item>
                <t-dropdown-item>
                  <t-icon name="setting" size="16px" class="mr-2" />
                  系统设置
                </t-dropdown-item>
                <t-dropdown-item>
                  <t-icon name="help-circle" size="16px" class="mr-2" />
                  帮助中心
                </t-dropdown-item>
                <t-dropdown-item>
                  <t-icon name="logout" size="16px" class="mr-2" />
                  退出登录
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>
        </header>

        <!-- 页面内容 -->
        <main class="flex-1 overflow-hidden relative">
          <!-- 背景装饰 -->
          <div :class="['absolute inset-0 pointer-events-none', themeStore.getThemeClass('accent')]"></div>
          
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <Suspense>
                <component :is="Component" class="relative z-10" />
                <template #fallback>
                  <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                      <div :class="['w-8 h-8 mx-auto mb-4 rounded-full animate-spin border-4 border-t-transparent', themeStore.getThemeClass('primary')]"></div>
                      <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm">加载中...</p>
                    </div>
                  </div>
                </template>
              </Suspense>
            </transition>
          </router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'
import ThemeSelector from '@/components/ThemeSelector.vue'

const route = useRoute()
const appStore = useAppStore()
const themeStore = useThemeStore()

// 导航路由配置
const navigationRoutes = [
  {
    name: 'WorkPlace',
    path: '/workplace',
    meta: { 
      title: '工作台', 
      description: '总览与快速访问',
      icon: 'dashboard',
      color: 'primary'
    }
  },
  {
    name: 'AIChat',
    path: '/ai-chat',
    meta: { 
      title: 'AI对话', 
      description: '智能研究助手',
      icon: 'chat',
      color: 'primary'
    }
  },
  {
    name: 'Translation',
    path: '/translation',
    meta: { 
      title: '文献翻译', 
      description: '学术文档处理',
      icon: 'translate',
      color: 'info'
    }
  },
  {
    name: 'KnowledgeBase',
    path: '/knowledge',
    meta: { 
      title: '知识库', 
      description: '研究资料管理',
      icon: 'folder',
      color: 'warning'
    }
  },
  {
    name: 'DataAnalysis',
    path: '/data-analysis',
    meta: { 
      title: '数据分析', 
      description: '统计与可视化',
      icon: 'chart-bar',
      color: 'success'
    }
  }
]

// 当前页面信息
const currentRouteTitle = computed(() => {
  const currentRoute = navigationRoutes.find(r => r.name === route.name)
  return currentRoute?.meta.title || '未知页面'
})

const currentRouteDescription = computed(() => {
  const currentRoute = navigationRoutes.find(r => r.name === route.name)
  return currentRoute?.meta.description || ''
})

// 获取导航图标样式
function getNavIconClass(color: string) {
  return themeStore.getThemeClass(color as keyof typeof themeStore.theme.colors)
}

// 初始化应用
onMounted(() => {
  appStore.initTheme()
})
</script>

<style scoped>
/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 侧边栏样式增强 */
.sidebar-modern::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(148, 163, 184, 0.2), transparent);
}

/* 导航项悬停效果 */
.nav-item {
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.nav-item:hover::before {
  left: 100%;
}

/* 玻璃拟态效果 */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .sidebar-modern {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 50;
    transform: translateX(-100%);
  }
  
  .sidebar-modern.mobile-open {
    transform: translateX(0);
  }
}

/* 渐变文本效果 */
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
</style>
