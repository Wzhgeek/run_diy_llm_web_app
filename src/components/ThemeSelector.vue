<template>
  <div class="theme-selector">
    <!-- 主题选择按钮 -->
    <button 
      @click="showThemePanel = !showThemePanel"
      :class="[
        'flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all duration-300 hover:scale-105',
        themeStore.getThemeClass('cardBackground'),
        themeStore.getThemeClass('border'),
        themeStore.getThemeClass('shadow')
      ]"
    >
      <t-icon :name="themeStore.theme.icon" size="16px" :class="themeStore.getThemeClass('textSecondary')" />
      <span :class="themeStore.getThemeClass('textPrimary')" class="text-sm font-medium">{{ themeStore.theme.displayName }}</span>
      <t-icon name="chevron-down" size="14px" :class="[themeStore.getThemeClass('textSecondary'), showThemePanel ? 'rotate-180' : '']" />
    </button>

    <!-- 主题面板 -->
    <Teleport to="body">
      <transition name="theme-panel">
        <div 
          v-if="showThemePanel"
          :class="[
            'fixed rounded-3xl border backdrop-blur-xl z-[9999]',
            themeStore.getThemeClass('cardBackground'),
            themeStore.getThemeClass('border'),
            themeStore.getThemeClass('shadow')
          ]"
          :style="panelStyle"
        >
          <!-- 面板头部 -->
          <div class="p-4 border-b" :class="themeStore.getThemeClass('border')">
            <div class="flex items-center justify-between">
              <h3 :class="themeStore.getThemeClass('textPrimary')" class="text-lg font-semibold">选择主题</h3>
              <button 
                @click="showThemePanel = false"
                class="p-2 rounded-xl hover:bg-opacity-20 transition-colors"
                :class="themeStore.getThemeClass('accent')"
              >
                <t-icon name="x" size="16px" :class="themeStore.getThemeClass('textSecondary')" />
              </button>
            </div>
            <p :class="themeStore.getThemeClass('textSecondary')" class="text-sm mt-1">个性化你的聊天体验</p>
          </div>

          <!-- 主题网格 -->
          <div class="p-4 space-y-2 max-h-96 overflow-y-auto">
            <div 
              v-for="theme in themeStore.themes"
              :key="theme.name"
              @click="selectTheme(theme.name)"
              :class="[
                'relative flex items-center space-x-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] group',
                theme.name === themeStore.currentTheme ? 
                  'ring-2 ring-offset-2 ring-opacity-50' : '',
                getThemePreviewClass(theme, 'cardBackground'),
                getThemePreviewClass(theme, 'border'),
                'hover:shadow-lg'
              ]"
            >
              <!-- 主题图标 -->
              <div 
                :class="[
                  'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg',
                  getThemePreviewClass(theme, 'primary')
                ]"
              >
                <t-icon :name="theme.icon" size="20px" class="text-white" />
              </div>

              <!-- 主题信息 -->
              <div class="flex-1">
                <h4 :class="getThemePreviewClass(theme, 'textPrimary')" class="font-medium">{{ theme.displayName }}</h4>
                <p :class="getThemePreviewClass(theme, 'textSecondary')" class="text-sm">{{ theme.description }}</p>
              </div>

              <!-- 颜色预览 -->
              <div class="flex space-x-1">
                <div 
                  :class="[
                    'w-4 h-4 rounded-full',
                    getThemePreviewClass(theme, 'primary')
                  ]"
                ></div>
                <div 
                  :class="[
                    'w-4 h-4 rounded-full',
                    getThemePreviewClass(theme, 'success')
                  ]"
                ></div>
                <div 
                  :class="[
                    'w-4 h-4 rounded-full',
                    getThemePreviewClass(theme, 'warning')
                  ]"
                ></div>
              </div>

              <!-- 选中状态 -->
              <div 
                v-if="theme.name === themeStore.currentTheme"
                :class="[
                  'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center',
                  getThemePreviewClass(theme, 'primary')
                ]"
              >
                <t-icon name="check" size="12px" class="text-white" />
              </div>
            </div>
          </div>

          <!-- 面板底部 -->
          <div class="p-4 border-t" :class="themeStore.getThemeClass('border')">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <t-icon name="palette" size="14px" :class="themeStore.getThemeClass('textSecondary')" />
                <span :class="themeStore.getThemeClass('textSecondary')" class="text-xs">{{ themeStore.themes.length }} 个主题可选</span>
              </div>
              <button 
                @click="resetTheme"
                class="text-xs px-3 py-1 rounded-xl hover:bg-opacity-20 transition-colors"
                :class="[themeStore.getThemeClass('textSecondary'), themeStore.getThemeClass('accent')]"
              >
                重置默认
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- 遮罩层 -->
    <Teleport to="body">
      <div 
        v-if="showThemePanel"
        @click="showThemePanel = false"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
      ></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { ThemeColors } from '@/stores/theme'

const themeStore = useThemeStore()
const showThemePanel = ref(false)

// 面板定位样式
const panelStyle = computed(() => {
  return {
    width: '320px',
    top: '80px',
    right: '20px'
  }
})

// 选择主题
const selectTheme = (themeName: string) => {
  themeStore.setTheme(themeName)
  showThemePanel.value = false
}

// 重置主题
const resetTheme = () => {
  themeStore.setTheme('research-purple')
  showThemePanel.value = false
}

// 获取主题预览类名
const getThemePreviewClass = (theme: ThemeColors, type: keyof ThemeColors['colors']) => {
  const colors = theme.colors[type]
  if (colors.startsWith('from-')) {
    return `bg-gradient-to-r ${colors}`
  }
  return colors
}
</script>

<style scoped>
.theme-selector {
  position: relative;
}

/* 主题面板动画 */
.theme-panel-enter-active,
.theme-panel-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-panel-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.theme-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 暗黑模式滚动条 */
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 旋转动画 */
.rotate-180 {
  transform: rotate(180deg);
}
</style> 