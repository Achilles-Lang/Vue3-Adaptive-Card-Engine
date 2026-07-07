<script setup lang="ts">
/**
 * 极简卡片包裹器
 * 仅三个职责：容器布局、状态透明度、完成态时淡入内容
 */
defineProps<{
  status: 'thinking' | 'generating' | 'complete';
}>();
</script>

<template>
  <div
    class="cw"
    :class="{
      'cw--thinking': status === 'thinking',
      'cw--generating': status === 'generating',
      'cw--complete': status === 'complete'
    }"
  >
    <div class="cw__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cw {
  border-radius: 8px;
  transition: opacity 0.25s;
}

.cw--thinking  { opacity: 0.6; }
.cw--generating { opacity: 0.85; }
.cw--complete   { opacity: 1; }

.cw__body { position: relative; z-index: 1; }
</style>
