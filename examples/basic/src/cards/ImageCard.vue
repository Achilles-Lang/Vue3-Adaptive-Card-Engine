<script setup lang="ts">
defineProps<{ imageUrl: string; caption?: string; title?: string }>();
</script>

<template>
  <div class="ace-card ace-card--image">
    <div class="frame"><img :src="imageUrl" :alt="caption || 'image'" class="img" loading="lazy" /></div>
    <p v-if="caption" class="cap">{{ caption }}</p>
  </div>
</template>

<style scoped>
.ace-card--image { padding: 0; background: var(--bg-card); border-radius: 8px; overflow: hidden; }
.frame { width: 100%; overflow: hidden; }
.img { width: 100%; display: block; object-fit: cover; max-height: 280px; }
.cap { margin: 0; padding: 10px 16px; font-size: 12px; color: var(--text-muted); line-height: 1.5; }
</style>
