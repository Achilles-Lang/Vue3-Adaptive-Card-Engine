<script setup lang="ts">
/**
 * 卡片选择器 —— 显示待选卡片，勾选后在画布展示
 */
import type { CardMessage } from 'vue3-adaptive-card-engine';

interface CardEntry { msg: CardMessage; status: string; selected: boolean; source: string }

defineProps<{
  cards: CardEntry[];
  allCards: CardEntry[];
}>();

defineEmits<{
  toggle: [cardId: string];
  selectAll: [];
}>();

const typeLabels: Record<string, string> = {
  text: '📝 文本', todo: '✅ 清单', chart: '📊 图表', metric: '📈 指标',
  progress: '⏳ 进度', schedule: '📅 日程', image: '🖼 影像',
  code: '</> 代码', profile: '👤 名片'
};
</script>

<template>
  <div v-if="cards.length" class="picker">
    <div class="picker__hd">
      <span class="picker__title">选择卡片组合 ({{ cards.length }})</span>
      <button class="picker__all" @click="$emit('selectAll')">全选</button>
    </div>

    <div
      v-for="e in cards"
      :key="e.msg.id"
      class="picker__item"
      :class="{ 'picker__item--checked': e.selected }"
      @click="$emit('toggle', e.msg.id)"
    >
      <span class="picker__check">{{ e.selected ? '✓' : '○' }}</span>
      <span class="picker__type">{{ typeLabels[e.msg.type] || e.msg.type }}</span>
      <span class="picker__status">{{ e.status === 'complete' ? '' : '...' }}</span>
    </div>
  </div>
</template>

<style scoped>
.picker { padding: 0 12px; border-bottom: 1px solid var(--border); }

.picker__hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 4px 6px;
}

.picker__title { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }

.picker__all {
  font-size: 11px; font-weight: 600; color: var(--accent);
  background: none; border: 1px solid var(--accent); border-radius: 4px;
  padding: 2px 10px; cursor: pointer; transition: all 0.15s;
}

.picker__all:hover { background: var(--accent); color: var(--bg-page); }

.picker__item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; margin-bottom: 3px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 13px;
}

.picker__item:hover { background: var(--bg-hover); }

.picker__item--checked {
  background: var(--accent-bg);
}

.picker__check {
  font-size: 13px; flex-shrink: 0;
  color: var(--accent);
}

.picker__item--checked .picker__check { font-weight: 700; }

.picker__type { flex: 1; color: var(--text-secondary); }

.picker__item--checked .picker__type { color: var(--accent); }

.picker__status { font-size: 11px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
</style>
