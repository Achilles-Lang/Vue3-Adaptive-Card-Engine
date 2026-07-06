<script setup lang="ts">
/**
 * CardEngine —— 自适应卡片渲染引擎
 *
 * 核心渲染组件，遍历消息数组，根据每条消息的 type
 * 从注册中心获取对应组件并动态渲染。未匹配的 type
 * 会降级渲染兜底组件（可自定义）。
 *
 * 这是整个「固定模板分发机制」的执行入口。
 */

import type { Component } from 'vue';
import type { CardMessage } from './types';
import { getCardComponent, resolveCardProps } from './registry';
import FallbackCard from './FallbackCard.vue';

const props = withDefaults(
  defineProps<{
    /** 消息数组，每条消息包含 type 和 data */
    messages: CardMessage[];
    /** 自定义兜底组件，默认使用内置 FallbackCard */
    fallback?: Component;
  }>(),
  {
    fallback: () => FallbackCard
  }
);

/**
 * 根据消息 type 获取渲染组件，未匹配时返回兜底组件
 */
function getComponent(msg: CardMessage): Component {
  const card = getCardComponent(msg.type);
  return card ?? (props.fallback as Component);
}

/**
 * 解析组件所需的 props，附带 key 信息用于 v-bind
 */
function getProps(msg: CardMessage): Record<string, unknown> {
  return {
    ...resolveCardProps(msg),
    // 额外传入 type，供兜底组件显示
    type: msg.type
  };
}
</script>

<template>
  <div class="ace-card-engine">
    <component
      :is="getComponent(msg)"
      v-for="msg in messages"
      :key="msg.id"
      v-bind="getProps(msg)"
    />
  </div>
</template>

<style scoped>
.ace-card-engine {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
