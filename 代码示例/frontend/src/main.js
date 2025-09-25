import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

// 引入 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入全局样式
import '@/assets/styles/global.scss'

// 中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 开发环境启用Mock
if (import.meta.env.VITE_MOCK_ENABLED === 'true') {
  import('./mock').then(() => {
    console.log('🎭 Mock服务已启动 - 当前为演示模式')
  })
}

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app
  .use(store)
  .use(router)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .mount('#app')