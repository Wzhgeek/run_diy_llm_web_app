export interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: number
  streaming?: boolean
  feedback?: 'like' | 'dislike' | null
  file?: {
    name: string
    type: string
    url: string
  }
  retrieverResources?: Array<{
    segment_id: string
    document_name: string
    score: number
    content: string
  }>
}

export interface Conversation {
  id: string
  name: string
  summary?: string
  created_at: number
  updated_at: number
  messages: Message[]
  inputs?: Record<string, any>
  status?: 'normal' | 'archived'
}

export interface User {
  id: string
  name: string
  avatar?: string
  email?: string
}

export interface UploadResponse {
  id: string
  name: string
  size: number
  url?: string
  type?: string
  extension: string
  mime_type: string
  created_by: number
  created_at: number
}

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  error?: string
  limit?: number
  has_more?: boolean
  total?: number
  page?: number
}

export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant'
}

export enum ChatStatus {
  IDLE = 'idle',
  TYPING = 'typing',
  LOADING = 'loading',
  ERROR = 'error'
}

export interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  messages: Message[]
  status: ChatStatus
  sidebarCollapsed: boolean
}

export interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  currentPage: string
}

// =============================================================================
// 知识库相关类型
// =============================================================================

export interface Dataset {
  id: string
  name: string
  description: string | null
  provider: string
  permission: 'only_me' | 'all_team_members'
  data_source_type: string | null
  indexing_technique: string | null
  app_count: number
  document_count: number
  word_count: number
  created_by: string
  created_at: number
  updated_by: string
  updated_at: number
  embedding_model: string | null
  embedding_model_provider: string | null
  embedding_available: boolean | null
}

export interface Document {
  id: string
  position: number
  data_source_type: 'upload_file' | 'file_upload' | 'notion_import'
  data_source_info: {
    upload_file_id?: string
  } | null
  dataset_process_rule_id: string | null
  name: string
  created_from: string
  created_by: string
  created_at: number
  tokens: number
  indexing_status: 'waiting' | 'parsing' | 'cleaning' | 'splitting' | 'indexing' | 'completed' | 'error' | 'paused'
  error: string | null
  enabled: boolean
  disabled_at: number | null
  disabled_by: string | null
  archived: boolean
  display_status: string
  word_count: number
  hit_count: number
  doc_form: string
}

export interface DocumentSegment {
  id: string
  position: number
  document_id: string
  content: string
  answer: string | null
  word_count: number
  tokens: number
  keywords: string[]
  index_node_id: string
  index_node_hash: string
  hit_count: number
  enabled: boolean
  disabled_at: number | null
  disabled_by: string | null
  status: 'waiting' | 'completed' | 'error'
  created_by: string
  created_at: number
  indexing_at: number
  completed_at: number
  error: string | null
  stopped_at: number | null
  document?: {
    id: string
    data_source_type: string
    name: string
    doc_type: string | null
  }
}

export interface IndexingStatus {
  id: string
  indexing_status: 'waiting' | 'parsing' | 'cleaning' | 'splitting' | 'indexing' | 'completed' | 'error' | 'paused'
  processing_started_at: number | null
  parsing_completed_at: number | null
  cleaning_completed_at: number | null
  splitting_completed_at: number | null
  completed_at: number | null
  paused_at: number | null
  error: string | null
  stopped_at: number | null
  completed_segments: number
  total_segments: number
}

// =============================================================================
// 工作流相关类型
// =============================================================================

export interface WorkflowRun {
  id: string
  workflow_id: string
  sequence_number?: number
  status: 'running' | 'succeeded' | 'failed' | 'stopped'
  inputs: string | Record<string, any>
  outputs: Record<string, any> | null
  error: string | null
  elapsed_time: number
  total_tokens: number
  total_steps: number
  created_at: number | string
  finished_at: number | string | null
  created_by_role?: string
  created_by_account?: any
  created_by_end_user?: {
    id: string
    type: string
    is_anonymous: boolean
    session_id: string
  }
  created_from?: string
  workflow_run?: WorkflowRun
}

