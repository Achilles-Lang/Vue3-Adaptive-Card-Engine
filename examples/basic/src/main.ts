import { createApp } from 'vue';
import App from './App.vue';

/**
 * 演示应用入口
 *
 * 注意：这里的卡片组件由 App.vue 本地管理，
 * 不通过 registerCards 全局注册，以展示完整的状态编排能力。
 * 如需在 CardEngine 中使用这些卡片，参考侧边栏中的代码示例。
 */
const app = createApp(App);
app.mount('#app');
