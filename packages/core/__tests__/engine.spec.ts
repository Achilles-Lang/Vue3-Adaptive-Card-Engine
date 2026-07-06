/**
 * CardEngine 单元测试
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import {
  registerCard,
  clearRegistry,
  CardEngine
} from 'vue3-adaptive-card-engine';
import type { CardMessage } from 'vue3-adaptive-card-engine';

// Mock Text 组件
const MockTextCard = defineComponent({
  name: 'MockTextCard',
  props: { content: String },
  render() {
    return h('div', { class: 'mock-text-card' }, this.content);
  }
});

// Mock Chart 组件
const MockChartCard = defineComponent({
  name: 'MockChartCard',
  props: { title: String, labels: Array, values: Array },
  render() {
    return h('div', { class: 'mock-chart-card' }, this.title);
  }
});

beforeEach(() => {
  clearRegistry();
});

describe('CardEngine', () => {
  it('应根据 type 正确渲染对应组件', () => {
    registerCard('text', MockTextCard);

    const messages: CardMessage[] = [
      { id: '1', role: 'assistant', type: 'text', data: { content: 'Hello World' } }
    ];

    const wrapper = mount(CardEngine as any, {
      props: { messages }
    });

    const textCard = wrapper.find('.mock-text-card');
    expect(textCard.exists()).toBe(true);
    expect(textCard.text()).toBe('Hello World');
  });

  it('未知 type 应渲染兜底组件', () => {
    const messages: CardMessage[] = [
      { id: '1', role: 'assistant', type: 'unknown_type', data: {} }
    ];

    const wrapper = mount(CardEngine as any, {
      props: { messages }
    });

    // FallbackCard 显示"不支持的卡片类型"
    const fallback = wrapper.find('.ace-fallback-card');
    expect(fallback.exists()).toBe(true);
    expect(fallback.text()).toContain('不支持的卡片类型');
    expect(fallback.text()).toContain('unknown_type');
  });

  it('props 应正确透传给子组件', () => {
    registerCard('chart', MockChartCard);

    const messages: CardMessage[] = [
      {
        id: '1',
        role: 'assistant',
        type: 'chart',
        data: { title: 'My Chart', labels: ['A', 'B'], values: [10, 20] }
      }
    ];

    const wrapper = mount(CardEngine as any, {
      props: { messages }
    });

    const chartCard = wrapper.find('.mock-chart-card');
    expect(chartCard.exists()).toBe(true);
    expect(chartCard.text()).toBe('My Chart');
  });
});
