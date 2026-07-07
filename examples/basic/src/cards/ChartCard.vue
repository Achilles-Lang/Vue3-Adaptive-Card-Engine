<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ title: string; labels: string[]; values: number[] }>();

type ChartMode = 'bar' | 'line' | 'area';
const mode = ref<ChartMode>('bar');
const hovered = ref<{ label: string; value: number; x: number; y: number } | null>(null);

const points = computed(() => {
  const v = props.values;
  const m = Math.max(...v, 1);
  return v.map((val, i) => ({ label: props.labels[i], value: val, pct: val / m }));
});

// SVG params
const W = 480, H = 200, P = 30;
const GW = W - P * 2, GH = H - P * 2;

const coords = computed(() =>
  points.value.map((p, i) => ({
    ...p,
    x: P + (GW * i) / Math.max(points.value.length - 1, 1),
    y: P + GH - p.pct * GH,
  }))
);

const linePath = computed(() => coords.value.map((c, i) => `${i ? 'L' : 'M'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' '));
const areaPath = computed(() => {
  const pts = coords.value;
  if (!pts.length) return '';
  return `${linePath.value} L ${pts[pts.length - 1].x.toFixed(1)} ${P + GH} L ${pts[0].x.toFixed(1)} ${P + GH} Z`;
});
</script>

<template>
  <div class="ace-card ace-card--chart">
    <div class="hd">
      <h3 class="title">{{ title }}</h3>
      <div class="tabs">
        <button v-for="m in (['bar','line','area'] as ChartMode[])" :key="m"
          class="tabs__btn" :class="{ 'tabs__btn--on': mode === m }" @click="mode = m">
          {{ m === 'bar' ? '▊' : m === 'line' ? '↗' : '▆' }}
        </button>
      </div>
    </div>

    <div class="chart-wrap">
      <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg">
        <!-- Grid -->
        <line v-for="r in [0,0.25,0.5,0.75,1]" :key="r"
          :x1="P" :y1="P + r * GH" :x2="W - P" :y2="P + r * GH"
          stroke="var(--border-light)" stroke-width="0.5" stroke-dasharray="3 3" />
        <!-- Area fill -->
        <path v-if="mode === 'area'" :d="areaPath" fill="var(--accent)" opacity="0.08" />
        <!-- Line -->
        <path v-if="mode === 'line' || mode === 'area'" :d="linePath" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
        <!-- Bars or dots -->
        <template v-for="(c, i) in coords" :key="i">
          <template v-if="mode === 'bar'">
            <rect :x="c.x - (GW / points.length) * 0.35" :y="c.y"
              :width="(GW / points.length) * 0.7" :height="P + GH - c.y"
              rx="3" fill="var(--accent)" opacity="0.8"
              @mouseenter="hovered = c" @mouseleave="hovered = null" />
          </template>
          <template v-else>
            <circle :cx="c.x" :cy="c.y" :r="hovered?.label === c.label ? 4.5 : 3"
              :fill="hovered?.label === c.label ? 'var(--accent)' : 'var(--bg-card)'"
              :stroke="hovered?.label === c.label ? '#fff' : 'var(--accent)'" stroke-width="1.5"
              @mouseenter="hovered = c" @mouseleave="hovered = null" />
          </template>
          <!-- Labels -->
          <text :x="c.x" :y="H - P + 14" text-anchor="middle" font-size="10" fill="var(--text-dim)" font-family="Inter,sans-serif">{{ c.label }}</text>
        </template>
      </svg>

      <!-- Tooltip -->
      <div v-if="hovered" class="tooltip" :style="{ left: (hovered.x / W) * 100 + '%', top: (hovered.y / H) * 100 + '%' }">
        <span class="tooltip__label">{{ hovered.label }}</span>
        <span class="tooltip__val">{{ hovered.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ace-card--chart { padding: 18px 22px; background: var(--bg-card); border-radius: 8px; }

.hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title { margin: 0; font-size: 14px; font-weight: 600; color: var(--text-primary); }

.tabs { display: flex; gap: 2px; background: var(--bg-page); border-radius: 6px; padding: 2px; border: 1px solid var(--border-light); }
.tabs__btn { width: 28px; height: 24px; border: none; border-radius: 4px; background: transparent; color: var(--text-dim); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.tabs__btn--on { background: var(--accent); color: var(--bg-page); }

.chart-wrap { position: relative; }
.chart-svg { width: 100%; height: auto; display: block; }

.tooltip {
  position: absolute;
  transform: translate(-50%, -110%);
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--text-primary);
  color: var(--bg-page);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 5;
  display: flex;
  gap: 8px;
}

.tooltip__label { font-weight: 500; }
.tooltip__val { font-weight: 700; }
</style>
