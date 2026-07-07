<script setup lang="ts">
/**
 * Adaptive Card Engine — Demo
 * 左侧：Prompt 输入 + 卡片选择器  右侧：已选卡片组合展示
 */
import { ref, computed, onMounted } from 'vue';
import type { CardMessage } from 'vue3-adaptive-card-engine';
import CardWrapper from './components/CardWrapper.vue';
import CardPicker from './components/CardPicker.vue';
import SkeletonCard from './cards/SkeletonCard.vue';
import TextCard from './cards/TextCard.vue';
import TodoCard from './cards/TodoCard.vue';
import ProgressCard from './cards/ProgressCard.vue';
import ChartCard from './cards/ChartCard.vue';
import MetricCard from './cards/MetricCard.vue';
import ScheduleCard from './cards/ScheduleCard.vue';
import ImageCard from './cards/ImageCard.vue';
import CodeCard from './cards/CodeCard.vue';
import ProfileCard from './cards/ProfileCard.vue';

// ============================================================
// 状态
// ============================================================
type CardStatus = 'thinking' | 'generating' | 'complete';

interface CardEntry {
  msg: CardMessage;
  status: CardStatus;
  selected: boolean;
  source: string; // 来源 prompt
}

const entries = ref<CardEntry[]>([]);
const isThinking = ref(false);
const selectedCard = ref<CardMessage | null>(null);
const theme = ref<'dark' | 'light'>('dark');
const sourceLabel = ref<string>('mock');
const pendingCardIds = ref<Set<string>>(new Set());

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cardIds: string[];
}
const chatHistory = ref<ChatMsg[]>([]);

// 展示在画布上的 = 已选中的已完成的卡片
const canvasCards = computed(() =>
  entries.value.filter((e) => e.selected && e.status === 'complete')
);

// 待选择的（刚生成的）
const pendingCards = computed(() =>
  entries.value.filter((e) => pendingCardIds.value.has(e.msg.id))
);

// ============================================================
// localStorage
// ============================================================
const KEY = 'ace_demo_v4';
onMounted(() => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      entries.value = parsed.map((e: any) => ({ ...e, selected: true, status: 'complete' as const, source: e.source || '' }));
    }
  } catch { /* */ }
  const savedTheme = localStorage.getItem('ace_theme');
  if (savedTheme === 'light') theme.value = 'light';
  applyTheme();
});

function persist() { try { localStorage.setItem(KEY, JSON.stringify(entries.value)); } catch { /* */ } }
function applyTheme() { document.documentElement.setAttribute('data-theme', theme.value); localStorage.setItem('ace_theme', theme.value); }
function toggleTheme() { theme.value = theme.value === 'dark' ? 'light' : 'dark'; applyTheme(); }

// ============================================================
// 核心流程：发送 Prompt → AI 响应 → 卡片选择
// ============================================================
async function handleSend(content: string) {
  if (isThinking.value) return;
  isThinking.value = true;
  chatHistory.value.push({ id: `usr_${Date.now()}`, role: 'user', content, cardIds: [] });
  pendingCardIds.value = new Set();

  try {
    // 1. 调用 API
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: content })
    });
    const data = await res.json();
    sourceLabel.value = data.source || 'mock';

    if (data.cards?.length) {
      // 记录聊天消息
      const cardIds = data.cards.map((c: any) => c.id);
      chatHistory.value.push({ id: `ai_${Date.now()}`, role: 'assistant', content: data.message || '', cardIds });
      // 2. 创建待选卡片（thinking 状态）
      const newEntries: CardEntry[] = data.cards.map((c: any) => ({
        msg: { ...c, data: {} },
        status: 'thinking' as const,
        selected: false,
        source: content
      }));
      const newIds = new Set(newEntries.map((e) => e.msg.id));
      pendingCardIds.value = newIds;
      entries.value = [...entries.value, ...newEntries];
      persist();
      await wait(800);

      // 3. generating
      entries.value = entries.value.map((e) =>
        newIds.has(e.msg.id) ? { ...e, status: 'generating' as const } : e
      );
      persist();
      await wait(1200);

      // 4. complete — 注入真实数据
      entries.value = entries.value.map((e) => {
        if (newIds.has(e.msg.id)) {
          const real = data.cards.find((c: any) => c.id === e.msg.id);
          return { ...e, msg: real || e.msg, status: 'complete' as const };
        }
        return e;
      });
      persist();
    }
  } catch (e: any) {
    chatMessage.value = '请求失败: ' + (e.message || '未知错误');
  } finally {
    isThinking.value = false;
  }
}

