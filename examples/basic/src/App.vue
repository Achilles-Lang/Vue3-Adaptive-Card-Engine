<script setup lang="ts">
/**
 * 示例应用 —— 演示 CardEngine 渲染 4 种卡片
 */
import { ref } from 'vue';
import type { CardMessage } from 'vue3-adaptive-card-engine';
import CardEngine from 'vue3-adaptive-card-engine/CardEngine.vue';

const messages = ref<CardMessage[]>([
  {
    id: 1,
    role: 'assistant',
    type: 'text',
    data: {
      content:
        '欢迎使用 Vue3-Adaptive-Card-Engine！\n这是一个数据驱动的动态卡片渲染引擎。'
    }
  },
  {
    id: 2,
    role: 'assistant',
    type: 'todo',
    data: {
      todos: [
        { id: '1', content: '了解固定模板分发机制', done: true },
        { id: '2', content: '注册自定义卡片组件', done: false },
        { id: '3', content: '传入数据渲染界面', done: false }
      ]
    }
  },
  {
    id: 3,
    role: 'assistant',
    type: 'progress',
    data: {
      title: '项目完成进度',
      percentage: 65
    }
  },
  {
    id: 4,
    role: 'assistant',
    type: 'chart',
    data: {
      title: '月度数据统计',
      labels: ['1月', '2月', '3月', '4月', '5月'],
      values: [120, 200, 150, 80, 240]
    }
  }
]);
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🎴 Vue3 Adaptive Card Engine</h1>
      <p>数据驱动的动态卡片渲染演示</p>
    </header>
    <main class="app-main">
      <CardEngine :messages="messages" />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  background: #f0f2f5;
  color: #333;
}

.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 32px;
}

.app-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.app-header p {
  font-size: 15px;
  color: #888;
}

.app-main {
  display: flex;
  flex-direction: column;
}
</style>
