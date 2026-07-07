import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'fs';
import { generateResponse } from './src/mock/engine';

// 手动解析 .env.local（无需 dotenv 依赖）
function loadEnvLocal() {
  const env: Record<string, string> = {};
  for (const file of ['.env', '.env.local']) {
    const p = path.resolve(__dirname, file);
    if (fs.existsSync(p)) {
      for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq > 0) env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
      }
    }
  }
  return env;
}

function apiPlugin(): Plugin {
  return {
    name: 'adaptive-card-api',
    configureServer(server) {
      // 启动时检测 .env.local
      const envVars = loadEnvLocal();
      const hasKey = ['GEMINI_API_KEY','DEEPSEEK_API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY']
        .some(k => envVars[k] && envVars[k].trim() && !envVars[k].startsWith('your_'));
      console.log(hasKey
        ? '  🟢 AI mode: API key detected — real AI responses enabled'
        : '  🟡 Mock mode: No API key found in .env.local — using offline simulation. Copy .env.example to .env.local and add your key.');
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/chat' || req.method !== 'POST') return next();

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = JSON.parse(Buffer.concat(chunks).toString());
          const prompt = body.prompt?.trim();
          if (!prompt) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'prompt is required' }));
          }

          // 尝试动态加载 AI 模块
          const aiResult = await tryAI(prompt);
          if (aiResult) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ...aiResult, source: 'ai' }));
          }

          // Mock fallback
          const mock = generateResponse(prompt);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ...mock, source: 'mock' }));
        } catch (e: any) {
          console.error('[API]', e.message);
          const mock = generateResponse('通用响应');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ...mock, source: 'mock' }));
        }
      });
    }
  };
}

async function tryAI(prompt: string): Promise<{ message: string; cards: any[] } | null> {
  // 直接读取 .env.local（无需 dotenv）
  const envVars = loadEnvLocal();
  const getKey = (k: string) => envVars[k] || process.env[k];

  const providers = [
    {
      name: 'gemini',
      key: getKey('GEMINI_API_KEY'),
      call: async () => {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: getKey('GEMINI_API_KEY')! });
        const r = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            maxOutputTokens: 4096
          }
        });
        return parseResponse(r.text || '{}');
      }
    },
    {
      name: 'deepseek',
      key: getKey('DEEPSEEK_API_KEY'),
      call: async () => {
        try {
          // 优先用 openai SDK
          const OpenAI = (await import('openai')).default;
          const c = new OpenAI({ apiKey: getKey('DEEPSEEK_API_KEY')!, baseURL: 'https://api.deepseek.com' });
          const r = await c.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT + '\nRespond ONLY with valid JSON.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
          });
          return parseResponse(r.choices[0]?.message?.content || '{}');
        } catch {
          // openai 包未安装，用原始 fetch
          const r = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getKey('DEEPSEEK_API_KEY')!}`
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: SYSTEM_PROMPT + '\nRespond ONLY with valid JSON.' },
                { role: 'user', content: prompt }
              ],
              response_format: { type: 'json_object' }
            })
          });
          const json: any = await r.json();
          return parseResponse(json.choices?.[0]?.message?.content || '{}');
        }
      }
    },
    {
      name: 'anthropic',
      key: getKey('ANTHROPIC_API_KEY'),
      call: async () => {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const c = new Anthropic({ apiKey: getKey('ANTHROPIC_API_KEY')! });
        const r = await c.messages.create({
          model: getKey('ANTHROPIC_MODEL') || 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          system: SYSTEM_PROMPT + '\nRespond ONLY with valid JSON. No markdown wrapping.',
          messages: [{ role: 'user', content: prompt }]
        });
        const text = r.content[0]?.type === 'text' ? r.content[0].text : '{}';
        return parseResponse(text);
      }
    },
    {
      name: 'openai',
      key: getKey('OPENAI_API_KEY'),
      call: async () => {
        const OpenAI = (await import('openai')).default;
        const c = new OpenAI({ apiKey: getKey('OPENAI_API_KEY')! });
        const r = await c.chat.completions.create({
          model: getKey('OPENAI_MODEL') || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + '\nRespond ONLY with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        });
        return parseResponse(r.choices[0]?.message?.content || '{}');
      }
    }
  ];

  for (const p of providers) {
    if (!p.key?.trim()) continue;
    try {
      console.log(`[AI] Trying ${p.name}...`);
      return await p.call();
    } catch (e: any) {
      console.warn(`[AI] ${p.name} failed:`, e.message?.slice(0, 80));
    }
  }

  return null;
}

function parseResponse(text: string): { message: string; cards: any[] } {
  try { return JSON.parse(text); } catch { /* */ }
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (m) return JSON.parse(m[1]);
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a > -1 && b > a) return JSON.parse(text.slice(a, b + 1));
  throw new Error('Invalid JSON');
}

const SYSTEM_PROMPT = `You are the Adaptive Card Engine. Interpret natural language prompts and synthesize structured adaptive UI card models. Always respond with valid JSON.

Available card types and their data schemas:

1. "text": { "content": "Markdown string, use ## ### headers, **bold**, - lists, > quotes" }
2. "todo": { "todos": [{ "id": "string", "content": "string", "done": false }] }
3. "chart": { "title": "string", "labels": ["string"], "values": [number] }
4. "metric": { "title": "string", "metrics": [{ "label": "string", "value": "string|number", "change": "string", "trend": "up|down|neutral" }] }
5. "progress": { "title": "string", "percentage": 0-100 }
6. "schedule": { "title": "string", "items": [{ "id": "string", "time": "09:00", "event": "string", "tag": "string" }] }
7. "image": { "imageUrl": "https://images.unsplash.com/...", "caption": "string" }
8. "code": { "code": "string", "language": "bash|typescript|json|..." }
9. "profile": { "name": "string", "role": "string", "bio": "string", "contact": { "github": "string" } }

Response format: { "message": "short markdown summary", "cards": [{ "id": "card_01", "type": "text", "data": {...} }, ...] }
Choose relevant types. Make data realistic. Generate 2-6 cards.`;

export default defineConfig({
  plugins: [vue(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue3-adaptive-card-engine': path.resolve(__dirname, '../../packages/core/src')
    }
  },
  server: {
    port: 5173
  }
});
