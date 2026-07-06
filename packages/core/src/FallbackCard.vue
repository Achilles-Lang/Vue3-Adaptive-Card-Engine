<script setup lang="ts">
/**
 * 兜底卡片组件
 *
 * 当消息的 type 未匹配到任何已注册组件时渲染此卡片，
 * 提示用户当前类型不受支持。支持自定义兜底组件替代。
 */

defineProps<{
  /** 未匹配的卡片类型 */
  type?: string;
}>();
</script>

<template>
  <div class="ace-fallback-card">
    <div class="ace-fallback-card__icon">⚠</div>
    <p class="ace-fallback-card__message">
      不支持的卡片类型：{{ type ?? '未知' }}
    </p>
  </div>
</template>

<style scoped>
.ace-fallback-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f5f5f5;
  border: 1px dashed #ccc;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

.ace-fallback-card__icon {
  font-size: 20px;
  flex-shrink: 0;
}

.ace-fallback-card__message {
  margin: 0;
}
</style>
