// seoul/main.js — bootstrap экрана «Сеул» (ролик №2), по образцу satellite/main.js.
//
// Переиспользует общие примитивы: input/controls.js (та же матрица хоткеев, кнопки
// нет — button:null), визуал-слои через свой оркестратор seoul/visuals.js. Свои:
// машина (форк графа §4 — seoul/machine.js), сцены (seoul/scenes), config/copy, hud.
// «Сеул» по умолчанию НЕМ (звук — в монтаже): аудио не подключается (машина берёт
// внутренний no-op). READY-gate без аудио-прогрева. window.__nucleusSeoul даёт
// frame-driving API (dispatch/forceState) для Playwright и self-test.

import * as config from './config.js';
import * as copy from './copy.js';
import { createMachine, STATES } from './machine.js';
import { createControls } from '../input/controls.js';
import { createVisuals } from './visuals.js';
import { createScenes } from './scenes/index.js';
import { createHud } from './hud.js';

const VERSION = 'seoul';
const params = new URLSearchParams(location.search);
const SELFTEST = params.has('selftest');

document.documentElement.dataset.state = STATES.LOADING;

// Режим хрома: screen = полный прибор, shoot = чистый кадр (для записи экрана 9:16).
const FIT = params.get('fit') === 'shoot' ? 'shoot' : 'screen';
document.documentElement.dataset.fit = FIT;

// --- Ядро: машина БЕЗ аудио (экран нем → внутренний no-op-адаптер машины) ---
const machine = createMachine({
  config,
  now: SELFTEST ? undefined : () => performance.now(),
});

// --- Ввод: операторские хоткеи + курсор-автоскрытие; видимой кнопки нет (CTA
// рисуют сцены и сами диспатчат PRIMARY). FULLSCREEN — DOM-хук. ---
function toggleFullscreen() {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        const p = el.requestFullscreen();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    } else if (document.exitFullscreen) {
      const p = document.exitFullscreen();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  } catch (_) { /* headless — игнор */ }
}

const controls = createControls({
  machine,
  button: null,
  onFullscreen: toggleFullscreen,
  allowStateInput: true,
});

// Отразить состояние машины в DOM на каждом переходе (CSS-хуки по data-state).
machine.subscribe((rec) => { document.documentElement.dataset.state = rec.to; });

// --- Сцены: DOM-тело состояния в #scene ---
const scenes = createScenes({
  machine,
  mount: document.getElementById('scene'),
  copy,
  config,
});

// --- Визуал (свой B1-оркестратор): canvas-слой, cyan-only, без видео ---
const visuals = createVisuals({
  machine,
  config,
  canvas: document.getElementById('viz'),
  root: document.documentElement,
});

// --- HUD-кромка ---
const hud = createHud({ machine, copy, mount: document.getElementById('seoul-hud') });

// Синхронный init-probe для self-test (LOADING до markReady).
const initProbe = { state: machine.getState() };

// --- Диагностический объект (frame-driving API) ---
const nucleus = {
  version: VERSION,
  config,
  copy,
  trace: machine.trace,
  captureStates: machine.CAPTURE_STATES,
  get ready() { return machine.ready; },
  get stateEpoch() { return machine.stateEpoch; },
  getState() { return machine.getState(); },
  getRuntime() { return machine.getRuntime(); },
  dispatch(event) { return machine.dispatch(event); },
  // forceState(name) — прямой прыжок в любое из 7 капчур-состояний (READY-gated,
  // через общий transition; plan-review Codex). Playwright/selftest бьют им по кадрам.
  forceState(name) { return machine.forceState(name); },
  markReady() { return machine.markReady(); },
  toggleFullscreen,
  __initProbe: initProbe,
};
if (SELFTEST) {
  const test = Object.assign({}, machine.test);
  test.visualSample = () => visuals.visualSample();
  Object.defineProperty(test, 'rafLoops', { get: () => rafLoopsStarted, enumerable: true });
  test.particleCount = () => visuals.particleCount();
  test.getAccent = () => visuals.getAccent();
  nucleus.test = test;
}

window.__nucleus = nucleus;
window.__nucleusSeoul = nucleus;
window.__nucleusTrace = machine.trace;

// --- Единый rAF-луп: машина (прод) + сцены + визуал ---
let rafLoopsStarted = 0;
function frame(ts) {
  try {
    if (!SELFTEST) machine.tick(ts);
    scenes.update();
    visuals.render(ts);
  } finally {
    requestAnimationFrame(frame);
  }
}
function startRenderLoop() {
  rafLoopsStarted += 1;
  requestAnimationFrame(frame);
}
startRenderLoop();

// --- READY-gate (docs/02 §9), БЕЗ аудио (экран нем) ---
function firstFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
async function warmRace(start, timeoutMs) {
  if (!start) return;
  let timer;
  const timeout = new Promise((resolve) => { timer = setTimeout(resolve, timeoutMs); });
  try {
    await Promise.race([Promise.resolve().then(start).catch(() => {}), timeout]);
  } catch (_) { /* best-effort */ } finally { clearTimeout(timer); }
}

const readyPromise = (async () => {
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const videoWarm = warmRace(
    typeof visuals.preloadVideo === 'function' ? () => visuals.preloadVideo() : null,
    4000,
  );
  await Promise.all([fontsReady, firstFrame(), videoWarm]);
  machine.markReady();
  document.documentElement.dataset.ready = '1';
})();

// --- Self-test (?selftest=1) — свой модуль ---
function selftestImportFailed(err) {
  const sentinel = document.getElementById('__selftest');
  const line = '__SELFTEST_FAIL__ selftest-import:' + ((err && err.message) || String(err));
  if (sentinel) { sentinel.dataset.status = 'FAIL'; sentinel.textContent = line; }
  document.title = 'SELFTEST:FAIL';
}

if (SELFTEST) {
  import('./selftest.js')
    .then((m) => m.launchSelfTest({ nucleus, machine, controls, scenes, hud, initProbe, readyPromise, version: VERSION }))
    .catch(selftestImportFailed);
}

export { VERSION };
