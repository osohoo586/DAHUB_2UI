<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { roleLabel } = useAuth()
const from = computed(() => (typeof route.query.from === 'string' ? route.query.from : ''))
</script>

<template>
  <div class="page container">
    <BaseCard class="fb" v-reveal>
      <EmptyState
        title="Энэ хэсэгт хандах эрхгүй байна"
        :description="`«${roleLabel}» эрхэд ${from ? from + ' хуудсыг' : 'энэ хуудсыг'} харах зөвшөөрөл олгогдоогүй. Шаардлагатай бол DAHUB-ийн админд хандана уу.`"
      >
        <BaseButton to="/" icon="home">Нүүр хуудас</BaseButton>
        <BaseButton variant="secondary" to="/profile" icon="key">Миний эрх</BaseButton>
      </EmptyState>
    </BaseCard>
  </div>
</template>

<style scoped>
.fb { max-width: 720px; margin: var(--space-10) auto 0; }
</style>
