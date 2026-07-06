import { createApp } from 'vue';
import { registerCards, CardEngine } from 'vue3-adaptive-card-engine';
import TextCard from './cards/TextCard.vue';
import TodoCard from './cards/TodoCard.vue';
import ProgressCard from './cards/ProgressCard.vue';
import ChartCard from './cards/ChartCard.vue';
import App from './App.vue';

/**
 * 批量注册所有内置卡片
 * data 结构与各卡片 Props 一一对应，无需额外 resolve 函数
 */
registerCards([
  { type: 'text', component: TextCard },
  { type: 'todo', component: TodoCard },
  { type: 'progress', component: ProgressCard },
  { type: 'chart', component: ChartCard }
]);

const app = createApp(App);
app.mount('#app');
