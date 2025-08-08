import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Dataset, Document, DocumentSegment, IndexingStatus } from '@/types'
import apiService from '@/services/api'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // 状态
  const datasets = ref<Dataset[]>([])
  const currentDataset = ref<Dataset | null>(null)
  const documents = ref<Document[]>([])
  const currentDocument = ref<Document | null>(null)
  const segments = ref<DocumentSegment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const uploading = ref(false)
  const searchResults = ref<any[]>([])
  const indexingStatuses = ref<Map<string, IndexingStatus[]>>(new Map())

  // 计算属性
  const datasetsCount = computed(() => datasets.value.length)
  const documentsCount = computed(() => documents.value.length)
  const totalWordCount = computed(() => 
    datasets.value.reduce((sum, dataset) => sum + dataset.word_count, 0)
  )
  const isIndexing = computed(() => 
    documents.value.some(doc => doc.indexing_status === 'indexing' || doc.indexing_status === 'parsing')
  )

  // Actions
  const setError = (message: string | null) => {
    error.value = message
  }

  const setLoading = (state: boolean) => {
    loading.value = state
  }

  const setUploading = (state: boolean) => {
    uploading.value = state
  }

  // =============================================================================
  // 知识库管理
  // =============================================================================

  const loadDatasets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getDatasets()
      if (response.data) {
        datasets.value = response.data
      }
    } catch (err) {
      console.error('加载知识库失败:', err)
      setError('加载知识库失败')
    } finally {
      setLoading(false)
    }
  }

  const createDataset = async (name: string, description?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const dataset = await apiService.createDataset(name, description)
      datasets.value.unshift(dataset)
      return dataset
    } catch (err) {
      console.error('创建知识库失败:', err)
      setError('创建知识库失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteDataset = async (datasetId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await apiService.deleteDataset(datasetId)
      datasets.value = datasets.value.filter(d => d.id !== datasetId)
      
      // 如果删除的是当前选中的知识库，清空相关状态
      if (currentDataset.value?.id === datasetId) {
        currentDataset.value = null
        documents.value = []
        currentDocument.value = null
        segments.value = []
      }
    } catch (err) {
      console.error('删除知识库失败:', err)
      setError('删除知识库失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const selectDataset = (dataset: Dataset) => {
    currentDataset.value = dataset
    documents.value = []
    currentDocument.value = null
    segments.value = []
  }

  // =============================================================================
  // 文档管理
  // =============================================================================

  const loadDocuments = async (datasetId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getDocuments(datasetId)
      if (response.data) {
        documents.value = response.data
      }
    } catch (err) {
      console.error('加载文档失败:', err)
      setError('加载文档失败')
    } finally {
      setLoading(false)
    }
  }

  const createDocumentByText = async (datasetId: string, name: string, text: string) => {
    try {
      setUploading(true)
      setError(null)
      
      const result = await apiService.createDocumentByText(datasetId, {
        name,
        text,
        indexing_technique: 'high_quality'
      })
      
      documents.value.unshift(result.document)
      
      // 监控索引状态
      if (result.batch) {
        monitorIndexingStatus(datasetId, result.batch)
      }
      
      return result.document
    } catch (err) {
      console.error('创建文档失败:', err)
      setError('创建文档失败')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const createDocumentByFile = async (datasetId: string, file: File) => {
    try {
      setUploading(true)
      setError(null)
      
      const result = await apiService.createDocumentByFile(datasetId, file, {
        indexing_technique: 'high_quality'
      })
      
      documents.value.unshift(result.document)
      
      // 监控索引状态
      if (result.batch) {
        monitorIndexingStatus(datasetId, result.batch)
      }
      
      return result.document
    } catch (err) {
      console.error('上传文档失败:', err)
      setError('上传文档失败')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const updateDocumentByText = async (datasetId: string, documentId: string, name: string, text: string) => {
    try {
      setUploading(true)
      setError(null)
      
      const result = await apiService.updateDocumentByText(datasetId, documentId, {
        name,
        text
      })
      
      // 更新文档列表中的对应项
      const index = documents.value.findIndex(doc => doc.id === documentId)
      if (index !== -1) {
        documents.value[index] = result.document
      }
      
      // 监控索引状态
      if (result.batch) {
        monitorIndexingStatus(datasetId, result.batch)
      }
      
      return result.document
    } catch (err) {
      console.error('更新文档失败:', err)
      setError('更新文档失败')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const updateDocumentByFile = async (datasetId: string, documentId: string, file: File, name?: string) => {
    try {
      setUploading(true)
      setError(null)
      
      const result = await apiService.updateDocumentByFile(datasetId, documentId, file, {
        name,
        indexing_technique: 'high_quality'
      })
      
      // 更新文档列表中的对应项
      const index = documents.value.findIndex(doc => doc.id === documentId)
      if (index !== -1) {
        documents.value[index] = result.document
      }
      
      // 监控索引状态
      if (result.batch) {
        monitorIndexingStatus(datasetId, result.batch)
      }
      
      return result.document
    } catch (err) {
      console.error('更新文档失败:', err)
      setError('更新文档失败')
      throw err
    } finally {
      setUploading(false)
    }
  }

  const deleteDocument = async (datasetId: string, documentId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await apiService.deleteDocument(datasetId, documentId)
      documents.value = documents.value.filter(d => d.id !== documentId)
      
      // 如果删除的是当前选中的文档，清空相关状态
      if (currentDocument.value?.id === documentId) {
        currentDocument.value = null
        segments.value = []
      }
    } catch (err) {
      console.error('删除文档失败:', err)
      setError('删除文档失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const selectDocument = (document: Document) => {
    currentDocument.value = document
    segments.value = []
  }

  // =============================================================================
  // 索引状态监控
  // =============================================================================

  const monitorIndexingStatus = async (datasetId: string, batch: string) => {
    try {
      const statusData = await apiService.getIndexingStatus(datasetId, batch)
      if (statusData.data) {
        indexingStatuses.value.set(batch, statusData.data)
        
        // 如果还在处理中，继续监控
        const stillProcessing = statusData.data.some(
          status => status.indexing_status === 'indexing' || 
                   status.indexing_status === 'parsing' ||
                   status.indexing_status === 'waiting'
        )
        
        if (stillProcessing) {
          setTimeout(() => monitorIndexingStatus(datasetId, batch), 2000)
        } else {
          // 索引完成，重新加载文档列表
          loadDocuments(datasetId)
        }
      }
    } catch (err) {
      console.error('获取索引状态失败:', err)
    }
  }

  const getIndexingStatus = (batch: string) => {
    return indexingStatuses.value.get(batch) || []
  }

  // =============================================================================
  // 知识库检索
  // =============================================================================

  const retrieveKnowledge = async (datasetId: string, query: string, options?: {
    search_method?: 'keyword_search' | 'semantic_search' | 'hybrid_search'
    top_k?: number
    score_threshold?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await apiService.retrieveDataset(datasetId, query, {
        retrieval_model: {
          search_method: options?.search_method || 'semantic_search',
          reranking_enable: false,
          top_k: options?.top_k || 3,
          score_threshold_enabled: !!options?.score_threshold,
          score_threshold: options?.score_threshold
        }
      })
      
      searchResults.value = result.records
      return result
    } catch (err) {
      console.error('检索知识库失败:', err)
      setError('检索知识库失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearSearchResults = () => {
    searchResults.value = []
  }

  // =============================================================================
  // 工具方法
  // =============================================================================

  const getDatasetById = (id: string) => {
    return datasets.value.find(dataset => dataset.id === id)
  }

  const getDocumentById = (id: string) => {
    return documents.value.find(document => document.id === id)
  }

  const updateDocumentStatus = (documentId: string, updates: Partial<Document>) => {
    const index = documents.value.findIndex(doc => doc.id === documentId)
    if (index !== -1) {
      documents.value[index] = { ...documents.value[index], ...updates }
    }
  }

  const getDocumentsByStatus = (status: Document['indexing_status']) => {
    return documents.value.filter(doc => doc.indexing_status === status)
  }

  const getRecentDocuments = (limit = 10) => {
    return documents.value
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit)
  }

  // =============================================================================
  // 批量操作
  // =============================================================================

  const batchDeleteDocuments = async (datasetId: string, documentIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      
      await Promise.all(
        documentIds.map(id => apiService.deleteDocument(datasetId, id))
      )
      
      documents.value = documents.value.filter(d => !documentIds.includes(d.id))
      
      // 如果删除的包含当前选中的文档，清空相关状态
      if (currentDocument.value && documentIds.includes(currentDocument.value.id)) {
        currentDocument.value = null
        segments.value = []
      }
    } catch (err) {
      console.error('批量删除文档失败:', err)
      setError('批量删除文档失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // 文档分段管理
  // =============================================================================

  const loadDocumentSegments = async (datasetId: string, documentId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getDocumentSegments(datasetId, documentId)
      if (response.data) {
        segments.value = response.data
      }
    } catch (err) {
      console.error('加载文档分段失败:', err)
      setError('加载文档分段失败')
    } finally {
      setLoading(false)
    }
  }

  const createDocumentSegments = async (datasetId: string, documentId: string, segmentData: Array<{
    content: string
    answer?: string
    keywords?: string[]
  }>) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await apiService.createDocumentSegments(datasetId, documentId, segmentData)
      
      // 重新加载分段列表
      if (result.data) {
        segments.value = [...result.data, ...segments.value]
      }
      
      return result.data
    } catch (err) {
      console.error('创建文档分段失败:', err)
      setError('创建文档分段失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateDocumentSegment = async (datasetId: string, documentId: string, segmentId: string, segmentData: {
    content: string
    answer?: string
    keywords?: string[]
    enabled?: boolean
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await apiService.updateDocumentSegment(datasetId, documentId, segmentId, segmentData)
      
      // 更新本地分段数据
      const index = segments.value.findIndex(seg => seg.id === segmentId)
      if (index !== -1 && result.data.length > 0) {
        segments.value[index] = { ...segments.value[index], ...segmentData }
      }
      
      return result.data
    } catch (err) {
      console.error('更新文档分段失败:', err)
      setError('更新文档分段失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteDocumentSegment = async (datasetId: string, documentId: string, segmentId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await apiService.deleteDocumentSegment(datasetId, documentId, segmentId)
      
      // 从本地列表中移除
      segments.value = segments.value.filter(seg => seg.id !== segmentId)
    } catch (err) {
      console.error('删除文档分段失败:', err)
      setError('删除文档分段失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // 初始化和清理
  // =============================================================================

  const initialize = async () => {
    await loadDatasets()
  }

  const reset = () => {
    datasets.value = []
    currentDataset.value = null
    documents.value = []
    currentDocument.value = null
    segments.value = []
    searchResults.value = []
    indexingStatuses.value.clear()
    loading.value = false
    error.value = null
    uploading.value = false
  }

  return {
    // 状态
    datasets,
    currentDataset,
    documents,
    currentDocument,
    segments,
    loading,
    error,
    uploading,
    searchResults,
    indexingStatuses,
    
    // 计算属性
    datasetsCount,
    documentsCount,
    totalWordCount,
    isIndexing,
    
    // Actions
    setError,
    setLoading,
    setUploading,
    
    // 知识库管理
    loadDatasets,
    createDataset,
    deleteDataset,
    selectDataset,
    
    // 文档管理
    loadDocuments,
    createDocumentByText,
    createDocumentByFile,
    updateDocumentByText,
    updateDocumentByFile,
    deleteDocument,
    selectDocument,
    
    // 索引状态监控
    monitorIndexingStatus,
    getIndexingStatus,
    
    // 知识库检索
    retrieveKnowledge,
    clearSearchResults,
    
    // 工具方法
    getDatasetById,
    getDocumentById,
    updateDocumentStatus,
    getDocumentsByStatus,
    getRecentDocuments,
    
    // 批量操作
    batchDeleteDocuments,
    
    // 文档分段管理
    loadDocumentSegments,
    createDocumentSegments,
    updateDocumentSegment,
    deleteDocumentSegment,
    
    // 初始化和清理
    initialize,
    reset
  }
}) 