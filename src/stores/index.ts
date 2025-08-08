import { createPinia } from 'pinia'

export const pinia = createPinia()

export * from './chat'
export * from './app'
export { useAppStore } from './app'
export { useChatStore } from './chat'
export { useKnowledgeStore } from './knowledge'
export { useWorkflowStore } from './workflow' 