<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import RouteProgress from '@/components/layout/RouteProgress.vue'
import ToastHost from '@/components/ui/ToastHost.vue'

const route = useRoute()
const blank = computed(() => route.meta.layout === 'blank')
</script>

<template>
  <RouteProgress />
  <RouterView v-if="blank" v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <AppShell v-else>
    <RouterView v-slot="{ Component, route: r }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="r.meta.key ? r.meta.key(r) : r.path" />
      </Transition>
    </RouterView>
  </AppShell>
  <ToastHost />
</template>
