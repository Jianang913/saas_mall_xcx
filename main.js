import { createSSRApp } from 'vue'
import App from './App'
import { pinia } from './store'
import plugins from './plugins'
import './permission'
import { getDicts } from '@/api/system/dict/data'

// 全局注册组件
import tabBar from '@/components/tab-bar/tab-bar.vue'
import loginModal from '@/components/login-modal/login-modal.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 安装插件（$tab/$auth/$modal）
  app.use(plugins)

  // 安装 Pinia
  app.use(pinia)

  // 全局属性
  app.config.globalProperties.getDicts = getDicts

  // 全局组件
  app.component('tab-bar', tabBar)
  app.component('login-modal', loginModal)

  return { app }
}
