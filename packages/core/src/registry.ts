/**
 * 卡片注册中心 —— 分发引擎核心
 *
 * 维护「类型 → 组件」和「类型 → 属性解析函数」两张映射表，
 * 提供卡片注册、查询、属性解析等核心能力。
 *
 * @packageDocumentation
 */

import type { Component } from 'vue';
import type { CardMessage } from './types';

/**
 * 属性解析函数类型
 * 接收完整消息对象，返回组件需要的 props 对象
 *
 * @typeParam T - 卡片 type 字符串
 * @typeParam D - 卡片 data 类型
 */
export type ResolverFn<T extends string = string, D = unknown> = (
  message: CardMessage<T, D>
) => Record<string, unknown>;

/**
 * 注册卡片参数（用于批量注册）
 */
export interface RegisterCardEntry {
  /** 卡片类型 */
  type: string;
  /** Vue 组件 */
  component: Component;
  /** 可选的属性解析函数 */
  resolve?: ResolverFn;
}

// ========== 内部状态 ==========

/** 类型 → 组件 映射表 */
const componentMap = new Map<string, Component>();

/** 类型 → 属性解析函数 映射表 */
const resolverMap = new Map<string, ResolverFn>();

// ========== 注册 API ==========

/**
 * 注册单个卡片
 *
 * 将指定的 type 与 Vue 组件关联，同时可选的 propsResolver
 * 用于自定义属性提取逻辑。如果 type 已注册则覆盖。
 *
 * @param type - 卡片类型字符串
 * @param component - Vue 组件
 * @param propsResolver - 可选的属性解析函数，默认直接将 message.data 作为 props
 */
export function registerCard(
  type: string,
  component: Component,
  propsResolver?: ResolverFn
): void {
  componentMap.set(type, component);

  if (propsResolver) {
    resolverMap.set(type, propsResolver);
  } else {
    // 默认解析器：直接返回 message.data
    resolverMap.set(type, (msg: CardMessage) => {
      if (typeof msg.data === 'object' && msg.data !== null) {
        return msg.data as Record<string, unknown>;
      }
      return { data: msg.data };
    });
  }
}

/**
 * 批量注册卡片
 *
 * 接收注册条目数组，内部循环调用 registerCard，
 * 大幅减少用户样板代码。推荐在应用入口统一调用。
 *
 * @param entries - 注册条目数组
 *
 * @example
 * ```typescript
 * registerCards([
 *   { type: 'text', component: TextCard },
 *   { type: 'todo', component: TodoCard }
 * ])
 * ```
 */
export function registerCards(entries: RegisterCardEntry[]): void {
  for (const { type, component, resolve } of entries) {
    registerCard(type, component, resolve);
  }
}

// ========== 查询 API ==========

/**
 * 根据 type 获取已注册的组件
 *
 * @param type - 卡片类型字符串
 * @returns 匹配的 Vue 组件，未注册时返回 null
 */
export function getCardComponent(type: string): Component | null {
  return componentMap.get(type) ?? null;
}

/**
 * 根据消息对象的 type 解析组件所需的 props
 *
 * 查找对应的属性解析函数并调用，若未注册解析函数则默认返回完整 data。
 * 适用于大部分场景（卡片 data 字段刚好是组件的 props）。
 *
 * @param message - 完整的卡片消息对象
 * @returns 供组件 v-bind 使用的 props 对象
 */
export function resolveCardProps(
  message: CardMessage
): Record<string, unknown> {
  const resolver = resolverMap.get(message.type);

  if (resolver) {
    return resolver(message);
  }

  // 兜底：当 type 未注册解析函数时，直接返回 data
  if (typeof message.data === 'object' && message.data !== null) {
    return message.data as Record<string, unknown>;
  }
  return { data: message.data };
}

// ========== 管理 API ==========

/**
 * 清空所有注册信息
 *
 * 主要用于测试场景，确保每个测试用例都在干净的注册环境中运行。
 */
export function clearRegistry(): void {
  componentMap.clear();
  resolverMap.clear();
}
