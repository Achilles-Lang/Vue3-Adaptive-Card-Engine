# 🤖 Vue3-Adaptive-Card-Engine · AI Agent 开发手册

> **适用对象**：Workbuddy / Cursor / Claude Dev / GitHub Copilot Workspace  
> **适配模型**：DeepSeek V4 Pro 及同等代码能力模型  
> **开发模式**：计划驱动（Plan-and-Solve）+ 单步验证 + 严格 TDD  
> **最终产物**：Monorepo 架构（可发布 NPM 核心包 + 可运行示例）+ 双分支 GitHub 模板项目  
> **版本修正说明**：已修复 TypeScript 泛型闭合问题、统一包引用路径、补全 Vitest 别名配置、明确 Template 分支同步策略、新增批量注册 API

---

## 📜 第一章：全局系统规则（`.workbuddy-rules.md`）

**请将以下内容写入项目根目录 `.workbuddy-rules.md`，作为全局约束永久生效：**

```markdown
# 项目开发全局规则
## 1. 技术栈（不可变更）
- 包管理: pnpm workspace 模式
- 框架: Vue 3.4+ (Composition API, `<script setup>` 语法糖)
- 语言: TypeScript 5.4+ (严格模式, 禁止非必要 `any`)
- 构建: Vite 5+ (核心包使用 Library 模式)
- 测试: Vitest + @vue/test-utils + jsdom
- 样式: 原生CSS，支持 CSS Variables 主题，类名采用 BEM 命名法，前缀统一为 `ace-`

## 2. 架构原则（红线约束）
- 数据驱动：界面完全由 JSON 数据决定，前端无硬编码 UI 判断
- 开闭原则：对扩展开放（注册新卡片），对修改封闭（核心引擎代码不可因新增卡片而修改）
- 单一职责：卡片组件只负责 UI 与内部交互，核心引擎只负责分发与渲染
- 核心隔离：`packages/core` 内禁止包含任何业务卡片组件，只保留引擎逻辑与通用能力
- **包名一致性**：核心包发布名为 `vue3-adaptive-card-engine`，示例项目通过 `workspace:*` 联调，严禁使用临时别名（如 `@ace/core`）作为最终导入路径

## 3. 编码规范
- 所有组件 Props 必须使用 `defineProps<T>()` 泛型定义
- 所有导出的函数、接口、类型必须附带 JSDoc 注释
- 根目录安装公共依赖必须使用 `-w` 参数；子包安装依赖必须指定 `--filter <包名>`
- 所有文件末尾保留空行，导入语句按「外部依赖 → 内部模块 → 样式」顺序排列

## 4. 目录硬规则
- 核心源码: `packages/core/src/`（NPM 发布主体）
- 示例模板: `examples/basic/src/`（开箱即用的演示项目）
- 所有子包必须独立拥有 `package.json` 与 `tsconfig.json`
- 测试文件统一存放于对应包的 `__tests__` 目录
```

---

## 🗂️ 第二章：项目骨架初始化

### Prompt 1：初始化 Monorepo 骨架

