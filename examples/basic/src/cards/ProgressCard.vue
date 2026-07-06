<script setup lang="ts">
/**
 * 进度卡片
 *
 * 渲染标题 + 进度条，进度条使用渐变填充，
 * 百分比数值显示在右侧。
 */

defineProps<{
  title: string;
  percentage: number;
}>();
</script>

<template>
  <div class="ace-card ace-card--progress">
    <div class="ace-progress__header">
      <span class="ace-progress__title">{{ title }}</span>
      <span class="ace-progress__value">{{ percentage }}%</span>
    </div>
    <div class="ace-progress__bar">
      <div
        class="ace-progress__fill"
        :style="{ width: percentage + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.ace-card--progress {
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.ace-progress__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ace-progress__title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.ace-progress__value {
  font-size: 15px;
  font-weight: 600;
  color: #4caf50;
}

.ace-progress__bar {
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.ace-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 4px;
  transition: width 0.5s ease;
}
</style>
