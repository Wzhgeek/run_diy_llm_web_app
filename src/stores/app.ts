import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 状态
  const user = ref<User | null>({
    id: 'user-1',
    name: '学术研究员',
    avatar: '',
    email: 'researcher@example.com'
  })
  
  const theme = ref<'light' | 'dark'>('light')
  const sidebarCollapsed = ref(false)
  const currentPage = ref('workplace')

  // 计算属性
  const isAuthenticated = computed(() => !!user.value)
  const isDarkMode = computed(() => theme.value === 'dark')

  // Actions
  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setCurrentPage = (page: string) => {
    currentPage.value = page
  }

  const logout = () => {
    user.value = null
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      theme.value = savedTheme
    } else {
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  // 保存主题设置
  const saveTheme = () => {
    localStorage.setItem('theme', theme.value)
  }

  return {
    // 状态
    user,
    theme,
    sidebarCollapsed,
    currentPage,
    // 计算属性
    isAuthenticated,
    isDarkMode,
    // Actions
    setUser,
    toggleTheme,
    toggleSidebar,
    setCurrentPage,
    logout,
    initTheme,
    saveTheme
  }
}) 