function wait(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// ============================================================
// 卡片选择 / 取消
// ============================================================
function handleSelectCard(cardId: string) {
  const entry = entries.value.find((e) => e.msg.id === cardId);
  if (entry && entry.status === 'complete') {
    entry.selected = !entry.selected;
    // 已做选择就从 pending 移除
    if (pendingCardIds.value.has(cardId)) {
      const next = new Set(pendingCardIds.value);
      next.delete(cardId);
      pendingCardIds.value = next;
    }
    persist();
  }
}

function handleSelectAll() {
  for (const e of entries.value) {
    if (pendingCardIds.value.has(e.msg.id) && e.status === 'complete') e.selected = true;
  }
  pendingCardIds.value = new Set();
  persist();
}

function handleRemoveFromCanvas(cardId: string) {
  const entry = entries.value.find((e) => e.msg.id === cardId);
  if (entry) entry.selected = false;
  persist();
}

function handleShowCardJSON(cardId: string) {
  const entry = entries.value.find((e) => e.msg.id === cardId);
  selectedCard.value = entry ? entry.msg : null;
}

function handleClear() {
  entries.value = [];
  chatHistory.value = [];
  selectedCard.value = null;
  pendingCardIds.value = new Set();
  persist();
}

const promptRef = ref('');
function submitPrompt() {
  if (!promptRef.value.trim() || isThinking.value) return;
  handleSend(promptRef.value);
  promptRef.value = '';
}

// 卡片类型筛选
const filterType = ref<string>('all');
const filteredCanvasCards = computed(() => {
  if (filterType.value === 'all') return canvasCards.value;
  return canvasCards.value.filter((e) => e.msg.type === filterType.value);
});

const filterLabels: Record<string, string> = {
  all: 'All', text: '文本', todo: '清单', chart: '图表', metric: '指标',
  progress: '进度', schedule: '日程', image: '影像', code: '代码', profile: '名片'
};
const filterKeys = Object.keys(filterLabels);
</script>

<template>
  <div class="app">
    <!-- 导航 -->
    <header class="nav">
      <div class="nav__left">
        <span class="nav__logo">◈</span>
        <span class="nav__name">Adaptive Card Engine</span>
        <span class="nav__ver">v1.0.0</span>
        <span v-if="sourceLabel === 'ai'" class="nav__badge nav__badge--ai">AI</span>
        <span v-else class="nav__badge nav__badge--mock">Mock</span>
      </div>
      <div class="nav__right">
        <a class="nav__link" href="#">文档</a>
        <button class="nav__theme" @click="toggleTheme">{{ theme === 'dark' ? '☀' : '☾' }}</button>
        <a class="nav__link" href="https://github.com/Achilles-Lang/Vue3-Adaptive-Card-Engine" target="_blank" rel="noopener">GitHub</a>
      </div>
    </header>

    <div class="body">
      <!-- 左侧面板 -->
      <aside class="panel">
        <!-- 输入 -->
        <div class="panel__input">
          <textarea v-model="promptRef" class="panel__area" placeholder="描述你想生成的卡片..." rows="4" :disabled="isThinking" @keydown.enter.exact.prevent="submitPrompt" />
          <button class="panel__send" :disabled="isThinking || !promptRef.trim()" @click="submitPrompt">
            {{ isThinking ? '生成中...' : '发送' }}
          </button>
        </div>

        <!-- 快捷 Prompt -->
        <div class="panel__chips">
          <button v-for="p in ['展示全部卡片类型','销售业绩报表','京都旅行规划','开发任务里程碑']" :key="p" class="panel__chip" :disabled="isThinking" @click="handleSend(p)">{{ p }}</button>
        </div>

        <!-- 卡片选择器 -->
        <CardPicker
          :cards="pendingCards"
          :all-cards="entries"
          @toggle="handleSelectCard"
          @select-all="handleSelectAll"
        />

        <!-- 画布中的卡片列表（可移除 + 查看 JSON） -->
        <div v-if="canvasCards.length" class="panel__selected">
          <div class="panel__section-title">Canvas ({{ canvasCards.length }})</div>
          <div v-for="e in canvasCards" :key="e.msg.id" class="panel__selected-item">
            <span class="panel__selected-type" @click="handleShowCardJSON(e.msg.id)">{{ e.msg.type }}</span>
            <button class="panel__selected-remove" @click="handleRemoveFromCanvas(e.msg.id)">×</button>
          </div>
        </div>

        <!-- 选中卡片的 JSON 数据 -->
        <div v-if="selectedCard" class="panel__json">
          <div class="panel__json-hd">
            <span>Card JSON</span>
            <span class="panel__json-tag">{{ selectedCard.type }}</span>
            <button class="panel__json-close" @click="selectedCard = null">×</button>
          </div>
          <pre class="panel__json-code">{{ JSON.stringify(selectedCard, null, 2) }}</pre>
        </div>

        <!-- 底部 -->
        <div class="panel__foot">
          <span v-if="entries.length">{{ canvasCards.length }} / {{ entries.length }} 张卡片</span>
          <span v-else>输入 Prompt 开始</span>
          <button v-if="entries.length" class="panel__clear" @click="handleClear">清空全部</button>
        </div>
      </aside>

      <!-- 右侧：对话 + 卡片展示 -->
      <main class="main">
        <!-- 筛选条 -->
        <div v-if="canvasCards.length" class="filter">
          <button v-for="k in filterKeys" :key="k"
            class="filter__btn" :class="{ 'filter__btn--on': filterType === k }"
            @click="filterType = k">{{ filterLabels[k] }}</button>
          <span class="filter__count">{{ filteredCanvasCards.length }} / {{ canvasCards.length }}</span>
        </div>

        <div class="main__scroll">
          <!-- 空状态 -->
          <div v-if="!chatHistory.length && !canvasCards.length" class="empty">
            <span class="empty__icon">◈</span>
            <h1 class="empty__title">Adaptive Card Engine</h1>
            <p class="empty__desc">数据驱动的动态卡片渲染引擎</p>
            <div class="onboard">
              <div class="onboard__step"><span class="onboard__num">01</span><span class="onboard__text">左侧输入 Prompt 描述需求</span></div>
              <div class="onboard__step"><span class="onboard__num">02</span><span class="onboard__text">AI 生成 2~6 张可交互卡片</span></div>
              <div class="onboard__step"><span class="onboard__num">03</span><span class="onboard__text">勾选需要的卡片进行组合</span></div>
              <div class="onboard__step"><span class="onboard__num">04</span><span class="onboard__text">点击卡片查看 JSON 数据模型</span></div>
            </div>
            <p class="empty__hint">试试快捷 Prompt 或点底部 "展示全部卡片类型"</p>
          </div>

          <!-- 对话 + 卡片流 -->
          <div v-else class="chat-view">
            <template v-for="m in chatHistory" :key="m.id">
              <!-- 用户消息 -->
              <div class="chat-msg chat-msg--user">
                <span class="chat-msg__avatar">U</span>
                <div class="chat-msg__bubble chat-msg__bubble--user">{{ m.content }}</div>
              </div>

              <!-- AI 消息 + 关联卡片 -->
              <div v-if="m.role === 'assistant'" class="chat-msg chat-msg--ai">
                <span class="chat-msg__avatar chat-msg__avatar--ai">AI</span>
                <div class="chat-msg__body">
                  <div v-if="m.content" class="chat-msg__bubble chat-msg__bubble--ai" v-html="m.content.replace(/\n/g, '<br>')" />

                  <!-- 该消息关联的卡片 -->
                  <TransitionGroup name="card" tag="div" class="chat-msg__cards">
                    <div
                      v-for="e in entries.filter(x => m.cardIds.includes(x.msg.id) && x.selected && x.status === 'complete')"
                      :key="e.msg.id"
                      class="stream__slot"
                      :class="{ 'stream__slot--active': selectedCard?.id === e.msg.id }"
                      @click="handleShowCardJSON(e.msg.id)"
                    >
                      <CardWrapper :status="e.status">
                        <TextCard v-if="e.msg.type === 'text'" :content="e.msg.data.content" />
                        <TodoCard v-else-if="e.msg.type === 'todo'" :todos="e.msg.data.todos" />
                        <ProgressCard v-else-if="e.msg.type === 'progress'" :title="e.msg.data.title" :percentage="e.msg.data.percentage" />
                        <ChartCard v-else-if="e.msg.type === 'chart'" :title="e.msg.data.title" :labels="e.msg.data.labels" :values="e.msg.data.values" />
                        <MetricCard v-else-if="e.msg.type === 'metric'" :title="e.msg.data.title" :metrics="e.msg.data.metrics" />
                        <ScheduleCard v-else-if="e.msg.type === 'schedule'" :title="e.msg.data.title" :items="e.msg.data.items" />
                        <ImageCard v-else-if="e.msg.type === 'image'" :title="e.msg.data.title" :image-url="e.msg.data.imageUrl" :caption="e.msg.data.caption" />
                        <CodeCard v-else-if="e.msg.type === 'code'" :title="e.msg.data.title" :code="e.msg.data.code" :language="e.msg.data.language" />
                        <ProfileCard v-else-if="e.msg.type === 'profile'" :name="e.msg.data.name" :role="e.msg.data.role" :bio="e.msg.data.bio" :avatar-url="e.msg.data.avatarUrl" :contact="e.msg.data.contact" />
                      </CardWrapper>
                    </div>
                  </TransitionGroup>
                </div>
              </div>
            </template>

            <!-- 无关联消息的独立卡片（旧数据兼容） -->
            <TransitionGroup v-if="filteredCanvasCards.filter(c => !chatHistory.some(m => m.cardIds.includes(c.msg.id))).length" name="card" tag="div" class="chat-msg__cards" style="padding-top:12px">
              <div
                v-for="e in filteredCanvasCards.filter(c => !chatHistory.some(m => m.cardIds.includes(c.msg.id)))"
                :key="e.msg.id"
                class="stream__slot"
                @click="handleShowCardJSON(e.msg.id)"
              >
                <CardWrapper :status="e.status">
                  <TextCard v-if="e.msg.type === 'text'" :content="e.msg.data.content" />
                  <TodoCard v-else-if="e.msg.type === 'todo'" :todos="e.msg.data.todos" />
                  <ProgressCard v-else-if="e.msg.type === 'progress'" :title="e.msg.data.title" :percentage="e.msg.data.percentage" />
                  <ChartCard v-else-if="e.msg.type === 'chart'" :title="e.msg.data.title" :labels="e.msg.data.labels" :values="e.msg.data.values" />
                  <MetricCard v-else-if="e.msg.type === 'metric'" :title="e.msg.data.title" :metrics="e.msg.data.metrics" />
                  <ScheduleCard v-else-if="e.msg.type === 'schedule'" :title="e.msg.data.title" :items="e.msg.data.items" />
                  <ImageCard v-else-if="e.msg.type === 'image'" :title="e.msg.data.title" :image-url="e.msg.data.imageUrl" :caption="e.msg.data.caption" />
                  <CodeCard v-else-if="e.msg.type === 'code'" :title="e.msg.data.title" :code="e.msg.data.code" :language="e.msg.data.language" />
                  <ProfileCard v-else-if="e.msg.type === 'profile'" :name="e.msg.data.name" :role="e.msg.data.role" :bio="e.msg.data.bio" :avatar-url="e.msg.data.avatarUrl" :contact="e.msg.data.contact" />
                </CardWrapper>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
:root, [data-theme="dark"] {
  --bg-page: #0f172a; --bg-card: #1e293b; --bg-input: #1e293b; --bg-hover: #334155;
  --text-primary: #f1f5f9; --text-secondary: #cbd5e1; --text-muted: #94a3b8;
  --text-hint: #64748b; --text-dim: #475569;
  --border: #1e293b; --border-light: #334155;
  --accent: #10b981; --accent-bg: rgba(16,185,129,0.08);
  --danger: #ef4444; --nav-bg: rgba(15,23,42,0.92);
}
[data-theme="light"] {
  --bg-page: #ffffff; --bg-card: #f8fafc; --bg-input: #f8fafc; --bg-hover: #f1f5f9;
  --text-primary: #0f172a; --text-secondary: #334155; --text-muted: #64748b;
  --text-hint: #94a3b8; --text-dim: #94a3b8;
  --border: #e2e8f0; --border-light: #e2e8f0;
  --accent: #059669; --accent-bg: rgba(5,150,105,0.06);
  --danger: #dc2626; --nav-bg: rgba(255,255,255,0.92);
}
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: var(--bg-page); color: var(--text-primary); }

