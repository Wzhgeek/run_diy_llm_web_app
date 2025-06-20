<template>
  <nav class="app-sidebar" :class="{ active: visible }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="brand-logo">
        <div class="brand-icon">
          <t-icon name="user-avatar" />
        </div>
        <span class="brand-text">AI学术助手</span>
      </div>
    </div>

    <!-- 导航菜单 -->
    <div class="nav-menu">
      <!-- 核心功能 -->
      <div class="nav-section">
        <div class="nav-section-title">核心功能</div>
        <router-link 
          v-for="item in coreFeatures" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <t-icon :name="item.icon" class="nav-icon" />
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </div>

      <!-- 研究工具 -->
      <div class="nav-section">
        <div class="nav-section-title">研究工具</div>
        <router-link 
          v-for="item in researchTools" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <t-icon :name="item.icon" class="nav-icon" />
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </div>

      <!-- 帮助支持 -->
      <div class="nav-section">
        <div class="nav-section-title">帮助支持</div>
        <router-link 
          v-for="item in helpItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
        >
          <t-icon :name="item.icon" class="nav-icon" />
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// Props
defineProps<{
  visible: boolean
}>()

// Emits
defineEmits<{
  close: []
}>()

// 导航菜单数据
const coreFeatures = [
  { name: '工作台', path: '/', icon: 'dashboard' },
  { name: 'AI对话', path: '/chat', icon: 'chat' },
]

const researchTools = [
  { name: '文献处理', path: '/document', icon: 'file-text' },
  { name: '知识库', path: '/knowledge', icon: 'folder' },
]

const helpItems = [
  { name: '用户指南', path: '/guide', icon: 'help-circle' },
  { name: '设置', path: '/settings', icon: 'setting' },
]
</script> 