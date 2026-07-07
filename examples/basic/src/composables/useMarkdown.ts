/**
 * useMarkdown —— 将 Markdown 字符串解析为渲染块数组
 *
 * 支持语法：h1/h2/h3、**bold**、`inline code`、- 无序列表、> 引用、段落
 * 无外部依赖，纯运行时解析。
 *
 * @param md - Markdown 原始字符串
 * @returns 渲染块数组 [{ tag, text, children? }]
 */
export function useMarkdown(md: string) {
  const blocks: Array<{ tag: string; text: string; children?: string[] }> = [];
  if (!md) return { blocks, inline };

  const lines = md.split('\n');
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length) {
      blocks.push({ tag: 'ul', text: '', children: listItems });
      listItems = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line.startsWith('### ')) { flushList(); blocks.push({ tag: 'h3', text: line.slice(4) }); }
    else if (line.startsWith('## ')) { flushList(); blocks.push({ tag: 'h2', text: line.slice(3) }); }
    else if (line.startsWith('# ')) { flushList(); blocks.push({ tag: 'h1', text: line.slice(2) }); }
    else if (line.startsWith('> ')) { flushList(); blocks.push({ tag: 'bq', text: line.slice(2) }); }
    else if (line.startsWith('- ') || line.startsWith('* ')) { listItems.push(line.slice(2)); }
    else { flushList(); blocks.push({ tag: 'p', text: line }); }
  }
  flushList();

  return { blocks, inline };
}

/**
 * 内联解析：**bold** → <strong>, `code` → <code>
 */
export function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="il-code">$1</code>');
}
