// seoul/visuals.js — оркестратор визуала «Сеула» (Развилка B1, plan-review Codex).
//
// КЛОН паттерна src/visuals/index.js, а НЕ переиспользование: общий оркестратор
// импортирует старый STATES, краснит только ALERT/LOCKED, считает сканом только
// «SCAN*» и всегда зовёт glitch — id «Сеула» (PROCESSING_*/VERDICT_3/FINAL) там не
// работают, и мутировать его НЕЛЬЗЯ (ролик №1 + спутник). Поэтому свой оркестратор
// со своим маппингом состояние→env, переиспользующий STATE-AGNOSTIC слой-модули
// ../visuals/{core,rings,scanlines,particles,background} (все потребляют env).
//
// Закон «Сеула» (screen.md §1/§2/§8): экран НЕ паникует — эскалация холодом, не
// цветом. Поэтому на canvas:
//   - accent ВСЕГДА cyan (--accent) — красный НИКОГДА не заливает ядро/частицы;
//   - isAlert ВСЕГДА false — нет тряски ядра, scanlines белые, частицы без джиттера;
//   - glitch НЕ подключён — экран ни разу не «рвётся»;
//   - isScan = PROCESSING_* → ядро ускоряется, кольца рисуются, частицы стягиваются.
// Красный живёт ТОЛЬКО в DOM (plan-review Codex finding #4: #viz лежит НИЖЕ #scene,
// красным на canvas финальный текст не закрыть): строка ROLLBACK кадра 10 (--alert)
// и overlay #seoul-shutter кадра 13 (красный вдох→чёрный) — оба в seoul.html, не тут.

import { makePRNG, createCore } from '../visuals/core.js';
import { makeParticleField, createParticles } from '../visuals/particles.js';
import { createScanlines } from '../visuals/scanlines.js';
import { createRings } from '../visuals/rings.js';
import { createBackground } from '../visuals/background.js';

import { STATES } from './machine.js';

const SAMPLE_DRAWS = 8;
const SAMPLE_PARTICLES = 6;
const round6 = (n) => Math.round(n * 1e6) / 1e6;

const DEFAULT_CYAN = '#58DDE3'; // зеркало --accent (index.html); рантайм читает из CSS

// Состояния «обработки» — аналог скана ролика №1 для слоёв (ядро/кольца/частицы).
const PROCESSING_STATES = new Set([
  STATES.PROCESSING_1, STATES.PROCESSING_2, STATES.PROCESSING_3,
]);

function hexToRgb(hex) {
  const m = String(hex).replace('#', '').trim();
  const n = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const i = parseInt(n, 16);
  if (!Number.isFinite(i)) return [88, 221, 227];
  return [(i >> 16) & 255, (i >> 8) & 255, i & 255];
}

/**
 * createVisuals — смонтировать canvas-слой «Сеула» и подписать на машину.
 * Контракт env/детерминизма зеркалит src/visuals/index.js (reseed на входе:
 * vt→0, PRNG/поле частиц пересобираются от фикс-сида → дубли визуально повторяются).
 * @param {object}  opts.machine — машина (getState/getScanProgress/subscribe).
 * @param {object}  opts.config  — seoul/config.js (PRNG_SEED, PARTICLE_LIMIT, SCAN_TIMELINE).
 * @param {Element} [opts.canvas]— #viz. Без него рендер — no-op.
 * @param {Element} [opts.root]  — корень для --scene-accent (default <html>).
 */
