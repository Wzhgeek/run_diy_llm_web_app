import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorkflowRun, WorkflowNode, StreamEvent } from '@/types'
import apiService from '@/services/api'

export const useWorkflowStore = defineStore('workflow', () => {
  // 状态
  const workflowRuns = ref<WorkflowRun[]>([])
  const currentWorkflowRun = ref<WorkflowRun | null>(null)
  const workflowNodes = ref<WorkflowNode[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const executing = ref(false)
  const streamEvents = ref<StreamEvent[]>([])
  const workflowLogs = ref<WorkflowRun[]>([])

  // 计算属性
  const totalRuns = computed(() => workflowRuns.value.length)
  const successfulRuns = computed(() => 
    workflowRuns.value.filter(run => run.status === 'succeeded').length
  )
  const failedRuns = computed(() => 
    workflowRuns.value.filter(run => run.status === 'failed').length
  )
  const isRunning = computed(() => 
    currentWorkflowRun.value?.status === 'running' || executing.value
  )
  const averageExecutionTime = computed(() => {
    const completedRuns = workflowRuns.value.filter(run => 
      run.status === 'succeeded' || run.status === 'failed'
    )
    if (completedRuns.length === 0) return 0
    
    const totalTime = completedRuns.reduce((sum, run) => sum + run.elapsed_time, 0)
    return totalTime / completedRuns.length
  })

  // Actions
  const setError = (message: string | null) => {
    error.value = message
  }

  const setLoading = (state: boolean) => {
    loading.value = state
  }

  const setExecuting = (state: boolean) => {
    executing.value = state
  }

  // =============================================================================
  // 工作流执行
  // =============================================================================

  const runWorkflow = async (
    inputs: Record<string, any>,
    options?: {
      response_mode?: 'streaming' | 'blocking'
      files?: Array<{
        type: string
        transfer_method: string
        url?: string
        upload_file_id?: string
      }>
    }
  ) => {
    try {
      setExecuting(true)
      setError(null)
      
      const response = await apiService.runWorkflow({
        inputs,
        response_mode: options?.response_mode || 'streaming',
        files: options?.files
      })

      if (options?.response_mode === 'streaming') {
        return handleStreamingResponse(response)
      } else {
        const result = await response.json()
        if (result.data) {
          currentWorkflowRun.value = result.data
          workflowRuns.value.unshift(result.data)
        }
        return result
      }
    } catch (err) {
      console.error('执行工作流失败:', err)
      setError('执行工作流失败')
      throw err
    } finally {
      setExecuting(false)
    }
  }

  const handleStreamingResponse = async (response: Response) => {
    if (!response.body) {
      throw new Error('流式响应无效')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // 保留最后一行可能不完整的数据
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data.trim() === '') continue
            
            try {
              const event = JSON.parse(data) as StreamEvent
              handleStreamEvent(event)
            } catch (parseError) {
              console.warn('解析流式数据失败:', parseError, data)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  const handleStreamEvent = (event: StreamEvent) => {
    streamEvents.value.push(event)
    
    switch (event.event) {
      case 'workflow_started':
        if (event.data) {
          currentWorkflowRun.value = event.data
          workflowRuns.value.unshift(event.data)
        }
        break
        
      case 'workflow_finished':
        if (event.data && currentWorkflowRun.value) {
          const updatedRun = { ...currentWorkflowRun.value, ...event.data }
          currentWorkflowRun.value = updatedRun
          // 更新工作流列表中的记录
          const index = workflowRuns.value.findIndex(run => run.id === event.data.id)
          if (index !== -1) {
            workflowRuns.value[index] = updatedRun
          }
        }
        setExecuting(false)
        break
        
      case 'node_started':
        if (event.data) {
          workflowNodes.value.push(event.data)
        }
        break
        
      case 'node_finished':
        if (event.data) {
          const index = workflowNodes.value.findIndex(node => node.id === event.data.id)
          if (index !== -1) {
            workflowNodes.value[index] = { ...workflowNodes.value[index], ...event.data }
          }
        }
        break
        
      case 'error':
        setError(event.data?.message || '工作流执行出错')
        setExecuting(false)
        break
    }
  }

  // =============================================================================
  // 工作流状态查询
  // =============================================================================

  const getWorkflowStatus = async (workflowId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const workflowRun = await apiService.getWorkflowStatus(workflowId)
      
      // 更新当前工作流状态
      if (currentWorkflowRun.value?.id === workflowId) {
        currentWorkflowRun.value = workflowRun
      }
      
      // 更新工作流列表中的记录
      const index = workflowRuns.value.findIndex(run => run.id === workflowId)
      if (index !== -1) {
        workflowRuns.value[index] = workflowRun
      }
      
      return workflowRun
    } catch (err) {
      console.error('获取工作流状态失败:', err)
      setError('获取工作流状态失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // 工作流控制
  // =============================================================================

  const stopWorkflow = async (taskId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await apiService.stopWorkflow(taskId)
      
      // 更新状态
      if (currentWorkflowRun.value?.id === taskId) {
        currentWorkflowRun.value = {
          ...currentWorkflowRun.value,
          status: 'stopped'
        }
      }
      
      setExecuting(false)
    } catch (err) {
      console.error('停止工作流失败:', err)
      setError('停止工作流失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // 工作流日志
  // =============================================================================

  const loadWorkflowLogs = async (limit = 20) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getWorkflowLogs(limit)
      if (response.data) {
        workflowLogs.value = response.data
      }
      
      return response
    } catch (err) {
      console.error('加载工作流日志失败:', err)
      setError('加载工作流日志失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // =============================================================================
  // 工作流管理
  // =============================================================================

  const selectWorkflowRun = (workflowRun: WorkflowRun) => {
    currentWorkflowRun.value = workflowRun
    // 清空节点信息，如果需要可以重新加载
    workflowNodes.value = []
  }

  const clearCurrentWorkflow = () => {
    currentWorkflowRun.value = null
    workflowNodes.value = []
    streamEvents.value = []
  }

  // =============================================================================
  // 工具方法
  // =============================================================================

  const getWorkflowRunById = (id: string) => {
    return workflowRuns.value.find(run => run.id === id)
  }

  const getWorkflowRunsByStatus = (status: WorkflowRun['status']) => {
    return workflowRuns.value.filter(run => run.status === status)
  }

  const getRecentWorkflowRuns = (limit = 10) => {
    return workflowRuns.value
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  const getWorkflowNodesByStatus = (status: WorkflowNode['status']) => {
    return workflowNodes.value.filter(node => node.status === status)
  }

  const getStreamEventsByType = (eventType: StreamEvent['event']) => {
    return streamEvents.value.filter(event => event.event === eventType)
  }

  // =============================================================================
  // 统计信息
  // =============================================================================

  const getWorkflowStats = () => {
    return {
      totalRuns: totalRuns.value,
      successfulRuns: successfulRuns.value,
      failedRuns: failedRuns.value,
      successRate: totalRuns.value > 0 ? (successfulRuns.value / totalRuns.value) * 100 : 0,
      averageExecutionTime: averageExecutionTime.value,
      runningRuns: workflowRuns.value.filter(run => run.status === 'running').length
    }
  }

  const getWorkflowExecutionHistory = () => {
    return workflowRuns.value.map(run => ({
      id: run.id,
      status: run.status,
      elapsed_time: run.elapsed_time,
      created_at: run.created_at,
      total_tokens: run.total_tokens,
      total_steps: run.total_steps,
      error: run.error
    }))
  }

  // =============================================================================
  // 初始化和清理
  // =============================================================================

  const initialize = async () => {
    await loadWorkflowLogs()
  }

  const reset = () => {
    workflowRuns.value = []
    currentWorkflowRun.value = null
    workflowNodes.value = []
    streamEvents.value = []
    workflowLogs.value = []
    loading.value = false
    error.value = null
    executing.value = false
  }

  return {
    // 状态
    workflowRuns,
    currentWorkflowRun,
    workflowNodes,
    loading,
    error,
    executing,
    streamEvents,
    workflowLogs,
    
    // 计算属性
    totalRuns,
    successfulRuns,
    failedRuns,
    isRunning,
    averageExecutionTime,
    
    // Actions
    setError,
    setLoading,
    setExecuting,
    
    // 工作流执行
    runWorkflow,
    handleStreamingResponse,
    handleStreamEvent,
    
    // 工作流状态查询
    getWorkflowStatus,
    
    // 工作流控制
    stopWorkflow,
    
    // 工作流日志
    loadWorkflowLogs,
    
    // 工作流管理
    selectWorkflowRun,
    clearCurrentWorkflow,
    
    // 工具方法
    getWorkflowRunById,
    getWorkflowRunsByStatus,
    getRecentWorkflowRuns,
    getWorkflowNodesByStatus,
    getStreamEventsByType,
    
    // 统计信息
    getWorkflowStats,
    getWorkflowExecutionHistory,
    
    // 初始化和清理
    initialize,
    reset
  }
}) 