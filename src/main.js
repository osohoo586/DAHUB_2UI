import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@fontsource-variable/source-serif-4/opsz.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/400-italic.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'

import './assets/styles/tokens.css'
import './assets/styles/base.css'
import './assets/styles/layout.css'
import './assets/styles/animations.css'

import App from './App.vue'
import router from './router'
import { vReveal } from './composables/useReveal'
import { useThemeStore } from './stores/theme'
import { useLayoutStore } from './stores/layout'
import { useAuthStore } from './stores/auth'
import { usePermissionsStore } from './stores/permissions'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Theme, navigation layout and session are restored before the first route resolves.
useThemeStore().init()
useLayoutStore().init()
useAuthStore().init()
usePermissionsStore().load()

app.directive('reveal', vReveal)
app.use(router)
app.mount('#app')
