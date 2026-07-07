<script setup lang="ts">
defineProps<{ title: string; percentage: number }>();
</script>

<template>
  <div class="ace-card ace-card--progress">
    <div class="hd">
      <span class="hd__title">{{ title }}</span>
      <span class="hd__value">{{ percentage }}%</span>
    </div>
    <div class="bar">
      <div class="bar__fill" :style="{ width: percentage + '%' }" />
    </div>
  </div>
</template>

<style scoped>
.ace-card--progress { padding: 18px 22px; background: var(--bg-card); border-radius: 8px; }
.hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.hd__title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.hd__value { font-size: 15px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; }
.bar { height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.bar__fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.6s ease; }
</style>
