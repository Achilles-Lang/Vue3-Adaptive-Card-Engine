<script setup lang="ts">
import { ref, computed } from 'vue';

interface Todo { id: string; content: string; done?: boolean }

const props = defineProps<{ todos: Todo[] }>();
const items = ref<Todo[]>([...props.todos]);

const done = computed(() => items.value.filter((t) => t.done).length);
const total = computed(() => items.value.length);
const pct = computed(() => total.value ? Math.round((done.value / total.value) * 100) : 0);

function toggle(id: string) {
  const item = items.value.find((t) => t.id === id);
  if (item) item.done = !item.done;
}
</script>

<template>
  <div class="ace-card ace-card--todo">
    <div class="hd">
      <span class="hd__count">{{ done }} / {{ total }} 完成</span>
    </div>
    <div class="bar">
      <div class="bar__fill" :style="{ width: pct + '%' }" />
    </div>
    <ul class="list">
      <li v-for="item in items" :key="item.id" class="list__item" :class="{ 'list__item--done': item.done }" @click="toggle(item.id)">
        <span class="list__check">{{ item.done ? '✓' : '○' }}</span>
        <span class="list__text">{{ item.content }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ace-card--todo { padding: 16px 22px; background: var(--bg-card); border-radius: 8px; }

.hd { display: flex; justify-content: flex-end; margin-bottom: 6px; }
.hd__count { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--accent); }

.bar { height: 4px; background: var(--border-light); border-radius: 2px; overflow: hidden; margin-bottom: 12px; }
.bar__fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s ease; }

.list { list-style: none; margin: 0; padding: 0; }
.list__item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.list__item:hover { background: var(--bg-hover); }
.list__item--done .list__text { text-decoration: line-through; color: var(--text-dim); }
.list__check { font-size: 14px; flex-shrink: 0; color: var(--accent); }
.list__item--done .list__check { color: var(--text-dim); }
.list__text { font-size: 14px; color: var(--text-secondary); }
</style>
