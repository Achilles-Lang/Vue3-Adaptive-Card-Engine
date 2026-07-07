/**
 * useCardEngine —— Composition API 封装
 *
 * 用声明式 API 管理卡片注册与消息渲染，替代手动调用 registerCards + CardEngine props。
 *
 * @example
 * ```typescript
 * const { register, addMessage, messages } = useCardEngine();
 *
 * register([
 *   { type: 'text', component: TextCard },
 *   { type: 'todo', component: TodoCard }
 * ]);
 *
 * addMessage({ type: 'text', data: { content: 'Hello' } });
 * // <CardEngine :messages="messages" />
 * ```
 *
 * @packageDocumentation
 */

import { ref, type Component, type Ref } from 'vue';
import type { CardMessage } from './types';
import { registerCards } from './registry';

export interface CardRegistration {
  type: string;
  component: Component;
  resolve?: (msg: CardMessage) => Record<string, unknown>;
}

export function useCardEngine(initialMessages: CardMessage[] = []) {
  const messages = ref<CardMessage[]>([...initialMessages]) as Ref<CardMessage[]>;

  /**
   * 批量注册卡片组件
   */
  function register(entries: CardRegistration[]): void {
    registerCards(entries);
  }

  /**
   * 添加单条消息到渲染队列
   */
  function addMessage(msg: CardMessage): void {
    messages.value.push(msg);
  }

  /**
   * 批量添加消息
   */
  function addMessages(msgs: CardMessage[]): void {
    messages.value.push(...msgs);
  }

  /**
   * 清空所有消息
   */
  function clear(): void {
    messages.value = [];
  }

  /**
   * 移除指定消息
   */
  function remove(id: string | number): void {
    messages.value = messages.value.filter((m) => m.id !== id);
  }

  return {
    messages,
    register,
    addMessage,
    addMessages,
    clear,
    remove
  };
}
