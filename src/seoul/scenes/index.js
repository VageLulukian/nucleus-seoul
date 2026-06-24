// seoul/scenes/index.js — контроллер сцен «Сеула» (зеркало паттерна
// src/satellite/scenes/index.js, свой state→scene map под граф §4).
//
// Подписывается на машину и монтирует тело текущего состояния в #scene; сцены —
// рендер-функции из seoul-copy. PROCESSING-сцена потребляет scanProgress (смена
// статус-строк) через аплаер, переприменяемый каждый кадр. В ctx прокинута machine —
// диегетические сцены REPAIR/SETTINGS вешают тач-обработчики, диспатчащие события
// (plan-review Codex: тач-handlers живут в сценах, не в общем controls.js).

import { STATES } from '../machine.js';
import { renderIdle } from './idle.js';
import { renderProcessing, createProcessingApplier } from './processing.js';
import { renderVerdict1 } from './verdict1.js';
import { renderVerdict2 } from './verdict2.js';
import { renderVerdict3 } from './verdict3.js';
import { renderRepair } from './repair.js';
import { renderSettings } from './settings.js';
import { renderLocked } from './locked.js';
import { renderFinal } from './final.js';

const PROCESSING_STATES = new Set([
  STATES.PROCESSING_1, STATES.PROCESSING_2, STATES.PROCESSING_3,
]);

// el(tag, attrs, children) — минимальный DOM-билдер, прокидывается в сцены через ctx.
export function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const key in attrs) {
      const val = attrs[key];
      if (val == null) continue;
      if (key === 'class') node.className = val;
      else if (key === 'text') node.textContent = val;
      else if (key === 'html') node.innerHTML = val;
      else node.setAttribute(key, val);
    }
  }
  if (children) {
    for (const child of children) {
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }
  return node;
}

const SCENES = {
  [STATES.IDLE]: (ctx) => renderIdle(ctx),
  [STATES.BOOT]: (ctx) => renderIdle(ctx), // BOOT держит IDLE-каркас до авто→IDLE
  [STATES.PROCESSING_1]: (ctx) => renderProcessing(ctx, STATES.PROCESSING_1),
  [STATES.PROCESSING_2]: (ctx) => renderProcessing(ctx, STATES.PROCESSING_2),
  [STATES.PROCESSING_3]: (ctx) => renderProcessing(ctx, STATES.PROCESSING_3),
  [STATES.VERDICT_1]: (ctx) => renderVerdict1(ctx),
  [STATES.VERDICT_2]: (ctx) => renderVerdict2(ctx),
  [STATES.VERDICT_3]: (ctx) => renderVerdict3(ctx),
  [STATES.REPAIR]: (ctx) => renderRepair(ctx),
  [STATES.SETTINGS]: (ctx) => renderSettings(ctx),
  [STATES.LOCKED]: (ctx) => renderLocked(ctx),
  [STATES.FINAL]: (ctx) => renderFinal(ctx),
};

export function createScenes(opts) {
  const machine = opts && opts.machine;
  const mount = opts && opts.mount;
  const copy = opts && opts.copy;
  const config = opts && opts.config;
  if (!machine || typeof machine.subscribe !== 'function') {
    throw new Error('createScenes(seoul): requires { machine } with subscribe()');
  }

  let currentEl = null;
  let currentState = null;
  let procApply = null;

  function clear() {
    if (currentEl && currentEl.parentNode) currentEl.parentNode.removeChild(currentEl);
    currentEl = null;
    procApply = null;
  }

  function show(state) {
    clear();
    currentState = state;
    const make = SCENES[state];
    if (!make || !mount) return null;
    const node = make({ el, copy, config, state, machine });
    mount.appendChild(node);
    currentEl = node;
    if (PROCESSING_STATES.has(state) && typeof machine.getScanProgress === 'function') {
      procApply = createProcessingApplier(node, copy);
      if (procApply) procApply(machine.getScanProgress());
    }
    return node;
  }

  function update() {
    if (procApply) procApply(machine.getScanProgress());
  }

  show(machine.getState());
  const unsubscribe = machine.subscribe((rec) => show(rec.to));

  return {
    show,
    update,
    getCurrent() { return currentEl; },
    getCurrentState() { return currentState; },
    destroy() { unsubscribe(); clear(); },
  };
}
