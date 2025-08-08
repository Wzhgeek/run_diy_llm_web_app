import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由组件懒加载
const WorkPlace = () => import('@/views/WorkPlace.vue')
const AIChat = () => import('@/views/AIChat.vue')
const Translation = () => import('@/views/Translation.vue')
const KnowledgeBase = () => import('@/views/KnowledgeBase.vue')
const DataAnalysis = () => import('@/views/DataAnalysis.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/workplace'
  },
  {
    path: '/workplace',
    name: 'WorkPlace',
    component: WorkPlace,
    meta: {
      title: '工作台',
      icon: 'dashboard'
    }
  },
  {
    path: '/ai-chat',
    name: 'AIChat',
    component: AIChat,
    meta: {
      title: 'AI对话',
      icon: 'chat'
    }
  },
  {
    path: '/translation',
    name: 'Translation',
    component: Translation,
    meta: {
      title: '文献翻译',
      icon: 'translate'
    }
  },
  {
    path: '/knowledge',
    name: 'KnowledgeBase',
    component: KnowledgeBase,
    meta: {
      title: '知识库管理',
      icon: 'folder'
    }
  },
  {
    path: '/data-analysis',
    name: 'DataAnalysis',
    component: DataAnalysis,
    meta: {
      title: '数据分析',
      icon: 'chart-bar'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - AI学术研究助手`
  }
  next()
})

export default router 