export function createVisuals(opts) {
  const machine = opts && opts.machine;
  const config = opts && opts.config;
  if (!machine || typeof machine.subscribe !== 'function') {
    throw new Error('createVisuals(seoul): requires { machine } with subscribe()');
  }
  if (!config || typeof config.PRNG_SEED !== 'number') {
    throw new Error('createVisuals(seoul): requires { config } with PRNG_SEED');
  }
  const canvas = (opts && opts.canvas) || null;
  const root = (opts && opts.root) || (typeof document !== 'undefined' ? document.documentElement : null);
  const ctx = canvas && typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
  // Layer-0 фон-видео (фидбэк оператора 2026-06-24): пробрасываем videoSource/манифест
  // в общий background.js (тот же шов, что у ядра src/main.js). null (нет элементов /
  // ?selftest) → чистый canvas-фоллбэк, поведение байт-идентично прежнему B1.
  const videoSource = (opts && opts.videoSource) || null;
  const videoManifest = (opts && opts.videoManifest) || {};

  // Палитра-токен — один раз из CSS. accent у «Сеула» НЕ меняется по состоянию
  // (cyan всегда), но читаем реальный --accent (#58DDE3), не литерал.
  let CYAN = DEFAULT_CYAN;
  if (root && typeof getComputedStyle === 'function') {
    try {
      const cs = getComputedStyle(root);
      CYAN = (cs.getPropertyValue('--accent') || '').trim() || CYAN;
    } catch (_) { /* нет CSSOM (node) — дефолт */ }
  }
  // accent-ГАРД (code-review Codex): инвариант «красного на canvas НЕТ ни в одном
  // состоянии». Читаем реальный --accent (вдруг cyan перетюнят), но если токен
  // окажется красным/красно-доминантным (r ≥ g или r ≥ b) — структурно откатываем
  // к фикс-cyan: красный не должен просочиться на canvas даже при кривом CSS.
  {
    const [r, g, b] = hexToRgb(CYAN);
    if (r >= g || r >= b) CYAN = DEFAULT_CYAN;
  }

  function rgba(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  // Слои (порядок docs/03 §5: фон → сканлайны → кольца → ядро → частицы). БЕЗ glitch.
  // Фон: Layer-0 видео-лупы (videoSource из main.js) ИЛИ canvas-фоллбэк (нет видео /
  // ?selftest → videoSource:null → #05070A + глубина/вигнетка). freezeStates пуст — у
  // «Сеула» нет LOCKED (видео нигде не замораживается).
  const background = createBackground(config, { videoSource, manifest: videoManifest, root, freezeStates: new Set() });
  const core = createCore();
  const particles = createParticles();
  const scanlines = createScanlines();
  const rings = createRings(config);

  // НЕТ живого env.prng (code-review Codex, детерминизм): переиспользуемые слои
  // (core/rings/scanlines/particles/background) — closed-form от vt ИЛИ берут сид
  // один раз в фабрике (makeParticleField); ни один не потребляет env.prng в render.
  // Живой поток сделал бы кадр зависимым от каденса rAF — поэтому его тут нет вовсе.
  let field = makeParticleField(makePRNG(config.PRNG_SEED), config.PARTICLE_LIMIT);
  let fieldInitial = field.map((p) => ({ x: p.x, y: p.y }));
  let state = machine.getState();
  // accent-гард: cyan ВСЕГДА (красного на canvas нет ни в одном состоянии).
  const accent = CYAN;
  let vtOrigin = null;
  let pendingOrigin = true;

  function applyAccent() {
    if (root && root.style) root.style.setProperty('--scene-accent', accent);
  }
  applyAccent();

  // reseed — контракт детерминизма входа (docs/02 §6.4): часы→0, PRNG/поле от сида.
  function reseed(toState, event) {
    state = toState;
    field = makeParticleField(makePRNG(config.PRNG_SEED), config.PARTICLE_LIMIT);
    fieldInitial = field.map((p) => ({ x: p.x, y: p.y }));
    pendingOrigin = true;
    // accent не меняем (cyan всегда). Фон: event-aware, но видео нет → canvas-фоллбэк.
    if (background && typeof background.enter === 'function') background.enter(toState, event, false);
  }

  const unsubscribe = machine.subscribe((rec) => reseed(rec.to, rec.event));

  let dpr = 1;
  function resize() {
    if (!canvas) return;
    dpr = typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;
    const cw = canvas.clientWidth || (canvas.parentNode && canvas.parentNode.clientWidth) || 1080;
    const ch = canvas.clientHeight || (canvas.parentNode && canvas.parentNode.clientHeight) || 1920;
    canvas.width = Math.max(1, Math.round(cw * dpr));
    canvas.height = Math.max(1, Math.round(ch * dpr));
  }
  if (canvas) resize();
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('resize', resize);

  // render(ts) — один кадр всех слоёв. Вызывается из единственного rAF main.js.
  function render(ts) {
    if (!ctx) return;
    const now = typeof ts === 'number' ? ts : 0;
    if (pendingOrigin) { vtOrigin = now; pendingOrigin = false; }
    const vt = Math.max(0, now - (vtOrigin == null ? now : vtOrigin));
    const w = canvas.width;
    const h = canvas.height;
    const scan = typeof machine.getScanProgress === 'function' ? machine.getScanProgress() : null;
    const env = {
      ctx, w, h, dpr, vt, state, scan, accent,
      isAlert: false,                       // «Сеул» НЕ паникует (screen.md §1/§8)
      isScan: PROCESSING_STATES.has(state), // обработка = «скан» для слоёв
      coreX: w / 2,
      coreY: h * 0.42, // выше центра — место под зоны ридаута/CTA снизу (screen.md §3)
      rgba, config,
    };

    ctx.clearRect(0, 0, w, h);
    background.render(env);
    scanlines.render(env);
    rings.render(env);
    core.render(env);
    particles.render(env, field);
    // glitch НЕ рисуется (экран не «рвётся»). Красный затвор — DOM (#seoul-shutter).
  }

  function visualSample() {
    const p = makePRNG(config.PRNG_SEED);
    const draws = [];
    for (let i = 0; i < SAMPLE_DRAWS; i += 1) draws.push(round6(p()));
    const ps = fieldInitial.slice(0, SAMPLE_PARTICLES).map((pt) => ({ x: round6(pt.x), y: round6(pt.y) }));
    return { seed: config.PRNG_SEED, particleLimit: config.PARTICLE_LIMIT, draws, particles: ps };
  }

  return {
    render,
    visualSample,
    particleCount() { return field.length; },
    getAccent() { return accent; }, // всегда cyan — accent-гард (plan-review #5)
    preloadVideo() {
      const ps = [];
      if (typeof background.preload === 'function') ps.push(background.preload());
      return Promise.allSettled(ps);
    },
    destroy() {
      unsubscribe();
      if (typeof background.destroy === 'function') background.destroy();
      if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('resize', resize);
    },
  };
}
