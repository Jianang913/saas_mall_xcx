import Vue from 'vue'
import App from './App'
import store from './store'
import plugins from './plugins'
import './permission'
import { getDicts } from "@/api/system/dict/data"

Vue.use(plugins)

Vue.config.productionTip = false
Vue.prototype.$store = store
Vue.prototype.getDicts = getDicts

// 全局注册 tab-bar 组件
import tabBar from '@/components/tab-bar/tab-bar.vue'
Vue.component('tab-bar', tabBar)

App.mpType = 'app'

const app = new Vue({
  ...App
})

app.$mount()

// 隐藏原生 Tab 栏（使用自定义 Tab 栏）
// #ifdef MP-WEIXIN
uni.hideTabBar({ animation: false })
// #endif
