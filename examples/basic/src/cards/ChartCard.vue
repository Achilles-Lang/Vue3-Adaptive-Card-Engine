<script setup lang="ts">
/**
 * 图表卡片
 *
 * 使用纯 div 实现横向柱状图，按比例展示数值对比。
 * 无第三方图表库依赖。
 */
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  labels: string[];
  values: number[];
}>();

const maxValue = computed(() => Math.max(...props.values, 1));
</script>

<template>
  <div class="ace-card ace-card--chart">
    <h3 class="ace-chart__title">{{ title }}</h3>
    <div class="ace-chart__bars">
      <div
        v-for="(label, index) in labels"
        :key="label"
        class="ace-chart__row"
      >
        <span class="ace-chart__label">{{ label }}</span>
        <div class="ace-chart__bar-wrapper">
          <div
            class="ace-chart__bar"
            :style="{ width: (values[index] / maxValue) * 100 + '%' }"
          />
          <span class="ace-chart__value">{{ values[index] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ace-card--chart {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.ace-chart__title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.ace-chart__bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ace-chart__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ace-chart__label {
  width: 60px;
  font-size: 13px;
  color: #666;
  text-align: right;
  flex-shrink: 0;
}

.ace-chart__bar-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ace-chart__bar {
  height: 24px;
  background: linear-gradient(90deg, #42a5f5, #1e88e5);
  border-radius: 3px;
  min-width: 4px;
  transition: width 0.5s ease;
}

.ace-chart__value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  min-width: 30px;
}
</style>
