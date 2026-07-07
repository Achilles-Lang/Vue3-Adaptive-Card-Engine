<script setup lang="ts">
defineProps<{ code: string; language: string; title?: string }>();
</script>

<template>
  <div class="ace-card ace-card--code">
    <div class="hd"><span class="hd__dot">● ● ●</span><span class="hd__lang">{{ language }}</span></div>
    <pre class="block"><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.ace-card--code { padding: 0; background: var(--bg-page); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.hd { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; border-bottom: 1px solid var(--border); background: var(--bg-card); }
.hd__dot { font-size: 10px; color: var(--text-dim); letter-spacing: 2px; }
.hd__lang { font-size: 10px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--accent); }
.block { margin: 0; padding: 14px 16px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.65; color: var(--text-secondary); white-space: pre; }
</style>
