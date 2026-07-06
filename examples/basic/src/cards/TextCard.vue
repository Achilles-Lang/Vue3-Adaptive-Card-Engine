<script setup lang="ts">
/**
 * 文本卡片
 *
 * 渲染纯文本内容，支持换行（white-space: pre-wrap）
 */

defineProps<{
  content: string;
}>();
</script>

<template>
  <div class="ace-card ace-card--text">
    <p class="ace-card__content">{{ content }}</p>
  </div>
</template>

<style scoped>
.ace-card--text {
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.ace-card__content {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
}
</style>
