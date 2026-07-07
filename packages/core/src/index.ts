/**
 * Vue3-Adaptive-Card-Engine
 *
 * 数据驱动的自适应卡片渲染引擎
 *
 * 核心理念：数据（{ type, data }）+ 映射表（componentMap）= 最终界面（UI）
 *
 * @packageDocumentation
 *
 * @example 快速开始
 * ```typescript
 * import { registerCards, CardEngine } from 'vue3-adaptive-card-engine'
 * import TextCard from './cards/TextCard.vue'
 * import TodoCard from './cards/TodoCard.vue'
 *
 * // 1. 注册卡片
 * registerCards([
 *   { type: 'text', component: TextCard },
 *   { type: 'todo', component: TodoCard }
 * ])
 *
 * // 2. 使用 CardEngine 渲染
 * // <CardEngine :messages="messages" />
 * ```
 */

// ========== Composable ==========
export { useCardEngine } from './useCardEngine';
export type { CardRegistration } from './useCardEngine';

// ========== 组件 ==========
import _CardEngine from './CardEngine.vue';
import _FallbackCard from './FallbackCard.vue';
export const CardEngine = _CardEngine;
export const FallbackCard = _FallbackCard;

// ========== 注册中心 API ==========
export {
  registerCard,
  registerCards,
  getCardComponent,
  resolveCardProps,
  clearRegistry
} from './registry';
export type { ResolverFn, RegisterCardEntry } from './registry';

// ========== 类型定义 ==========
export {
  BUILTIN_TYPES,
  isBuiltinType
} from './types';
export type {
  CardType,
  BuiltinType,
  TextCardData,
  TodoCardData,
  ProgressCardData,
  ChartCardData,
  CardMessage,
  BuiltinCardMessages
} from './types';
