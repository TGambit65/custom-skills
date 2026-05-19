#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const WORKDIR = path.resolve(process.env.MODEL_CLEANUP_APP_DIR || __dirname);
const CONFIG_PATH = process.env.OPENCLAW_CONFIG || '/home/thoder/.openclaw/openclaw.json';
const STATE_PATH = process.env.MODEL_CLEANUP_STATE || path.join(process.cwd(), 'review-state.json');
const PORT = Number(process.env.PORT || 8787);

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (err) { return fallback; }
}

function providerOf(modelId) {
  if (!modelId || !modelId.includes('/')) return 'openrouter';
  return modelId.split('/')[0];
}

function providerDisplay(provider) {
  const map = {
    anthropic: 'Anthropic', ollama: 'Ollama', minimax: 'MiniMax', 'minimax-cn': 'MiniMax CN',
    kimi: 'Kimi / Moonshot', zhipu: 'Zhipu', deepseek: 'DeepSeek', xai: 'xAI', mistral: 'Mistral',
    openrouter: 'OpenRouter', aegis: 'AEGIS router', 'github-copilot': 'GitHub Copilot',
    google: 'Google', opencode: 'OpenCode', 'openai-codex': 'OpenAI Codex'
  };
  return map[provider] || provider;
}

function inferModelName(modelId) {
  return modelId.split('/').slice(1).join('/').replace(/:latest$/, '').replace(/:cloud$/, ' cloud');
}

function inferBestAt(modelId, meta = {}) {
  const id = modelId.toLowerCase();
  const provider = providerOf(modelId);
  if (id.includes('opus')) return 'Highest-quality reasoning, architecture, reviews, and nuanced judgment when cost/limits are acceptable.';
  if (id.includes('sonnet')) return 'Balanced high-quality coding, analysis, and execution with strong reliability.';
  if (id.includes('haiku')) return 'Fast, cheaper Anthropic tasks: triage, rewriting, extraction, and lightweight support.';
  if (provider === 'openai-codex') return 'Agentic coding, repo edits, implementation loops, and terminal-backed software work.';
  if (provider === 'github-copilot') return 'Subscription-backed coding assistance and GitHub-flavored implementation tasks.';
  if (provider === 'aegis') {
    if (id.endsWith('/trusted')) return 'Sensitivity-aware routing restricted to trusted providers.';
    if (id.endsWith('/cheap')) return 'Low-cost sanitized work where best-effort quality is enough.';
    return 'Automatic cost/sensitivity routing across approved models.';
  }
  if (id.includes('deep-research') || id.includes('research')) return 'Deep web/research synthesis with broad source exploration.';
  if (id.includes('seed') || id.includes('video')) return 'Fast multimodal/video scan and visual summarization.';
  if (id.includes('grok-code') || id.includes('codestral') || id.includes('devstral') || id.includes('coder') || id.includes('codellama')) return 'Code generation, patching, and developer workflow tasks.';
  if (id.includes('reasoner') || id.includes('magistral') || id.includes('h1r')) return 'Structured reasoning, multi-step problem solving, and careful analysis.';
  if (id.includes('gemini')) {
    if (id.includes('flash') || id.includes('lite')) return 'Fast multimodal/general tasks with good cost-speed tradeoff.';
    return 'Large-context multimodal reasoning and document/image analysis.';
  }
  if (id.includes('llama') || id.includes('mistral-small') || id.includes('ministral') || id.includes('gemma') || id.includes('phi') || id.includes('nano') || id.includes('free')) return 'Cheap or local/general-purpose drafting, classification, and low-risk batch work.';
  if (id.includes('pixtral')) return 'Vision-language analysis and image-grounded reasoning.';
  if (provider === 'ollama') return 'Local or cloud-routed low-friction experiments and privacy-sensitive lightweight work.';
  if (provider === 'openrouter') return 'Provider-diverse fallback/testing, opportunistic routing, and model discovery.';
  if (provider === 'mistral') return 'European-hosted general reasoning, code, and structured writing.';
  if (provider === 'deepseek') return 'Cost-effective coding, reasoning, and technical analysis when trust tier permits.';
  if (provider === 'kimi') return 'Long-context coding and document-heavy technical analysis.';
  if (provider === 'minimax' || provider === 'minimax-cn') return 'Long-context general work, extraction, and fast high-volume drafting.';
  if (provider === 'zhipu') return 'General multimodal reasoning and alternative-provider comparison.';
  if (provider === 'xai') return 'Fast direct answers, code iteration, and current-style reasoning checks.';
  return 'General-purpose assistant work, evaluation, and fallback coverage.';
}

