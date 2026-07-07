<script setup lang="ts">
import type { MetricItem } from '../mock/engine';
defineProps<{ title: string; metrics: MetricItem[] }>();
</script>

<template>
  <div class="ace-card ace-card--metric">
    <h3 class="title">{{ title }}</h3>
    <div class="grid">
      <div v-for="(m, i) in metrics" :key="i" class="item">
        <span class="item__label">{{ m.label }}</span>
        <div class="item__row">
          <span class="item__val">{{ m.value }}</span>
          <span v-if="m.trend" class="item__trend" :class="`item__trend--${m.trend}`">{{ m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→' }}</span>
        </div>
        <span v-if="m.change" class="item__chg" :class="`item__chg--${m.trend}`">{{ m.change }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ace-card--metric { padding: 18px 22px; background: var(--bg-card); border-radius: 8px; }
.title { margin: 0 0 14px; font-size: 14px; font-weight: 600; color: var(--text-primary); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.item { padding: 12px 14px; background: var(--bg-page); border-radius: 6px; }
.item__label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
.item__row { display: flex; align-items: baseline; gap: 4px; }
.item__val { font-size: 20px; font-weight: 700; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; }
.item__trend { font-size: 12px; font-weight: 700; }
.item__trend--up { color: var(--accent); }
.item__trend--down { color: var(--danger); }
.item__trend--neutral { color: var(--text-muted); }
.item__chg { display: block; font-size: 11px; font-weight: 600; margin-top: 2px; }
.item__chg--up { color: var(--accent); }
.item__chg--down { color: var(--danger); }
.item__chg--neutral { color: var(--text-muted); }
</style>
