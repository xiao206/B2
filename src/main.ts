import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { permissionDirective } from '@/directives/permission'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.directive('permission', permissionDirective)

app.mount('#app')