function inferUseCases(modelId) {
  const id = modelId.toLowerCase();
  const provider = providerOf(modelId);
  if (id.includes('opus')) return ['Review architecture before config changes', 'Write high-stakes synthesis or strategy docs', 'Run adversarial review of a complex plan'];
  if (id.includes('sonnet')) return ['Implement medium-sized code changes', 'Summarize and refactor project documents', 'Debug failing tests with strong judgment'];
  if (id.includes('haiku')) return ['Classify inbox/tasks quickly', 'Rewrite short messages', 'Extract structured fields from text'];
  if (provider === 'openai-codex') return ['Patch a repo with tests', 'Build a small tool from a spec', 'Investigate terminal errors end-to-end'];
  if (provider === 'github-copilot') return ['Generate code from GitHub context', 'Refactor a function with tests', 'Explain a PR diff'];
  if (provider === 'aegis') return ['Route routine asks by sensitivity', 'Sanitize low-risk prompts before cheap routing', 'Compare trusted-only vs cheap outputs'];
  if (id.includes('deep-research') || id.includes('research')) return ['Prepare a research dossier', 'Compare vendor claims across sources', 'Find citations for a market scan'];
  if (id.includes('seed') || id.includes('video')) return ['Summarize video frames', 'Screen multimodal content quickly', 'Extract visual evidence for a report'];
  if (id.includes('grok-code') || id.includes('codestral') || id.includes('devstral') || id.includes('coder') || id.includes('codellama')) return ['Generate a patch from a failing test', 'Draft TypeScript/Python utilities', 'Review code for obvious defects'];
  if (id.includes('reasoner') || id.includes('magistral') || id.includes('h1r')) return ['Solve a multi-step technical puzzle', 'Evaluate tradeoffs in a design', 'Check a plan for hidden assumptions'];
  if (id.includes('gemini')) return ['Analyze screenshots or images', 'Summarize long documents', 'Draft broad multimodal answers'];
  if (id.includes('pixtral')) return ['Inspect image-heavy docs', 'Describe UI screenshots', 'Extract visual facts into notes'];
  if (provider === 'ollama') return ['Run local/private lightweight drafting', 'Batch classify low-risk text', 'Experiment without external API spend'];
  if (provider === 'openrouter') return ['Try alternate frontier/free models', 'Fill temporary provider gaps', 'Benchmark output quality cheaply'];
  if (provider === 'mistral') return ['Draft structured business docs', 'Generate or review code', 'Handle EU-provider comparison tasks'];
  if (provider === 'deepseek') return ['Analyze code cheaply', 'Draft technical plans', 'Run non-sensitive reasoning passes'];
  if (provider === 'kimi') return ['Work over long code/document context', 'Analyze big specs', 'Generate implementation plans'];
  if (provider === 'minimax' || provider === 'minimax-cn') return ['Summarize very long input', 'Draft high-volume content', 'Extract structured notes'];
  if (provider === 'zhipu') return ['Compare Chinese-provider outputs', 'Analyze image plus text prompts', 'Draft alternate reasoning pass'];
  if (provider === 'xai') return ['Fast code Q&A', 'Generate concise alternatives', 'Run quick sanity checks'];
  return ['Handle fallback assistant tasks', 'Compare quality against preferred models', 'Run low-risk drafting or summarization'];
}

