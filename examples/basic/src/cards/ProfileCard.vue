<script setup lang="ts">
defineProps<{ name: string; role?: string; bio?: string; avatarUrl?: string; contact?: { email?: string; github?: string } }>();
</script>

<template>
  <div class="ace-card ace-card--profile">
    <div class="avatar">
      <img v-if="avatarUrl" :src="avatarUrl" :alt="name" class="avatar__img" />
      <span v-else class="avatar__fallback">{{ name.charAt(0) }}</span>
    </div>
    <h3 class="name">{{ name }}</h3>
    <p v-if="role" class="role">{{ role }}</p>
    <p v-if="bio" class="bio">{{ bio }}</p>
    <div v-if="contact" class="links">
      <a v-if="contact.github" :href="contact.github" class="links__a" target="_blank" rel="noopener">GitHub</a>
      <a v-if="contact.email" :href="`mailto:${contact.email}`" class="links__a">Email</a>
    </div>
  </div>
</template>

<style scoped>
.ace-card--profile { padding: 22px; background: var(--bg-card); border-radius: 8px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.avatar { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; margin-bottom: 12px; border: 2px solid var(--border-light); background: var(--bg-page); }
.avatar__img { width: 100%; height: 100%; object-fit: cover; }
.avatar__fallback { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 24px; font-weight: 700; color: var(--accent); }
.name { margin: 0 0 2px; font-size: 16px; font-weight: 700; color: var(--text-primary); }
.role { margin: 0 0 10px; font-size: 13px; color: var(--accent); font-weight: 500; }
.bio { margin: 0 0 14px; font-size: 13px; color: var(--text-muted); line-height: 1.5; max-width: 280px; }
.links { display: flex; gap: 12px; }
.links__a { font-size: 12px; font-weight: 500; color: var(--text-muted); text-decoration: none; padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border-light); transition: all 0.15s; }
.links__a:hover { color: var(--accent); border-color: var(--accent); }
</style>