.nav { display: flex; align-items: center; justify-content: space-between; height: 44px; padding: 0 20px; border-bottom: 1px solid var(--border); background: var(--nav-bg); backdrop-filter: blur(8px); flex-shrink: 0; }
.nav__left, .nav__right { display: flex; align-items: center; gap: 10px; }
.nav__logo { font-size: 18px; color: var(--accent); }
.nav__name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.nav__ver { font-size: 10px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
.nav__badge { font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; }
.nav__badge--ai { color: var(--accent); background: var(--accent-bg); }
.nav__badge--mock { color: var(--text-dim); background: var(--bg-hover); }
.nav__link { font-size: 12px; color: var(--text-muted); text-decoration: none; }
.nav__link:hover { color: var(--text-primary); }
.nav__theme { background: none; border: 1px solid var(--border-light); border-radius: 6px; color: var(--text-muted); cursor: pointer; font-size: 14px; padding: 3px 8px; }

.body { flex: 1; display: flex; overflow: hidden; }

.panel { width: 400px; min-width: 340px; display: flex; flex-direction: column; border-right: 1px solid var(--border); background: var(--bg-page); overflow: hidden; }
.panel__input { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.panel__area { width: 100%; padding: 10px 14px; background: var(--bg-input); border: 1px solid var(--border-light); border-radius: 8px; color: var(--text-primary); font-size: 13px; font-family: 'Inter', sans-serif; resize: none; outline: none; line-height: 1.5; }
.panel__area:focus { border-color: var(--accent); }
.panel__area::placeholder { color: var(--text-dim); }
.panel__send { padding: 8px 16px; border: 1px solid var(--accent); border-radius: 8px; background: transparent; color: var(--accent); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.panel__send:hover:not(:disabled) { background: var(--accent); color: var(--bg-page); }
.panel__send:disabled { opacity: 0.3; cursor: not-allowed; }

.panel__chips { padding: 0 16px 12px; display: flex; flex-wrap: wrap; gap: 6px; border-bottom: 1px solid var(--border); }
.panel__chip { padding: 5px 12px; border: 1px solid var(--border-light); border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.15s; }
.panel__chip:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }

.panel__msg { padding: 12px 16px; font-size: 13px; color: var(--text-secondary); line-height: 1.6; border-bottom: 1px solid var(--border); }

.panel__selected { flex: 1; overflow-y: auto; padding: 0 12px; }
.panel__section-title { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; padding: 10px 4px 6px; }
.panel__selected-item { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; margin-bottom: 3px; border-radius: 6px; background: var(--bg-card); font-size: 12px; }
.panel__selected-type { color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
.panel__selected-remove { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 14px; padding: 0 4px; }
.panel__selected-remove:hover { color: var(--danger); }

.panel__json { margin: 0 12px 12px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.panel__json-hd { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 11px; font-weight: 600; color: var(--text-dim); border-bottom: 1px solid var(--border); background: var(--bg-card); }
.panel__json-tag { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--accent); padding: 1px 6px; border-radius: 3px; background: var(--accent-bg); }
.panel__json-close { margin-left: auto; background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 14px; padding: 0 4px; }
.panel__json-close:hover { color: var(--text-primary); }
.panel__json-code { margin: 0; padding: 10px 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.5; color: var(--text-muted); max-height: 260px; overflow: auto; white-space: pre; }

.panel__foot { margin-top: auto; padding: 10px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-dim); flex-shrink: 0; }
.panel__clear { font-size: 11px; color: var(--text-muted); background: none; border: none; cursor: pointer; }
.panel__clear:hover { color: var(--danger); }

.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-page); }
.main__scroll { flex: 1; overflow-y: auto; padding: 24px 40px; }

