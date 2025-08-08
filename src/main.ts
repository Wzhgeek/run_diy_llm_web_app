import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import TDesign from 'tdesign-vue-next'
import TDesignChat from '@tdesign-vue-next/chat'
import './style.css'
import './styles/theme.css'

// 创建应用实例
const app = createApp(App)

// 注册插件
app.use(pinia)
app.use(router)
app.use(TDesign)
app.use(TDesignChat)

// 挂载应用
app.mount('#app') 