```plaintext
请在当前目录下按以下要求初始化 pnpm Monorepo 项目：
1. 创建 `pnpm-workspace.yaml`，配置工作区为 `packages/*` 和 `examples/*`
2. 创建两个子目录：`packages/core` 和 `examples/basic`
3. 生成根目录 `package.json`，配置脚本：
   - "dev": "pnpm --filter basic dev"
   - "build": "pnpm -r build"
   - "test": "pnpm -r test"
   - "type-check": "pnpm -r exec tsc --noEmit"
4. 根目录安装公共开发依赖（使用 -Dw 参数）：vue、typescript、vite、vitest、@vue/test-utils、jsdom、vite-plugin-dts
5. 生成根目录 `tsconfig.base.json`，开启严格模式、禁用隐式 any，作为子包的公共配置
6. 分别为 `packages/core` 和 `examples/basic` 生成独立的 `package.json` 和 `tsconfig.json`，子包 tsconfig 继承根目录基础配置
7. 在 `examples/basic/package.json` 中添加核心包依赖：`"vue3-adaptive-card-engine": "workspace:*"`（用于本地联调）
8. 生成 `.gitignore` 文件，覆盖 node_modules、dist、.vscode 等常规忽略项
```

### ✅ 本步验证命令
```bash
pnpm install
pnpm type-check
```
无报错即为通过。

---

## 🧠 第三章：核心引擎实现（packages/core）

> **执行方式**：按 Phase 顺序逐条执行，每完成一个 Phase 立即执行对应验证命令

### Phase 1：数据契约层（Types）—— 泛型扩展修复

#### Prompt 2：定义支持无限扩展的类型系统

```plaintext
在 `packages/core/src/types.ts` 中实现以下类型定义：
1. 定义基础卡片类型为泛型字符串 `type CardType = string`，仅导出内置常量 `BUILTIN_TYPES` 作为参考（'text' | 'todo' | 'progress' | 'chart'），不将其作为硬约束
2. 分别定义各卡片对应的数据接口：`TextCardData`、`TodoCardData`、`ProgressCardData`、`ChartCardData`，字段定义如下：
   - TextCardData: { content: string }
   - TodoCardData: { todos: { id: string; content: string; done?: boolean }[] }
   - ProgressCardData: { title: string; percentage: number }
   - ChartCardData: { title: string; labels: string[]; values: number[] }
3. 定义通用 `CardMessage` 泛型接口，支持任意类型扩展：
   ```typescript
   export interface CardMessage<T extends string = string, D = any> {
     id: string | number;
     role: 'user' | 'assistant';
     type: T;
     data: D;
   }
```
4. 导出类型守卫 `isBuiltinType`，用于判断是否为内置卡片，方便用户自行处理降级逻辑
5. 导出所有类型定义，附带完整 JSDoc 注释

要求：全程不使用 any 作为类型逃逸（仅作为泛型默认占位），确保 `switch` 语句在具体分支中能正确窄化类型。
```

#### ✅ 本步验证
```bash
pnpm --filter core exec tsc --noEmit
```

---

### Phase 2：卡片注册中心与属性解析（含批量注册 API）

#### Prompt 3：实现注册机制、映射表与批量注册

```plaintext
在 `packages/core/src/registry.ts` 中实现卡片注册核心逻辑：
1. 定义内部状态：维护两个 Map，分别存储「类型 → 组件」映射、「类型 → 属性解析函数」映射
2. 实现 `registerCard` 高阶函数，接收三个参数：type(字符串)、component(Vue组件)、propsResolver(可选，函数)，功能为向映射表中注册对应关系，支持覆盖已有类型
3. 实现 **批量注册函数 `registerCards`**，接收数组参数 `{ type; component; resolve?: ResolverFn }[]`，内部循环调用 `registerCard`，显著减少用户样板代码
4. 实现 `getCardComponent` 函数，根据 type 返回对应组件，无匹配时返回 null
5. 实现 `resolveCardProps` 函数，接收完整 message 对象，根据 type 调用对应解析函数，返回 props 对象；若未注册解析函数则默认返回完整 data（适用大部分场景）
6. 实现 `clearRegistry` 函数，用于清空所有注册（测试用）
7. 导出所有函数，默认映射表为空，不内置任何业务卡片

要求：附带完整 JSDoc 注释，类型安全，不使用 any，函数签名需兼容泛型消息类型。
```

#### ✅ 本步验证
```bash
pnpm --filter core exec tsc --noEmit
```

---

### Phase 3：核心渲染组件 + 兜底组件

#### Prompt 4：实现 CardEngine 渲染引擎

```plaintext
实现两个 Vue 组件：

1. 兜底组件 `packages/core/src/FallbackCard.vue`
   - 接收可选 prop: `type?: string`
   - 渲染灰色提示卡片，显示「不支持的卡片类型：xxx」
   - 样式使用 ace-fallback-card 前缀的 BEM 命名

2. 核心渲染组件 `packages/core/src/CardEngine.vue`
   - Props 定义：
     - messages: CardMessage[]（必填，消息数组）
     - fallback?: Component（可选，自定义兜底组件，默认使用内置 FallbackCard）
   - 逻辑实现：
     - 遍历 messages 数组，根据每条消息的 type 从注册中心获取对应组件
     - 调用 resolveCardProps 解析出组件需要的 props
     - 无匹配组件时渲染兜底组件，并传入当前 type
   - 模板实现：
     - 使用 `<component v-for>` 动态渲染，绑定 :key 为消息 id
     - 通过 v-bind 透传解析后的 props
   - 要求：使用 `<script setup lang="ts">`，类型严格，无 any，根容器类名为 ace-card-engine
```

#### ✅ 本步验证
```bash
pnpm --filter core exec tsc --noEmit
```

---

### Phase 4：包入口文件

#### Prompt 5：统一导出

```plaintext
在 `packages/core/src/index.ts` 中统一导出所有公共能力：
- CardEngine 组件
- FallbackCard 组件
- registerCard、registerCards、getCardComponent、resolveCardProps、clearRegistry 函数
- 所有 types 类型定义（含 CardMessage、CardType 等）

要求：使用具名导出，附带导出项的整体说明注释
```

#### ✅ 本步验证
```bash
pnpm --filter core exec tsc --noEmit
```

---

## 🎨 第四章：业务卡片组件实现（examples/basic）

### Prompt 6：编写 4 个默认卡片

```plaintext
在 `examples/basic/src/cards/` 目录下创建 4 个卡片组件，全部使用 `<script setup lang="ts">`，严格定义 Props，样式使用 ace- 前缀 BEM 命名：

1. `TextCard.vue`
   - Props: { content: string }
   - 渲染为段落文本，支持换行

2. `TodoCard.vue`
   - Props: { todos: { id: string; content: string; done?: boolean }[] }
   - 渲染待办列表，每项带复选框，v-model 绑定完成状态（仅前端交互）

3. `ProgressCard.vue`
   - Props: { title: string; percentage: number }
   - 渲染标题 + 进度条，进度条使用渐变填充，百分比数值显示在右侧

4. `ChartCard.vue`
   - Props: { title: string; labels: string[]; values: number[] }
   - 使用纯 div 实现横向柱状图，按比例展示数值对比
```

#### ✅ 本步验证
```bash
pnpm --filter basic exec tsc --noEmit
```

---

## 🏗️ 第五章：示例项目联调与运行（统一包名修正）

### Prompt 7：完成示例应用闭环（使用正式包名）

```plaintext
完成 examples/basic 项目的运行配置与业务联调：

1. 在 `examples/basic/src/main.ts` 中：
   - **必须使用正式包名**：`import { registerCards, CardEngine } from 'vue3-adaptive-card-engine'`（严禁使用 @ace/core 等临时别名）
   - 导入 4 个卡片组件
   - 调用 `registerCards` 批量注册：传入 `[{ type: 'text', component: TextCard }, { type: 'todo', component: TodoCard }, ...]`（因为 data 直接作为 props，无需额外 resolve）
   - 挂载 App 组件

2. 在 `examples/basic/src/App.vue` 中：
   - 导入 CardEngine 组件
   - 使用 ref 定义 messages 数组，填入 4 条模拟数据（text/todo/progress/chart 各一条）
   - 模板中使用 `<CardEngine :messages="messages" />` 渲染
   - 页面基础布局居中，宽度限制在 800px 以内

3. 配置 `examples/basic/vite.config.ts`：
   - 设置端口 5173
   - 配置路径别名 `@` 指向 src
   - **关键配置**：为了本地联调，将 `vue3-adaptive-card-engine` 别名指向 `packages/core/src`，确保开发时实时更新：
     ```typescript
     resolve: {
       alias: {
         '@': path.resolve(__dirname, 'src'),
         'vue3-adaptive-card-engine': path.resolve(__dirname, '../../packages/core/src')
       }
     }
```
```

#### ✅ 本步验证
```bash
pnpm dev
```
浏览器访问后能正常显示 4 种不同卡片，Todo 勾选交互正常即为通过。

---

## 📦 第六章：NPM 库构建配置

### Prompt 8：配置核心包库模式构建

```plaintext
完成 packages/core 的 NPM 发布构建配置：

1. 安装 `vite-plugin-dts` 到核心包开发依赖
2. 创建 `packages/core/vite.config.ts`：
   - 开启 Vite Library 模式，入口为 `src/index.ts`
   - 输出格式：es + umd，库名 AdaptiveCardEngine
   - 外部化 vue（external）
   - 配置 vite-plugin-dts 插件，自动生成类型声明文件
3. 更新 `packages/core/package.json`：
   - name 设为 `vue3-adaptive-card-engine`
   - version 设为 `1.0.0`
   - 配置 main、module、types 字段指向对应构建产物
   - 新增 exports 字段，兼容 ESM 与 CommonJS 引入
   - 添加 peerDependencies，声明 vue >=3.4.0
   - 添加 sideEffects: false 支持树摇
   - 脚本新增 "build": "vite build"、"test": "vitest run"
```

#### ✅ 本步验证
```bash
pnpm --filter core build
```
检查 `packages/core/dist` 目录，包含 `.es.js`、`.umd.js`、`.d.ts` 三类文件即为通过。

---

## 🧪 第七章：单元测试与验证（Vitest 别名修复）

### Prompt 9：编写核心引擎单元测试（配置联调别名）

```plaintext
在 `packages/core/__tests__/` 目录下编写测试用例，使用 Vitest + @vue/test-utils：

1. 新建 `vitest.config.ts` 放在 `packages/core/` 下：
   - 配置 `environment: 'jsdom'`
   - **关键修复**：配置 resolve.alias，将 `vue3-adaptive-card-engine` 指向 `src/index.ts`，确保测试文件中使用正式包名的导入也能正确解析
   ```typescript
   import path from 'path';
   export default {
     test: {
       environment: 'jsdom',
       alias: {
         'vue3-adaptive-card-engine': path.resolve(__dirname, 'src/index.ts')
       }
     }
   };
```

2. 新建 `registry.spec.ts`：
   - 测试 registerCard 可以正常注册组件
   - 测试 registerCards 能批量注册
   - 测试重复注册会覆盖原有组件
   - 测试 resolveCardProps 能正确调用解析函数返回 props
   - 测试 clearRegistry 可以清空映射

3. 新建 `engine.spec.ts`：
   - 测试 CardEngine 能根据 type 正确渲染对应 Mock 组件
   - 测试未知 type 时渲染兜底组件
   - 测试 props 能正确透传给子组件

4. 确保 `package.json` 中 test 脚本可用
```

#### ✅ 本步验证
```bash
pnpm --filter core test
```
所有测试用例全部通过即为通过。

---

## 🌐 第八章：GitHub 仓库配置与 CI/CD（双分支策略细化）

### Prompt 10：自动化、模板配置与分支同步

```plaintext
完成 GitHub 仓库的标准化配置：

1. CI 工作流 `.github/workflows/ci.yml`
   - 触发条件：push 到 main 分支、PR 到 main 分支
   - 步骤：设置 Node 20 + pnpm 9 → 安装依赖 → 执行类型检查 → 执行测试 → 执行构建
   - 开启 pnpm 缓存优化速度

2. 发布工作流 `.github/workflows/release.yml`
   - 触发条件：推送 v* 标签（如 v1.0.0）
   - 步骤：设置 Node + pnpm → 安装依赖 → 构建 → 自动发布到 npm（读取 NPM_TOKEN 秘钥）

3. **双分支模板策略细化（解决骨架冲突）**：
   - **main 分支**：保留完整 Monorepo（packages/ + examples/），用于迭代开发与 NPM 发布。
   - **template 分支**：纯消费者项目，删除 `packages/` 目录，仅保留 `examples/basic` 并将其重命名为 `src/`。将 `package.json` 中的 `"vue3-adaptive-card-engine": "workspace:*"` 替换为 `"vue3-adaptive-card-engine": "^1.0.0"`。该分支专门用于 GitHub 的 "Use this template"。
   - 在根目录添加 `scripts/sync-template.sh`，用于每次发版后自动从 `examples/basic` 同步文件到 `template` 分支。

4. README.md 标准结构
   - 顶部：项目名称、一句话简介、核心特性徽章
   - 架构图：使用 Mermaid 绘制「数据 → 注册中心 → 卡片组件」的渲染流程
   - 快速开始：分「NPM 安装使用」和「一键使用模板」两种方式
   - 使用教程：展示 `registerCards` 批量注册的极简 3 步示例
   - 适用场景：AI 对话、仪表盘、低代码、消息中心等
   - API 文档：核心 API 简要说明
   - License: MIT

5. 仓库设置中开启 **Template repository** 选项。
```

---

## ✅ 第九章：最终验收检查清单

> 全部打勾即为项目开发完成，可正式发布

- **Monorepo 结构**：根目录存在 `pnpm-workspace.yaml`，packages 与 examples 目录完整
- **核心隔离**：`packages/core` 内无任何业务卡片组件，仅包含引擎、注册中心、兜底组件
- **开闭原则验证**：新增卡片仅需调用 `registerCards`，无需修改 core 包任何代码
- **类型安全**：全局执行 `pnpm type-check` 无报错，泛型接口支持任意自定义类型
- **路径规范**：示例项目导入使用统一包名 `vue3-adaptive-card-engine`，无临时别名
- **示例可运行**：`pnpm dev` 启动后正常渲染 4 种卡片，Todo 交互正常
- **构建产物**：core 包 dist 目录包含 es、umd、d.ts 三类文件
- **测试通过**：所有单元测试执行通过，Vitest 能正确解析包别名
- **CI 正常**：推送代码后 GitHub Actions 流水线执行成功
- **模板可用**：template 分支结构精简，可通过「Use this template」一键生成新项目
- **文档完整**：README 清晰易懂，包含快速开始、使用示例、API 说明

---

## 💡 第十章：Workbuddy 执行最佳实践

1. **规则前置**：先创建 `.workbuddy-rules.md` 再开始开发，确保所有生成的代码都符合规范
2. **单步执行**：严格按 Phase 逐条发送 Prompt，不要一次性发送全量内容，避免上下文溢出
3. **错误闭环**：每一步执行完立即跑验证命令，若报错直接将错误日志粘贴回对话，让 AI 自行修复后再进入下一步
4. **粒度控制**：若某一步代码量较大（如 4 个卡片），可拆成多条指令逐个实现，降低出错概率
5. **最终回归**：全部完成后，对照第九章验收清单逐项核验，确保无遗漏项
