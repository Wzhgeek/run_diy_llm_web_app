import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import TDesign from 'tdesign-vue-next';
import TDesignChat from '@tdesign-vue-next/chat'; // 引入chat组件

const app = createApp(App);

// 使用TDesign和TDesignChat插件
app.use(TDesign);
app.use(TDesignChat);

app.mount('#app');