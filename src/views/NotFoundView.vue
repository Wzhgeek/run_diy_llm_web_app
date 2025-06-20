<template>
  <div class="not-found-page">
    <div class="error-content">
      <div class="error-icon">
        <t-icon name="error-circle" size="80px" />
      </div>
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
      <div class="error-actions">
        <t-button theme="primary" @click="goHome">
          返回首页
        </t-button>
        <t-button variant="outline" @click="goChat">
          智能对话
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goChat = () => {
  router.push('/chat')
}
</script>

<style scoped lang="less">
.not-found-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
}

.error-content {
  text-align: center;
  max-width: 400px;
  padding: var(--spacing-xxl);

  .error-icon {
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-lg);
  }

  h1 {
    font-size: 72px;
    font-weight: 700;
    color: var(--td-brand-color);
    margin: 0;
    line-height: 1;
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: var(--spacing-md) 0;
  }

  p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
    line-height: 1.6;
  }

  .error-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style> 