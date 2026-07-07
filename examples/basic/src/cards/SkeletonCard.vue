<script setup lang="ts"></script>

<template>
  <div class="ace-card ace-card--skeleton">
    <div class="s-hd"><div class="s-icon pulse" /><div class="s-title pulse" /></div>
    <div class="s-body">
      <div class="s-line pulse" style="width:80%" />
      <div class="s-line pulse" style="width:95%" />
      <div class="s-line pulse" style="width:55%" />
    </div>
  </div>
</template>

<style scoped>
.ace-card--skeleton { padding: 18px 22px; background: var(--bg-card); border-radius: 8px; }
.s-hd { display: flex; align-items: center; gap: 10px; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid var(--border-light); }
.s-icon { width: 28px; height: 28px; border-radius: 6px; background: var(--border-light); }
.s-title { height: 12px; width: 160px; border-radius: 3px; background: var(--border-light); }
.s-body { display: flex; flex-direction: column; gap: 10px; }
.s-line { height: 10px; border-radius: 3px; background: var(--border-light); }
.pulse { animation: p 1.8s ease-in-out infinite; }
@keyframes p { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
</style>
