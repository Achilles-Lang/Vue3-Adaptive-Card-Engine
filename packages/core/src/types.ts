/**
 * Vue3-Adaptive-Card-Engine 核心类型定义
 *
 * 数据驱动的动态卡片渲染引擎 —— 类型契约层
 * 支持无限扩展的自定义卡片类型，不将内置类型作为硬约束
 *
 * @packageDocumentation
 */

/**
 * 卡片类型 —— 泛型字符串，支持任意自定义类型
 * 不与具体类型绑定，仅通过内置常量提供参考值
 */
export type CardType = string;

/**
 * 内置卡片类型常量（仅作参考，不作为类型约束）
 * 用户可自由注册任意自定义 type 字符串
 */
export const BUILTIN_TYPES = {
  text: 'text',
  todo: 'todo',
  progress: 'progress',
  chart: 'chart'
} as const;

/** 内置卡片类型的联合类型（仅供内置卡片使用） */
export type BuiltinType = (typeof BUILTIN_TYPES)[keyof typeof BUILTIN_TYPES];

/**
 * 类型守卫：判断给定 type 是否为内置卡片类型
 * 方便用户在自定义降级逻辑中使用
 *
 * @param type - 待判断的卡片类型字符串
 * @returns 如果是内置类型返回 true
 */
export function isBuiltinType(type: string): type is BuiltinType {
  return Object.values(BUILTIN_TYPES).includes(type as BuiltinType);
}

// ========== 内置卡片数据接口 ==========

/**
 * 文本卡片数据
 * 用于展示纯文本内容，支持换行
 */
export interface TextCardData {
  content: string;
}

/**
 * 待办卡片数据
 * 每条待办包含 id、内容和可选的完成状态
 */
export interface TodoCardData {
  todos: Array<{
    id: string;
    content: string;
    done?: boolean;
  }>;
}

/**
 * 进度卡片数据
 * 展示带标题的进度条，百分比 0-100
 */
export interface ProgressCardData {
  title: string;
  percentage: number;
}

/**
 * 图表卡片数据
 * 展示标题和纯 div 横向柱状图的标签与数值
 */
export interface ChartCardData {
  title: string;
  labels: string[];
  values: number[];
}

// ========== 通用消息接口 ==========

/**
 * 卡片消息 —— 引擎统一数据契约
 *
 * 泛型参数支持任意自定义类型扩展：
 * - T: 卡片类型字符串（默认 string）
 * - D: 卡片数据（默认 any 作为占位，实际使用时应由具体类型窄化）
 *
 * @typeParam T - 卡片 type 字符串
 * @typeParam D - 卡片 data 数据类型
 */
export interface CardMessage<T extends string = string, D = unknown> {
  /** 消息唯一标识 */
  id: string | number;
  /** 消息角色：用户或 AI 助手 */
  role: 'user' | 'assistant';
  /** 卡片类型，用于路由到对应组件 */
  type: T;
  /** 卡片数据，类型由 T 决定 */
  data: D;
}

/**
 * 内置卡片的消息类型映射
 * 将内置 type 与对应的 data 接口关联
 */
export interface BuiltinCardMessages {
  text: CardMessage<'text', TextCardData>;
  todo: CardMessage<'todo', TodoCardData>;
  progress: CardMessage<'progress', ProgressCardData>;
  chart: CardMessage<'chart', ChartCardData>;
}
