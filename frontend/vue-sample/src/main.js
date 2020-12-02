import { createApp } from 'vue'
import App from './App.vue'

window.addEventListener('error', args => {
  console.log('error', args)
})

createApp(App).mount('#app')
