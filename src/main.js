import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
import App from './App.vue'
import router from './router'
// Brand fonts, self-hosted via @fontsource (no CDN dependency)
import '@fontsource-variable/fraunces'
import '@fontsource-variable/hanken-grotesk'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'

import './style.css'

import { createI18n } from './i18n'
import { motionDirective } from './directives/motion'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.directive('motion', motionDirective)

const storedLocale = localStorage.getItem('resilia_locale') || 'en'
app.use(createI18n(storedLocale))

app.mount('#app')
