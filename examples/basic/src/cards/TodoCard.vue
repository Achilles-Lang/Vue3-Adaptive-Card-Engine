<script setup lang="ts">
/**
 * 待办卡片
 *
 * 渲染待办列表，每项带复选框，v-model 绑定完成状态。
 * 仅前端交互，不涉及后端同步。
 */

import { ref } from 'vue';

interface Todo {
  id: string;
  content: string;
  done?: boolean;
}

const props = defineProps<{
  todos: Todo[];
}>();

// 响应式完成状态（复制一份用于前端交互）
const items = ref<Todo[]>([...props.todos]);

function toggleDone(id: string): void {
  const item = items.find((t) => t.id === id);
  if (item) {
    item.done = !item.done;
  }
}
</script>

<template>
  <div class="ace-card ace-card--todo">
    <ul class="ace-todo-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="ace-todo-list__item"
        :class="{ 'ace-todo-list__item--done': item.done }"
        @click="toggleDone(item.id)"
      >
        <span class="ace-todo-list__checkbox">
          {{ item.done ? '✅' : '☐' }}
        </span>
        <span class="ace-todo-list__content">
          {{ item.content }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ace-card--todo {
  padding: 12px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.ace-todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ace-todo-list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.ace-todo-list__item:last-child {
  border-bottom: none;
}

.ace-todo-list__item:hover {
  background: #fafafa;
}

.ace-todo-list__item--done .ace-todo-list__content {
  text-decoration: line-through;
  color: #bbb;
}

.ace-todo-list__checkbox {
  font-size: 16px;
  flex-shrink: 0;
}

.ace-todo-list__content {
  font-size: 15px;
  color: #333;
}
</style>
