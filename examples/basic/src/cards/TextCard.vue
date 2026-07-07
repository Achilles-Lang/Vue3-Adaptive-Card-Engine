<script setup lang="ts">
/**
 * 文本卡片 —— 支持 Markdown 渲染
 */
import { computed } from 'vue';
import { useMarkdown, inline } from '../composables/useMarkdown';

const props = defineProps<{ content: string }>();

const { blocks } = computed(() => useMarkdown(props.content)).value;
</script>

<template>
  <div class="ace-card ace-card--text">
    <template v-for="(block, i) in blocks" :key="i">
      <h1 v-if="block.tag === 'h1'" class="md-h1" v-html="inline(block.text)" />
      <h2 v-else-if="block.tag === 'h2'" class="md-h2" v-html="inline(block.text)" />
      <h3 v-else-if="block.tag === 'h3'" class="md-h3" v-html="inline(block.text)" />
      <blockquote v-else-if="block.tag === 'bq'" class="md-bq" v-html="inline(block.text)" />
      <ul v-else-if="block.tag === 'ul'" class="md-ul">
        <li v-for="(item, j) in block.children" :key="j" v-html="inline(item)" />
      </ul>
      <p v-else class="md-p" v-html="inline(block.text)" />
    </template>

    <p v-if="!rendered.length" class="md-p">{{ content }}</p>
  </div>
</template>

<style scoped>
.ace-card--text {
  padding: 18px 22px;
  background: var(--bg-card);
  border-radius: 8px;
}

.md-h1 { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 14px 0 8px; line-height: 1.35; }
.md-h2 { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 12px 0 6px; line-height: 1.4; padding-bottom: 6px; border-bottom: 1px solid var(--border-light); }
.md-h3 { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 10px 0 4px; line-height: 1.45; }

.md-p { margin: 0 0 10px; font-size: 14px; line-height: 1.7; color: var(--text-secondary); }
.md-p:last-child { margin-bottom: 0; }

.md-bq {
  margin: 8px 0;
  padding: 4px 0 4px 12px;
  border-left: 2px solid var(--accent);
  color: var(--text-muted);
  font-size: 13px;
  font-style: italic;
  line-height: 1.6;
}

.md-ul {
  margin: 6px 0;
  padding-left: 18px;
  list-style: disc;
  color: var(--text-secondary);
}

.md-ul li {
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 2px;
}

:deep(strong) { font-weight: 600; color: var(--text-primary); }

:deep(.il-code) {
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--bg-hover);
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
}
</style>
