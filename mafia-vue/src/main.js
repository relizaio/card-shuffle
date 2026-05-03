import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createBootstrap } from 'bootstrap-vue-next'
import { BootstrapIconsPlugin } from 'bootstrap-icons-vue'
import SocketPlugin from './plugins/socket.js'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

const app = createApp(App)

app.use(router)
app.use(createBootstrap())
app.use(BootstrapIconsPlugin)

app.use(SocketPlugin, {
    debug: true,
    connection: window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
    options: { path: '/api' }
})

app.mount('#app')
