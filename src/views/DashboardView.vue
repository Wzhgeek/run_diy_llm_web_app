<template>
  <div class="dashboard-page">
    <!-- 欢迎卡片 -->
    <div class="welcome-card fade-in">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1>欢迎回来！</h1>
          <p class="subtitle">AI学术研究助手为您提供智能化的研究支持</p>
          <p class="date">{{ currentDate }}</p>
          <div class="welcome-actions">
            <t-button theme="primary" size="large" @click="navigateTo('/chat')">
              开始对话
            </t-button>
            <t-button variant="outline" theme="default" size="large" @click="navigateTo('/document')">
              处理文档
            </t-button>
          </div>
        </div>
        <img 
          src="https://via.placeholder.com/120x120/6366f1/ffffff?text=AI" 
          alt="AI助手"
          class="welcome-avatar"
        />
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions fade-in">
      <div 
        v-for="action in quickActions" 
        :key="action.id"
        class="action-card"
        @click="navigateTo(action.path)"
      >
        <div class="card-icon">
          <t-icon :name="action.icon" />
        </div>
        <h3 class="card-title">{{ action.title }}</h3>
        <p class="card-desc">{{ action.description }}</p>
        <div class="card-features">
          <span 
            v-for="feature in action.features" 
            :key="feature"
            class="feature-tag"
          >
            {{ feature }}
          </span>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-grid fade-in">
      <div 
        v-for="stat in stats" 
        :key="stat.id"
        class="stat-card"
      >
        <div class="stat-icon">
          <t-icon :name="stat.icon" />
        </div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 导航函数
const navigateTo = (path: string) => {
  router.push(path)
}

// 快速操作数据
const quickActions = [
  {
    id: 1,
    title: 'AI智能对话',
    description: '与AI助手进行学术交流，获得研究建议和解答',
    icon: 'chat',
    path: '/chat',
    features: ['多模态输入', '流式输出', '思维链展示']
  },
  {
    id: 2,
    title: '文献处理',
    description: '文档翻译、摘要生成、语法检查等功能',
    icon: 'file-text',
    path: '/document',
    features: ['多语言翻译', '智能摘要', '语法优化']
  },
  {
    id: 3,
    title: '知识库管理',
    description: '构建个人学术知识库，智能检索和组织',
    icon: 'folder',
    path: '/knowledge',
    features: ['智能检索', '知识图谱', '文档管理']
  }
]

// 统计数据
const stats = [
  { id: 1, icon: 'chat', value: '128', label: '对话次数' },
  { id: 2, icon: 'file-text', value: '45', label: '处理文档' },
  { id: 3, icon: 'folder', value: '12', label: '知识库' },
  { id: 4, icon: 'time', value: '在线', label: '系统状态' }
]
</script> 