function catalogMeta(config) {
  const out = new Map();
  const providers = config.models?.providers || {};
  for (const [provider, pdata] of Object.entries(providers)) {
    for (const m of (pdata.models || [])) {
      const rawId = String(m.id || '');
      const fullId = rawId.includes('/') ? (rawId.startsWith(provider + '/') ? rawId : `${provider}/${rawId}`) : `${provider}/${rawId}`;
      out.set(fullId, {...m, provider});
      if (provider === 'openrouter' && rawId === 'hunter-alpha') out.set('hunter-alpha', {...m, provider});
      if (provider === 'openrouter' && rawId === 'auto') out.set('openrouter/auto', {...m, provider});
    }
  }
  return out;
}

function buildModels() {
  const config = readJson(CONFIG_PATH, {});
  const defaults = config.agents?.defaults || {};
  const primary = defaults.model?.primary || '';
  const fallbacks = defaults.model?.fallbacks || [];
  const modelMap = defaults.models || {};
  const providerMeta = catalogMeta(config);
  const ids = [];
  for (const id of [primary, ...fallbacks, ...Object.keys(modelMap)]) if (id && !ids.includes(id)) ids.push(id);
  return {
    generatedAt: new Date().toISOString(),
    configPath: CONFIG_PATH,
    currentUse: primary ? [primary] : [],
    currentFailover: fallbacks,
    models: ids.map((id, index) => {
      const provider = providerOf(id);
      const meta = providerMeta.get(id) || providerMeta.get(id.replace(/^openrouter\/openrouter\//, 'openrouter/')) || {};
      return {
        id,
        index,
        provider,
        providerDisplay: providerDisplay(provider),
        alias: modelMap[id]?.alias || '',
        name: meta.name || inferModelName(id),
        bestAt: inferBestAt(id, meta),
        useCases: inferUseCases(id),
        currentRole: id === primary ? 'use' : (fallbacks.includes(id) ? 'failover' : 'catalog'),
        contextWindow: meta.contextWindow || null,
        maxTokens: meta.maxTokens || null,
        reasoning: typeof meta.reasoning === 'boolean' ? meta.reasoning : null,
        input: meta.input || []
      };
    })
  };
}

function send(res, status, body, type='text/html; charset=utf-8') {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store'});
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 5_000_000) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const html = fs.readFileSync(path.join(WORKDIR, 'index.html'), 'utf8');

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  try {
    if (req.method === 'GET' && parsed.pathname === '/') return send(res, 200, html);
    if (req.method === 'GET' && parsed.pathname === '/api/models') return send(res, 200, JSON.stringify(buildModels()), 'application/json; charset=utf-8');
    if (req.method === 'GET' && parsed.pathname === '/api/state') return send(res, 200, JSON.stringify(readJson(STATE_PATH, {saved: false})), 'application/json; charset=utf-8');
    if (req.method === 'POST' && parsed.pathname === '/api/state') {
      const payload = JSON.parse(await readBody(req));
      const snapshot = {saved: true, savedAt: new Date().toISOString(), statePath: STATE_PATH, ...payload};
      fs.mkdirSync(path.dirname(STATE_PATH), {recursive: true});
      fs.writeFileSync(STATE_PATH, JSON.stringify(snapshot, null, 2));
      return send(res, 200, JSON.stringify({ok: true, statePath: STATE_PATH, savedAt: snapshot.savedAt}), 'application/json; charset=utf-8');
    }
    return send(res, 404, 'not found', 'text/plain; charset=utf-8');
  } catch (err) {
    return send(res, 500, JSON.stringify({ok:false, error: String(err.stack || err)}), 'application/json; charset=utf-8');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Model cleanup app listening at http://127.0.0.1:${PORT}/`);
  console.log(`State saves to ${STATE_PATH}`);
});
