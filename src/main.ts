import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/scss/app.scss'
import BootstrapVue from 'bootstrap-vue'
import VeeValidate from 'vee-validate'

Vue.use(VeeValidate)
Vue.use(BootstrapVue)

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
