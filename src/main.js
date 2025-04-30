import Vue from 'vue'
import ElementUI from 'element-ui'

import App from './App.vue'

import './style.css'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

new Vue({
  render: (h) => h(App)
}).$mount('#app')