.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; }
.empty__icon { font-size: 40px; color: var(--accent); opacity: 0.5; margin-bottom: 16px; }
.empty__title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.empty__desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
.empty__hint { margin-top: 24px; font-size: 12px; color: var(--text-hint); }

/* ========== 对话视图 ========== */
.chat-view { max-width: 720px; margin: 0 auto; padding-bottom: 40px; }

.chat-msg { display: flex; gap: 12px; margin-bottom: 20px; }

.chat-msg__avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
  background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border-light);
}

.chat-msg__avatar--ai { background: var(--accent-bg); color: var(--accent); border-color: var(--accent); }

.chat-msg--user { flex-direction: row-reverse; }
.chat-msg--user .chat-msg__bubble { margin-left: auto; }

.chat-msg__bubble {
  padding: 10px 16px; border-radius: 12px;
  font-size: 13px; line-height: 1.65; max-width: 85%;
}

.chat-msg__bubble--user {
  background: var(--accent); color: var(--bg-page);
  border-bottom-right-radius: 4px;
}

.chat-msg__bubble--ai {
  background: var(--bg-card); color: var(--text-secondary);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--border-light);
}

.chat-msg__body { flex: 1; min-width: 0; }

.chat-msg__cards {
  display: flex; flex-direction: column; gap: 12px; margin-top: 12px;
}

