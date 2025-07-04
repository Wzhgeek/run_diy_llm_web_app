<template>
  <div class="knowledge-container">
    <div class="knowledge-header">
      <h2>知识库管理</h2>
      <p>管理和组织您的知识资料库</p>
    </div>
    <div class="knowledge-content">
      <!-- 知识库管理的具体内容将在这里开发 -->
      <div class="placeholder">
        <t-icon name="folder" size="48px" />
        <p>知识库管理功能开发中...</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeBase',
  data() {
    return {
      // 知识库相关数据
    }
  }
}
</script>

<style scoped>
.knowledge-container {
  width: 100%;
  height: 100%;
  padding: 24px;
  background: #fafbfc;
}

.knowledge-header {
  margin-bottom: 24px;
}

.knowledge-header h2 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
}

.knowledge-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.knowledge-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  height: calc(100% - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #94a3b8;
}

.placeholder .t-icon {
  margin-bottom: 16px;
}

.placeholder p {
  margin: 0;
  font-size: 16px;
}
</style>
