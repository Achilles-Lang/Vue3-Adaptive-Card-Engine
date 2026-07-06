/**
 * 注册中心单元测试
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { defineComponent, h } from 'vue';
import {
  registerCard,
  registerCards,
  getCardComponent,
  resolveCardProps,
  clearRegistry
} from 'vue3-adaptive-card-engine';
import type { CardMessage } from 'vue3-adaptive-card-engine';

// Mock 组件
const MockTextCard = defineComponent({
  name: 'MockTextCard',
  props: { content: String },
  render: () => h('div')
});

const MockTodoCard = defineComponent({
  name: 'MockTodoCard',
  props: { todos: Array },
  render: () => h('div')
});

beforeEach(() => {
  clearRegistry();
});

describe('registerCard', () => {
  it('应该能注册组件并根据 type 获取', () => {
    registerCard('text', MockTextCard);
    const component = getCardComponent('text');
    expect(component).toBe(MockTextCard);
  });

  it('未注册的 type 应返回 null', () => {
    const component = getCardComponent('unknown');
    expect(component).toBeNull();
  });
});

describe('registerCards', () => {
  it('应能批量注册多个组件', () => {
    registerCards([
      { type: 'text', component: MockTextCard },
      { type: 'todo', component: MockTodoCard }
    ]);

    expect(getCardComponent('text')).toBe(MockTextCard);
    expect(getCardComponent('todo')).toBe(MockTodoCard);
  });
});

describe('重复注册', () => {
  it('重复注册相同 type 应覆盖原有组件', () => {
    registerCard('text', MockTextCard);
    registerCard('text', MockTodoCard);
    expect(getCardComponent('text')).toBe(MockTodoCard);
  });
});

describe('resolveCardProps', () => {
  it('默认解析器应返回 message.data', () => {
    registerCard('text', MockTextCard);

    const msg: CardMessage = {
      id: '1',
      role: 'assistant',
      type: 'text',
      data: { content: 'hello' }
    };

    const props = resolveCardProps(msg);
    expect(props).toEqual({ content: 'hello' });
  });

  it('自定义解析器应被调用', () => {
    registerCard('progress', MockTextCard, (msg) => ({
      percentage: (msg.data as { percentage: number }).percentage
    }));

    const msg: CardMessage = {
      id: '2',
      role: 'assistant',
      type: 'progress',
      data: { title: 'Loading', percentage: 75 }
    };

    const props = resolveCardProps(msg);
    expect(props).toEqual({ percentage: 75 });
  });
});

describe('clearRegistry', () => {
  it('应清空所有注册', () => {
    registerCard('text', MockTextCard);
    registerCard('todo', MockTodoCard);

    clearRegistry();

    expect(getCardComponent('text')).toBeNull();
    expect(getCardComponent('todo')).toBeNull();
  });
});