.onboard { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-width: 420px; }
.onboard__step { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); }
.onboard__num { font-size: 10px; font-weight: 700; color: var(--accent); padding: 3px 7px; border-radius: 4px; background: var(--accent-bg); font-family: 'JetBrains Mono', monospace; }
.onboard__text { font-size: 12px; color: var(--text-muted); }

.filter { display: flex; align-items: center; gap: 4px; padding: 8px 40px; border-bottom: 1px solid var(--border); background: var(--bg-card); flex-shrink: 0; overflow-x: auto; }
.filter__btn { padding: 3px 10px; border: 1px solid var(--border-light); border-radius: 6px; background: transparent; color: var(--text-dim); font-size: 11px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.filter__btn:hover { border-color: var(--accent); color: var(--accent); }
.filter__btn--on { background: var(--accent); border-color: var(--accent); color: var(--bg-page); font-weight: 600; }
.filter__count { margin-left: auto; font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--text-dim); white-space: nowrap; }

.stream { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; padding-bottom: 40px; }
.stream__slot { cursor: pointer; border-radius: 8px; transition: box-shadow 0.15s; }
.stream__slot--active { box-shadow: 0 0 0 2px var(--accent); }

.card-enter-active { transition: all 0.3s ease-out; }
.card-leave-active { transition: all 0.15s ease-in; }
.card-enter-from { opacity: 0; transform: translateY(8px); }
.card-leave-to { opacity: 0; }

@media (max-width: 860px) {
  .body { flex-direction: column; }
  .panel { width: 100%; min-width: 0; max-height: 45vh; border-right: none; border-bottom: 1px solid var(--border); }
  .main__scroll { padding: 16px; }
}
</style>
