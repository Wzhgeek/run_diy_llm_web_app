import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ThemeColors {
  name: string
  displayName: string
  icon: string
  description: string
  colors: {
    // 主色调
    primary: string
    primaryHover: string
    primaryLight: string
    primaryDark: string
    
    // 背景色
    background: string
    backgroundSecondary: string
    
    // 卡片背景
    cardBackground: string
    cardBorder: string
    
    // 文本色
    textPrimary: string
    textSecondary: string
    textAccent: string
    
    // 边框色
    border: string
    borderHover: string
    
    // 阴影
    shadow: string
    shadowHover: string
    
    // 状态色
    success: string
    warning: string
    error: string
    info: string
    
    // 特殊效果
    gradient: string
    gradientHover: string
    accent: string
    accentLight: string
  }
}

export const themes: ThemeColors[] = [
  {
    name: 'research-purple',
    displayName: '科研紫',
    icon: 'beaker',
    description: '淡紫色科研主题，专业优雅',
    colors: {
      primary: 'from-purple-500 to-violet-600',
      primaryHover: 'from-purple-600 to-violet-700',
      primaryLight: 'from-purple-100 to-violet-100',
      primaryDark: 'from-purple-900/40 to-violet-900/40',
      
      background: 'from-purple-50/80 via-indigo-50/60 to-violet-50/80',
      backgroundSecondary: 'from-purple-950/40 via-indigo-950/30 to-violet-950/40',
      
      cardBackground: 'bg-white/90 dark:bg-slate-800/90',
      cardBorder: 'border-purple-200/50 dark:border-purple-700/50',
      
      textPrimary: 'text-slate-900 dark:text-slate-100',
      textSecondary: 'text-purple-600 dark:text-purple-400',
      textAccent: 'text-purple-700 dark:text-purple-300',
      
      border: 'border-purple-200/50 dark:border-purple-700/50',
      borderHover: 'border-purple-400 dark:border-purple-500',
      
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      
      success: 'from-emerald-500 to-teal-600',
      warning: 'from-orange-500 to-amber-600',
      error: 'from-red-500 to-pink-600',
      info: 'from-blue-500 to-cyan-600',
      
      gradient: 'from-purple-400 to-violet-600',
      gradientHover: 'from-purple-500 to-violet-700',
      accent: 'bg-purple-50 dark:bg-purple-900/20',
      accentLight: 'bg-purple-100 dark:bg-purple-900/30'
    }
  },
  {
    name: 'ocean-blue',
    displayName: '海洋蓝',
    icon: 'activity',
    description: '清新海洋蓝主题，宁静舒适',
    colors: {
      primary: 'from-blue-500 to-cyan-600',
      primaryHover: 'from-blue-600 to-cyan-700',
      primaryLight: 'from-blue-100 to-cyan-100',
      primaryDark: 'from-blue-900/40 to-cyan-900/40',
      
      background: 'from-blue-50/80 via-sky-50/60 to-cyan-50/80',
      backgroundSecondary: 'from-blue-950/40 via-sky-950/30 to-cyan-950/40',
      
      cardBackground: 'bg-white/90 dark:bg-slate-800/90',
      cardBorder: 'border-blue-200/50 dark:border-blue-700/50',
      
      textPrimary: 'text-slate-900 dark:text-slate-100',
      textSecondary: 'text-blue-600 dark:text-blue-400',
      textAccent: 'text-blue-700 dark:text-blue-300',
      
      border: 'border-blue-200/50 dark:border-blue-700/50',
      borderHover: 'border-blue-400 dark:border-blue-500',
      
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      
      success: 'from-emerald-500 to-teal-600',
      warning: 'from-orange-500 to-amber-600',
      error: 'from-red-500 to-pink-600',
      info: 'from-indigo-500 to-blue-600',
      
      gradient: 'from-blue-400 to-cyan-600',
      gradientHover: 'from-blue-500 to-cyan-700',
      accent: 'bg-blue-50 dark:bg-blue-900/20',
      accentLight: 'bg-blue-100 dark:bg-blue-900/30'
    }
  },
  {
    name: 'cyber-green',
    displayName: '科幻绿',
    icon: 'cpu',
    description: '科幻未来风格，酷炫科技感',
    colors: {
      primary: 'from-emerald-500 to-teal-600',
      primaryHover: 'from-emerald-600 to-teal-700',
      primaryLight: 'from-emerald-200/20 to-teal-200/20',
      primaryDark: 'from-emerald-900/60 to-teal-900/60',
      
      background: 'from-slate-950 via-emerald-950/30 to-teal-950/30',
      backgroundSecondary: 'from-slate-950 via-emerald-950/40 to-teal-950/40',
      
      cardBackground: 'bg-slate-800/90 dark:bg-slate-900/90',
      cardBorder: 'border-emerald-500/30 dark:border-emerald-400/40',
      
      textPrimary: 'text-slate-100 dark:text-slate-100',
      textSecondary: 'text-emerald-400 dark:text-emerald-300',
      textAccent: 'text-emerald-300 dark:text-emerald-200',
      
      border: 'border-emerald-500/30 dark:border-emerald-400/40',
      borderHover: 'border-emerald-400 dark:border-emerald-300',
      
      shadow: 'shadow-lg shadow-emerald-500/20',
      shadowHover: 'shadow-xl shadow-emerald-500/30',
      
      success: 'from-green-500 to-emerald-600',
      warning: 'from-yellow-500 to-orange-600',
      error: 'from-red-500 to-rose-600',
      info: 'from-cyan-500 to-blue-600',
      
      gradient: 'from-emerald-400 to-teal-600',
      gradientHover: 'from-emerald-500 to-teal-700',
      accent: 'bg-emerald-950/40 dark:bg-emerald-950/50',
      accentLight: 'bg-emerald-900/50 dark:bg-emerald-900/60'
    }
  },
  {
    name: 'sunset-orange',
    displayName: '日落橙',
    icon: 'sun',
    description: '温暖日落主题，活力四射',
    colors: {
      primary: 'from-orange-500 to-red-600',
      primaryHover: 'from-orange-600 to-red-700',
      primaryLight: 'from-orange-100 to-red-100',
      primaryDark: 'from-orange-900/40 to-red-900/40',
      
      background: 'from-orange-50/80 via-red-50/60 to-pink-50/80',
      backgroundSecondary: 'from-orange-950/40 via-red-950/30 to-pink-950/40',
      
      cardBackground: 'bg-white/90 dark:bg-slate-800/90',
      cardBorder: 'border-orange-200/50 dark:border-orange-700/50',
      
      textPrimary: 'text-slate-900 dark:text-slate-100',
      textSecondary: 'text-orange-600 dark:text-orange-400',
      textAccent: 'text-orange-700 dark:text-orange-300',
      
      border: 'border-orange-200/50 dark:border-orange-700/50',
      borderHover: 'border-orange-400 dark:border-orange-500',
      
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      
      success: 'from-green-500 to-emerald-600',
      warning: 'from-yellow-500 to-orange-600',
      error: 'from-red-500 to-pink-600',
      info: 'from-blue-500 to-cyan-600',
      
      gradient: 'from-orange-400 to-red-600',
      gradientHover: 'from-orange-500 to-red-700',
      accent: 'bg-orange-50 dark:bg-orange-900/20',
      accentLight: 'bg-orange-100 dark:bg-orange-900/30'
    }
  },
  {
    name: 'milkshake-pink',
    displayName: '奶昔粉',
    icon: 'heart',
    description: '甜美奶昔主题，温柔可爱',
    colors: {
      primary: 'from-pink-500 to-rose-600',
      primaryHover: 'from-pink-600 to-rose-700',
      primaryLight: 'from-pink-100 to-rose-100',
      primaryDark: 'from-pink-900/40 to-rose-900/40',
      
      background: 'from-pink-50/80 via-rose-50/60 to-red-50/80',
      backgroundSecondary: 'from-pink-950/40 via-rose-950/30 to-red-950/40',
      
      cardBackground: 'bg-white/90 dark:bg-slate-800/90',
      cardBorder: 'border-pink-200/50 dark:border-pink-700/50',
      
      textPrimary: 'text-slate-900 dark:text-slate-100',
      textSecondary: 'text-pink-600 dark:text-pink-400',
      textAccent: 'text-pink-700 dark:text-pink-300',
      
      border: 'border-pink-200/50 dark:border-pink-700/50',
      borderHover: 'border-pink-400 dark:border-pink-500',
      
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      
      success: 'from-green-500 to-emerald-600',
      warning: 'from-yellow-500 to-orange-600',
      error: 'from-red-500 to-pink-600',
      info: 'from-purple-500 to-pink-600',
      
      gradient: 'from-pink-400 to-rose-600',
      gradientHover: 'from-pink-500 to-rose-700',
      accent: 'bg-pink-50 dark:bg-pink-900/20',
      accentLight: 'bg-pink-100 dark:bg-pink-900/30'
    }
  },
  {
    name: 'forest-green',
    displayName: '森林绿',
    icon: 'tree',
    description: '自然森林主题，清新自然',
    colors: {
      primary: 'from-green-500 to-emerald-600',
      primaryHover: 'from-green-600 to-emerald-700',
      primaryLight: 'from-green-100 to-emerald-100',
      primaryDark: 'from-green-900/40 to-emerald-900/40',
      
      background: 'from-green-50/80 via-emerald-50/60 to-teal-50/80',
      backgroundSecondary: 'from-green-950/40 via-emerald-950/30 to-teal-950/40',
      
      cardBackground: 'bg-white/90 dark:bg-slate-800/90',
      cardBorder: 'border-green-200/50 dark:border-green-700/50',
      
      textPrimary: 'text-slate-900 dark:text-slate-100',
      textSecondary: 'text-green-600 dark:text-green-400',
      textAccent: 'text-green-700 dark:text-green-300',
      
      border: 'border-green-200/50 dark:border-green-700/50',
      borderHover: 'border-green-400 dark:border-green-500',
      
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      
      success: 'from-emerald-500 to-teal-600',
      warning: 'from-yellow-500 to-orange-600',
      error: 'from-red-500 to-pink-600',
      info: 'from-blue-500 to-cyan-600',
      
      gradient: 'from-green-400 to-emerald-600',
      gradientHover: 'from-green-500 to-emerald-700',
      accent: 'bg-green-50 dark:bg-green-900/20',
      accentLight: 'bg-green-100 dark:bg-green-900/30'
    }
  },
  {
    name: 'royal-purple',
    displayName: '皇家紫',
    icon: 'crown',
    description: '高贵皇室主题，典雅奢华',
    colors: {
      primary: 'from-purple-600 to-indigo-700',
      primaryHover: 'from-purple-700 to-indigo-800',
      primaryLight: 'from-purple-100 to-indigo-100',
      primaryDark: 'from-purple-900/40 to-indigo-900/40',
      
      background: 'from-purple-50/80 via-indigo-50/60 to-violet-50/80',
      backgroundSecondary: 'from-purple-950/40 via-indigo-950/30 to-violet-950/40',
      
      cardBackground: 'bg-white/90 dark:bg-slate-800/90',
      cardBorder: 'border-purple-200/50 dark:border-purple-700/50',
      
      textPrimary: 'text-slate-900 dark:text-slate-100',
      textSecondary: 'text-purple-600 dark:text-purple-400',
      textAccent: 'text-purple-700 dark:text-purple-300',
      
      border: 'border-purple-200/50 dark:border-purple-700/50',
      borderHover: 'border-purple-400 dark:border-purple-500',
      
      shadow: 'shadow-lg',
      shadowHover: 'shadow-xl',
      
      success: 'from-green-500 to-emerald-600',
      warning: 'from-yellow-500 to-orange-600',
      error: 'from-red-500 to-pink-600',
      info: 'from-blue-500 to-cyan-600',
      
      gradient: 'from-purple-500 to-indigo-700',
      gradientHover: 'from-purple-600 to-indigo-800',
      accent: 'bg-purple-50 dark:bg-purple-900/20',
      accentLight: 'bg-purple-100 dark:bg-purple-900/30'
    }
  }
]

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<string>('research-purple')
  
  // 从localStorage加载主题
  const loadTheme = () => {
    const saved = localStorage.getItem('ai-chat-theme')
    if (saved && themes.find(t => t.name === saved)) {
      currentTheme.value = saved
    }
  }
  
  // 保存主题到localStorage
  const saveTheme = (themeName: string) => {
    localStorage.setItem('ai-chat-theme', themeName)
  }
  
  // 切换主题
  const setTheme = (themeName: string) => {
    if (themes.find(t => t.name === themeName)) {
      currentTheme.value = themeName
      saveTheme(themeName)
      // 应用主题到根元素
      applyThemeToRoot()
    }
  }
  
  // 当前主题配置
  const theme = computed(() => {
    return themes.find(t => t.name === currentTheme.value) || themes[0]
  })
  
  // 主题类名生成器
  const getThemeClass = (type: keyof ThemeColors['colors']) => {
    const colors = theme.value.colors[type]
    if (colors.startsWith('from-')) {
      return `bg-gradient-to-r ${colors}`
    }
    return colors
  }
  
  // 应用主题到根元素
  const applyThemeToRoot = () => {
    const root = document.documentElement
    const currentThemeData = theme.value
    
    // 移除所有主题类
    const allThemeClasses = themes.flatMap(t => 
      Object.values(t.colors).flatMap(color => 
        color.split(' ')
      )
    )
    root.classList.remove(...allThemeClasses.filter(cls => cls && !cls.includes(':')))
    
    // 添加当前主题类
    root.classList.add(`theme-${currentThemeData.name}`)
    
    // 设置CSS变量
    root.style.setProperty('--theme-primary', currentThemeData.colors.primary)
    root.style.setProperty('--theme-background', currentThemeData.colors.background)
    root.style.setProperty('--theme-text-primary', currentThemeData.colors.textPrimary)
    root.style.setProperty('--theme-text-secondary', currentThemeData.colors.textSecondary)
  }
  
  // 初始化
  loadTheme()
  applyThemeToRoot()
  
  return {
    currentTheme,
    theme,
    themes,
    setTheme,
    getThemeClass,
    applyThemeToRoot
  }
}) 