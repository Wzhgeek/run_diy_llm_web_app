import './assets/main.css'
import './styles/index.less'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// TDesign
import TDesign from 'tdesign-vue-next'
import TDesignChat from '@tdesign-vue-next/chat'
import 'tdesign-vue-next/es/style/index.css'
import '@tdesign-vue-next/chat/es/style/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(TDesign)
app.use(TDesignChat)

app.mount('#app')