export interface WorkflowNode {
  id: string
  node_id: string
  node_type: string
  title: string
  index: number
  predecessor_node_id: string | null
  inputs: Record<string, any>
  outputs?: Record<string, any>
  status?: 'running' | 'succeeded' | 'failed'
  elapsed_time?: number
  execution_metadata?: {
    total_tokens: number
    total_price: number
    currency: string
  }
  created_at: number
}

// =============================================================================
// 音频相关类型
// =============================================================================

export interface AudioResponse {
  text?: string
  audio?: string
  'Content-Type'?: string
}

// =============================================================================
// 应用参数配置类型
// =============================================================================

export interface Parameters {
  introduction: string
  user_input_form: Array<{
    'text-input'?: {
      label: string
      variable: string
      required: boolean
      max_length: number
      default: string
    }
    'paragraph'?: {
      label: string
      variable: string
      required: boolean
      default: string
    }
    'select'?: {
      label: string
      variable: string
      required: boolean
      default: string
      options: string[]
    }
    'number'?: {
      label: string
      variable: string
      required: boolean
      default: number
      min?: number
      max?: number
    }
  }>
  file_upload: {
    image: {
      enabled: boolean
      number_limits: number
      detail?: string
      transfer_methods: Array<'remote_url' | 'local_file'>
    }
    audio?: {
      enabled: boolean
      number_limits: number
      transfer_methods: Array<'remote_url' | 'local_file'>
    }
    video?: {
      enabled: boolean
      number_limits: number
      transfer_methods: Array<'remote_url' | 'local_file'>
    }
  }
  system_parameters: {
    file_size_limit: number
    image_file_size_limit: number
    audio_file_size_limit: number
    video_file_size_limit: number
  }
}

// =============================================================================
// 工具元信息类型
// =============================================================================

export interface MetaInfo {
  tool_icons: Record<string, string | {
    background: string
    content: string
  }>
}

// =============================================================================
// 建议问题类型
// =============================================================================

export interface SuggestedQuestion {
  result: string
  data: string[]
}

// =============================================================================
// 文本生成响应类型
// =============================================================================

export interface CompletionResponse {
  id: string
  answer: string
  created_at: number
  metadata?: {
    usage: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
      total_price: string
      currency: string
      latency: number
    }
  }
}

// =============================================================================
// 流式响应事件类型
// =============================================================================

export interface StreamEvent {
  event: 'message' | 'message_end' | 'message_replace' | 'agent_thought' | 'agent_message' | 'workflow_started' | 'workflow_finished' | 'node_started' | 'node_finished' | 'tts_message' | 'tts_message_end' | 'message_file' | 'error'
  id?: string
  task_id?: string
  message_id?: string
  conversation_id?: string
  answer?: string
  created_at?: number
  data?: any
  metadata?: any
  [key: string]: any
}

// =============================================================================
// 文件上传相关类型
// =============================================================================

export interface FileUpload {
  id: string
  name: string
  type: string
  size: number
  url?: string
  upload_file_id?: string
  created_at: number
}

export interface FileTransferMethod {
  type: 'image' | 'audio' | 'video' | 'document'
  transfer_method: 'remote_url' | 'local_file'
  url?: string
  upload_file_id?: string
}

// =============================================================================
// 错误处理类型
// =============================================================================

export interface ApiError {
  code: string
  message: string
  status: number
  details?: any
}

// =============================================================================
// 知识库检索相关类型
// =============================================================================

export interface RetrievalModel {
  search_method: 'keyword_search' | 'semantic_search' | 'hybrid_search'
  reranking_enable: boolean
  reranking_mode?: string
  reranking_model?: {
    reranking_provider_name: string
    reranking_model_name: string
  }
  weights?: Record<string, number>
  top_k: number
  score_threshold_enabled: boolean
  score_threshold?: number
} 