<template>
  <div class="markitdown-renderer">
    <!-- 流式代码显示模式 -->
    <div v-if="isStreamingMode" class="streaming-content">
      <pre class="stream-code"><code class="language-html">{{ streamContent }}</code></pre>
    </div>
    <!-- 预览模式 -->
    <div v-else class="rendered-content">
      <div v-if="isHtmlContent" v-html="sanitizedHtmlContent"></div>
      <div v-else v-html="markdownContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface Props {
  content: string
  isStreaming?: boolean
  streamContent?: string
  isHtml?: boolean  // 新增：标识内容是否为HTML
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
  streamContent: '',
  isHtml: false
})

const isStreamingMode = computed(() => props.isStreaming && props.streamContent)

// 判断是否为HTML内容
const isHtmlContent = computed(() => {
  return props.isHtml || props.content.trim().startsWith('<!DOCTYPE') || props.content.trim().startsWith('<html')
})

// 处理纯HTML内容
const sanitizedHtmlContent = computed(() => {
  if (!props.content) return ''
  
  try {
    // 直接使用DOMPurify清理HTML，不经过marked处理
    return DOMPurify.sanitize(props.content, {
      ADD_TAGS: ['iframe', 'canvas', 'script'],
      ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'scrolling']
    })
  } catch (error) {
    console.error('HTML渲染错误:', error)
    return props.content
  }
})

// 处理Markdown内容
const markdownContent = computed(() => {
  if (!props.content) return ''
  
  try {
    // 使用marked解析Markdown
    const html = marked(props.content)
    
    // 如果marked返回的是Promise，直接返回原内容
    if (html instanceof Promise) {
      return props.content
    }
    
    // 使用DOMPurify清理HTML
    return DOMPurify.sanitize(html)
  } catch (error) {
    console.error('Markdown渲染错误:', error)
    return props.content
  }
})

// 监听流式内容变化
watch(() => props.streamContent, (newContent) => {
  if (newContent && props.isStreaming) {
    // 这里可以添加流式渲染的逻辑
  }
})

onMounted(() => {
  // 初始化高亮代码
  if (typeof window !== 'undefined' && (window as any).hljs) {
    (window as any).hljs.highlightAll()
  }
})
</script>

<style scoped>
.markitdown-renderer {
  @apply text-sm text-slate-900 dark:text-slate-100;
}

.streaming-content {
  @apply bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-auto;
}

.stream-code {
  @apply font-mono text-sm whitespace-pre-wrap;
  color: #d1d5db;
  background-color: #1f2937;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
}

.stream-code code {
  @apply text-xs;
  color: #e5e7eb;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}

.rendered-content {
  @apply prose prose-sm dark:prose-invert max-w-none;
}

/* 代码高亮样式 */
.rendered-content :deep(pre) {
  @apply bg-slate-100 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto;
}

.rendered-content :deep(code) {
  @apply bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono;
}

.rendered-content :deep(pre code) {
  @apply bg-transparent px-0 py-0;
}

/* 表格样式 */
.rendered-content :deep(table) {
  @apply w-full border-collapse border border-slate-300 dark:border-slate-600;
}

.rendered-content :deep(th),
.rendered-content :deep(td) {
  @apply border border-slate-300 dark:border-slate-600 px-3 py-2;
}

.rendered-content :deep(th) {
  @apply bg-slate-100 dark:bg-slate-800 font-semibold;
}

/* 图表样式 */
.rendered-content :deep(.chart-container) {
  @apply w-full h-64 bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm;
}

.rendered-content :deep(.chart-container canvas) {
  @apply w-full h-full;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rendered-content {
    @apply text-sm;
  }
  
  .stream-code {
    @apply text-xs;
  }
}
</style> 