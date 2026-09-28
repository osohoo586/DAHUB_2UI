<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const progress = ref(0)
const visible = ref(false)
let timer = null
let hideTimer = null

function start() {
  clearInterval(timer)
  clearTimeout(hideTimer)
  visible.value = true
  progress.value = 8
  timer = setInterval(() => {
    progress.value = Math.min(86, progress.value + (90 - progress.value) * 0.12)
  }, 90)
}
function done() {
  clearInterval(timer)
  progress.value = 100
  hideTimer = setTimeout(() => {
    visible.value = false
    progress.value = 0
  }, 260)
}

const offBefore = router.beforeEach((to, from) => {
  if (to.path !== from.path) start()
})
const offAfter = router.afterEach(done)
const offError = router.onError(done)
onBeforeUnmount(() => {
  offBefore()
  offAfter()
  offError()
})
</script>

<template>
  <div class="rp" :class="{ 'is-visible': visible }" aria-hidden="true">
    <span class="rp__bar" :style="{ transform: `scaleX(${progress / 100})` }" />
  </div>
</template>

<style scoped>
.rp { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: calc(var(--z-nav) + 1); opacity: 0; transition: opacity 200ms; pointer-events: none; }
.rp.is-visible { opacity: 1; }
.rp__bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0 calc(100% - 28px), var(--accent) calc(100% - 28px));
  transform-origin: left;
  transition: transform 180ms var(--ease-out);
}
</style>
