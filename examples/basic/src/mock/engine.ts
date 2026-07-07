/**
 * Mock AI 响应引擎 —— 离线演示模式
 *
 * 通过关键词匹配模拟 AI 生成结构化卡片，
 * 无需任何 API Key 即可体验引擎全功能。
 */
import type { CardMessage } from 'vue3-adaptive-card-engine';

export interface SimulatedResponse {
  message: string;
  cards: CardMessage[];
}

function msg(id: string, type: string, data: any): CardMessage {
  return { id, role: 'assistant', type, data };
}

// ============================================================
// UI 演示专用数据结构定义（不污染 Core 类型系统）
// ============================================================

export interface MetricItem {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ScheduleItem {
  id: string;
  time: string;
  event: string;
  tag?: string;
}

// ============================================================
// 关键词匹配规则
// ============================================================

export function generateResponse(promptText: string): SimulatedResponse {
  const prompt = promptText.toLowerCase();
  const notice = '\n\n> 💡 **离线演示模式**：当前使用内置模拟引擎展示卡片效果。';

  // 0. 展示全部卡片类型
  if (isShowcase(prompt)) {
    return buildShowcase(notice);
  }

  // 1. 销售业绩
  if (isSales(prompt)) {
    return buildSales(notice);
  }

  // 2. 旅行行程
  if (isTravel(prompt)) {
    return buildTravel(notice);
  }

  // 3. 开发计划
  if (isDevPlan(prompt)) {
    return buildDevPlan(notice);
  }

  // 4. SaaS 指标
  if (isSaaS(prompt)) {
    return buildSaaS(notice);
  }

  // 默认：通用响应
  return buildGeneric(promptText, notice);
}

// ============================================================
// 场景匹配函数
// ============================================================

function isShowcase(s: string): boolean {
  const kw = ['卡片', '样式', '种类', '类型', '展示', '演示', 'showcase', '几', 'format'];
  return kw.some((k) => s.includes(k));
}

function isSales(s: string): boolean {
  const kw = ['sale', 'revenue', 'quarter', 'chart', '销售', '业绩', '季度', '收入', '报表', '图表', '增长'];
  return kw.some((k) => s.includes(k));
}

function isTravel(s: string): boolean {
  const kw = ['itinerary', 'kyoto', 'travel', 'trip', '旅行', '规划', '行程', '京都', '攻略'];
  return kw.some((k) => s.includes(k));
}

function isDevPlan(s: string): boolean {
  const kw = ['dev', 'plan', 'todo', 'checklist', '开发', '任务', '清单', '计划', '代码', '构建'];
  return kw.some((k) => s.includes(k));
}

function isSaaS(s: string): boolean {
  const kw = ['saas', 'kpi', 'business', 'metric', '指标', '数据', '仪表盘', '看板'];
  return kw.some((k) => s.includes(k));
}

// ============================================================
// 场景构建函数
// ============================================================

function buildShowcase(notice: string): SimulatedResponse {
  return {
    message: 'Adaptive Card Engine 支持 **10 种精心设计的交互式卡片**。以下是完整演示：' + notice,
    cards: [
      msg('sc_text', 'text', {
        content: '### 文本卡片 (TextCard)\n- **富文本支持**：原生渲染 Markdown 格式，支持加粗、标题与列表\n- **应用场景**：业务报告、技术文档、AI 生成的总结\n- 完美排版：动态宽度、自适应间距与优雅留白'
      }),
      msg('sc_metric', 'metric', {
        title: '核心业绩指标 (MetricCard)',
        metrics: [
          { label: '月度收入 MRR', value: '¥89,420', change: '+12.4%', trend: 'up' },
          { label: '用户留存率', value: '94.2%', change: '+0.8%', trend: 'up' },
          { label: '平均延迟', value: '4.8ms', change: '-1.2ms', trend: 'down' },
          { label: '服务健康度', value: '99.99%', change: '优秀', trend: 'neutral' }
        ]
      }),
      msg('sc_chart', 'chart', {
        title: '月度营收趋势 (ChartCard)',
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        values: [4500, 5800, 6400, 8900, 12000, 15400]
      }),
      msg('sc_todo', 'todo', {
        todos: [
          { id: 't1', content: '探索 10 种自适应卡片类型与交互模式', done: true },
          { id: 't2', content: '了解数据驱动渲染架构原理', done: true },
          { id: 't3', content: '在项目中集成 NPM 包', done: false },
          { id: 't4', content: '自定义注册你的业务卡片组件', done: false }
        ]
      }),
      msg('sc_progress', 'progress', {
        title: '引擎内核构建进度',
        percentage: 78
      }),
      msg('sc_schedule', 'schedule', {
        title: '项目迭代时间线 (ScheduleCard)',
        items: [
          { id: 's1', time: '09:00', event: '引擎初始化与配置加载', tag: 'System' },
          { id: 's2', time: '10:30', event: '意图解析与类型判别调度', tag: 'AI Engine' },
          { id: 's3', time: '14:00', event: '构建产物编译与输出', tag: 'DevOps' },
          { id: 's4', time: '17:00', event: '集成测试与自动化部署', tag: 'Release' }
        ]
      }),
      msg('sc_image', 'image', {
        title: '影像卡片 (ImageCard)',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop',
        caption: '展示产品渲染图、架构拓扑或摄影作品的图像组件'
      }),
      msg('sc_code', 'code', {
        title: '代码卡片 (CodeCard)',
        code: "import { registerCards, CardEngine } from 'vue3-adaptive-card-engine'\n\nregisterCards([\n  { type: 'text', component: TextCard },\n  { type: 'chart', component: ChartCard }\n])\n\n// <CardEngine :messages=\"messages\" />",
        language: 'typescript'
      }),
      msg('sc_profile', 'profile', {
        title: '用户名片 (ProfileCard)',
        name: 'Adaptive Card Engine',
        role: '数据驱动 UI 渲染引擎',
        bio: '基于 Vue 3 + TypeScript 构建的自适应卡片渲染系统，支持无限扩展卡片类型，零 v-if 的动态 UI 方案。',
        contact: { github: 'https://github.com/Achilles-Lang/Vue3-Adaptive-Card-Engine' }
      })
    ]
  };
}

function buildSales(notice: string): SimulatedResponse {
  return {
    message: '为你编制了 Q2 销售业绩与营收分析报告，包含关键指标、趋势图表和战略洞察。' + notice,
    cards: [
      msg('s_kpi', 'metric', {
        title: 'Q2 核心销售指标',
        metrics: [
          { label: '季度总营业额', value: '¥412,500', change: '+14.8%', trend: 'up' },
          { label: '活跃客户数', value: '1,240', change: '+6.2%', trend: 'up' },
          { label: '客户流失率', value: '1.8%', change: '-0.4%', trend: 'down' },
          { label: '获客成本 CAC', value: '¥182', change: '+2.1%', trend: 'neutral' }
        ]
      }),
      msg('s_chart', 'chart', {
        title: 'Q2 月度营业额趋势',
        labels: ['4月', '5月', '6月'],
        values: [125000, 142000, 165000]
      }),
      msg('s_text', 'text', {
        content: '### 核心洞察\n- **季度强劲增长**：Q2 销售额环比增长 **14.8%**，企业级订阅续约率持续走高\n- **获客成本可控**：CAC 稳定在 **¥182**，自动化营销渠道效果显著\n- **Q3 战略建议**：拓展联属营销与生态伙伴网络，释放新的营收增长极'
      }),
      msg('s_progress', 'progress', {
        title: 'Q2 销售目标达成率',
        percentage: 92
      })
    ]
  };
}

function buildTravel(notice: string): SimulatedResponse {
  return {
    message: '为你生成了 3 日京都旅行规划，完美融合历史古韵与日式风物。' + notice,
    cards: [
      msg('tr_schedule', 'schedule', {
        title: '京都第一日 · 东山历史之旅',
        items: [
          { id: 'k1', time: '09:00', event: '伏见稻荷大社（穿越千本鸟居）', tag: '摄影' },
          { id: 'k2', time: '13:00', event: '祗园享用传统日式便当与抹茶', tag: '美食' },
          { id: 'k3', time: '15:00', event: '漫步三年坂·二年坂，游清水寺', tag: '古迹' },
          { id: 'k4', time: '19:00', event: '先斗町川床纳凉料理', tag: '晚餐' }
        ]
      }),
      msg('tr_todo', 'todo', {
        todos: [
          { id: 'tp1', content: '预定新干线往返车票', done: true },
          { id: 'tp2', content: '购买 ICOCA 交通卡', done: false },
          { id: 'tp3', content: '确认町屋温泉旅馆入住', done: true },
          { id: 'tp4', content: '预定怀石料理席位', done: false }
        ]
      }),
      msg('tr_image', 'image', {
        title: '京都 · 金阁寺',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop',
        caption: '金阁寺夕阳下的倒影，京都最标志性的景观之一'
      })
    ]
  };
}

function buildDevPlan(notice: string): SimulatedResponse {
  return {
    message: '整理了开发监控遥测仪表盘的详细分步实现方案。' + notice,
    cards: [
      msg('dp_todo', 'todo', {
        todos: [
          { id: 'd1', content: 'TypeScript + Vite 初始化项目骨架', done: true },
          { id: 'd2', content: '实现动态卡片注册中心与渲染引擎', done: true },
          { id: 'd3', content: '构建流式 JSON 解析状态机', done: false },
          { id: 'd4', content: '开发图表卡片 SVG 渲染层', done: false },
          { id: 'd5', content: '集成 CI/CD 并部署演示环境', done: false }
        ]
      }),
      msg('dp_metric', 'metric', {
        title: '当前开发状态',
        metrics: [
          { label: '构建状态', value: '正常', change: '100%', trend: 'up' },
          { label: '代码文件数', value: '14', change: '', trend: 'neutral' },
          { label: '测试覆盖率', value: '87%', change: '优秀', trend: 'neutral' }
        ]
      }),
      msg('dp_code', 'code', {
        title: '快速集成示例',
        code: "pnpm install vue3-adaptive-card-engine\n\n# 启动演示\npnpm dev\n\n# 类型检查\npnpm type-check",
        language: 'bash'
      }),
      msg('dp_progress', 'progress', {
        title: '项目整体进度',
        percentage: 65
      })
    ]
  };
}

function buildSaaS(notice: string): SimulatedResponse {
  return {
    message: 'SaaS 核心运营数据看板，聚焦客户生命周期价值与订阅健康状态。' + notice,
    cards: [
      msg('sa_metric', 'metric', {
        title: 'SaaS 业务核心指标',
        metrics: [
          { label: 'MRR', value: '¥48,250', change: '+12.5%', trend: 'up' },
          { label: 'ARR', value: '¥579,000', change: '+18.2%', trend: 'up' },
          { label: 'LTV/CAC', value: '4.2x', change: '> 3x 目标', trend: 'up' },
          { label: '月流失率', value: '1.45%', change: '-0.2%', trend: 'down' }
        ]
      }),
      msg('sa_chart', 'chart', {
        title: 'MRR 营收增长趋势',
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        values: [31000, 34500, 38200, 41000, 44800, 48250]
      }),
      msg('sa_text', 'text', {
        content: '### 运营建议\n- **MRR 稳步攀升**：环比月增长约 **9%**，LTV/CAC 乘数健康\n- **流失率可控**：月流失 1.45% 低于 SaaS 行业基准 3-5%\n- **增长引擎**：企业客户数量季度环比增长 **18%**，推动 MRR 加速'
      })
    ]
  };
}

function buildGeneric(promptText: string, notice: string): SimulatedResponse {
  const title = promptText.slice(0, 30);
  return {
    message: `已针对「${title}${promptText.length > 30 ? '...' : ''}」动态构建自适应卡片。` + notice,
    cards: [
      msg('gen_text', 'text', {
        content: `### 主题解析：${promptText.slice(0, 50)}\n\n- 自适应卡片引擎根据你的输入动态合成了这张展示卡片\n- 下方附有根据该场景推荐的核心后续步骤`
      }),
      msg('gen_todo', 'todo', {
        todos: [
          { id: 'gf1', content: `深入细化「${promptText.slice(0, 30)}」的实现细节`, done: false },
          { id: 'gf2', content: '阅读完整 API 文档与类型定义', done: true },
          { id: 'gf3', content: '注册自定义卡片组件并测试', done: false }
        ]
      })
    ]
  };
}
