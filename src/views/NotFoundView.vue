<script setup>
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
</script>

<template>
  <div class="page container">
    <BaseCard class="nf" v-reveal>
      <EmptyState variant="search" title="Хуудас олдсонгүй" description="Таны хайсан хаяг өөрчлөгдсөн эсвэл устгагдсан байж магадгүй. Нүүр хуудаснаас эхлэн хайж үзнэ үү.">
        <BaseButton to="/" icon="home">Нүүр хуудас</BaseButton>
        <BaseButton variant="secondary" icon="arrow-left" @click="$router.back()">Буцах</BaseButton>
      </EmptyState>
    </BaseCard>
  </div>
</template>

<style scoped>
.nf { max-width: 720px; margin: var(--space-10) auto 0; }
</style>
