<script setup lang="ts">
import type { ScheduleItem } from '../mock/engine';
defineProps<{ title: string; items: ScheduleItem[] }>();
</script>

<template>
  <div class="ace-card ace-card--schedule">
    <h3 class="title">{{ title }}</h3>
    <div class="tl">
      <div v-for="(item, i) in items" :key="item.id" class="tl__node">
        <div class="tl__dot-col">
          <div class="tl__dot" />
          <div v-if="i < items.length - 1" class="tl__line" />
        </div>
        <div class="tl__content">
          <span class="tl__time">{{ item.time }}</span>
          <span class="tl__event">{{ item.event }}</span>
          <span v-if="item.tag" class="tl__tag">{{ item.tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ace-card--schedule { padding: 18px 22px; background: var(--bg-card); border-radius: 8px; }
.title { margin: 0 0 16px; font-size: 14px; font-weight: 600; color: var(--text-primary); }
.tl { display: flex; flex-direction: column; }
.tl__node { display: flex; gap: 12px; }
.tl__dot-col { display: flex; flex-direction: column; align-items: center; width: 16px; flex-shrink: 0; }
.tl__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex-shrink: 0; }
.tl__line { width: 1px; flex: 1; min-height: 14px; background: var(--border-light); margin-top: 4px; }
.tl__content { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; padding: 4px 0 12px; }
.tl__time { font-size: 12px; font-weight: 600; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
.tl__event { font-size: 14px; color: var(--text-secondary); flex: 1; }
.tl__tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: var(--accent-bg); color: var(--accent); }
</style>
