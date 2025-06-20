<template>
  <div class="app-container">
    <!-- 移动端遮罩层 -->
    <div 
      class="sidebar-overlay" 
      :class="{ active: sidebarVisible }"
      @click="toggleSidebar"
    ></div>

    <!-- 侧边栏 -->
    <Sidebar 
      :visible="sidebarVisible"
      @close="toggleSidebar"
    />

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 移动端头部 -->
      <div class="mobile-header">
        <button class="menu-toggle" @click="toggleSidebar">
          <t-icon name="menu" />
        </button>
        <div class="logo">AI学术助手</div>
        <div></div>
      </div>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'

// 侧边栏可见性
const sidebarVisible = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

// 监听窗口大小变化
const handleResize = () => {
  if (window.innerWidth >= 768) {
    sidebarVisible.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script> 