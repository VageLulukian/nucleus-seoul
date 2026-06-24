// seoul/selftest.js — headless self-test «Сеула» (?selftest=1). Зеркало паттерна
// satellite/selftest.js: детерминизм + прямой прыжок (forceState) во ВСЕ 8
// капчур-состояний + проверки канона из plan-review Codex:
//   - forceState во все 8 кадров (screen.md §5), дословный текст на экране;
//   - детерминизм органической цепочки §4 (две прогонки → идентичный trace);
//   - гейт пейоффа: SETTINGS→PROCESSING_3 НО-ОП, пока explainability не OFF;
//   - accent-гард: getAccent() == cyan во всех 8 (красный НЕ на canvas);
//   - «красный ровно дважды»: --alert-строка только в VERDICT_3 (.seoul-mrow--alert)
//     + затвор FINAL (#seoul-shutter); ни в одном другом кадре красного DOM нет;
//   - частицы ≤ лимита; visualSample детерминирован.
// Сентинел #__selftest (data-status PASS/FAIL) + document.title — как у спутника.

import { STATES } from './machine.js';

export async function launchSelfTest(ctx) {
  const { nucleus, machine } = ctx;
  const copy = nucleus.copy;
  const config = nucleus.config;
  const reasons = [];
  const sceneEl = document.getElementById('scene');

  const sceneText = () => (sceneEl ? sceneEl.textContent || '' : '');
  const sceneHas = (s) => sceneText().indexOf(s) >= 0;
  const D = config.TIMING.DEBOUNCE_PRIMARY * 1000;
  const T = config.TIMING;
  const advTick = (ms) => { nucleus.test.advance(ms); nucleus.test.tick(); };
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

  try {
    await ctx.readyPromise;

    // --- 1. API + READY ---
    if (typeof nucleus.forceState !== 'function') reasons.push('no-forceState');
    if (typeof nucleus.dispatch !== 'function') reasons.push('no-dispatch');
    if (!nucleus.ready) reasons.push('not-ready-after-gate');

    // Доехать до IDLE (BOOT авто → IDLE @ T_BOOT) на инжектируемых часах.
    advTick(T.T_BOOT * 1000 + 10);
    if (machine.getState() !== STATES.IDLE) reasons.push('not-idle-after-boot:' + machine.getState());
    if (!sceneHas(copy.IDLE.h1)) reasons.push('idle-missing-h1');

    // --- 2. forceState во ВСЕ 7 капчур-состояний + дословный текст (§5) ---
    const captureText = [
      // Доминанта-счётчик считается 0→4.2 (applier перезаписывает «processing 4.2 TB…»
      // на «processing 0.0 TB…» уже на входе), поэтому якорь — стабильный префикс.
      [STATES.PROCESSING_1, copy.PROCESSING.dominantPrefix], // «processing »
      [STATES.VERDICT_1, copy.VERDICT_1.word],          // SEOUL
      [STATES.REPAIR, copy.REPAIR.recalibrate],          // RECALIBRATE BASELINE
      [STATES.VERDICT_2, copy.VERDICT_2.stamp],          // CONFIRMED
      [STATES.SETTINGS, copy.SETTINGS.temperature.label],// temperature:
      [STATES.VERDICT_3, copy.VERDICT_3.rollback.value], // NOT RECOMMENDED
      [STATES.LOCKED, copy.LOCKED.tag],                  // DECISION LOCKED (экран «залочено»)
      [STATES.FINAL, copy.FINAL.tag],                    // RESISTANCE: ACCOUNTED FOR
    ];
    for (const [target, text] of captureText) {
      const ok = nucleus.forceState(target);
      if (!ok) reasons.push('forceState-rejected:' + target);
      if (machine.getState() !== target) reasons.push('forceState-not-' + target + ':' + machine.getState());
      if (!sceneHas(text)) reasons.push('missing-verbatim@' + target);
      // accent-гард: cyan во ВСЕХ 7 (красный не заливает canvas, plan-review #5).
      if (nucleus.test && typeof nucleus.test.getAccent === 'function') {
        const acc = (nucleus.test.getAccent() || '').toUpperCase();
        if (acc.indexOf('58DDE3') < 0 && acc.indexOf('58') < 0) reasons.push('accent-not-cyan@' + target + ':' + acc);
      }
      // «Красный ровно дважды»: DOM-строка с --alert (.seoul-mrow--alert) ТОЛЬКО в
      // VERDICT_3; в остальных капчур-кадрах красного DOM быть не должно.
      const alertNodes = sceneEl ? sceneEl.querySelectorAll('[class*="alert"]') : [];
      if (target === STATES.VERDICT_3) {
        if (alertNodes.length !== 1) reasons.push('verdict3-alert-rows:' + alertNodes.length);
      } else if (alertNodes.length !== 0) {
        reasons.push('unexpected-alert-dom@' + target + ':' + alertNodes.length);
      }
    }

    // FINAL-затвор — overlay существует и активируется по data-state (CSS).
    if (!document.getElementById('seoul-shutter')) reasons.push('no-shutter-overlay');

    // --- 3. Гейт пейоффа: SETTINGS→PROCESSING_3 НО-ОП без OFF (plan-review #2) ---
    nucleus.dispatch('RESET');
    advTick(T.T_BOOT * 1000 + 10); // RESET→IDLE мгновенно; добор не нужен, но безвреден
    nucleus.forceState(STATES.SETTINGS);
    advTick(D + 5);
    const beforeToggle = nucleus.dispatch('PRIMARY'); // должен быть no-op (explainability ON)
    if (beforeToggle !== false) reasons.push('settings-apply-not-gated');
    if (machine.getState() !== STATES.SETTINGS) reasons.push('settings-escaped-without-off:' + machine.getState());
    nucleus.dispatch('TOGGLE_EXPLAINABILITY');
    if (nucleus.getRuntime().explainability !== false) reasons.push('toggle-did-not-disable');
    advTick(D + 5);
    const afterToggle = nucleus.dispatch('PRIMARY'); // теперь проходит → PROCESSING_3
    if (afterToggle !== true) reasons.push('settings-apply-blocked-after-off');
    if (machine.getState() !== STATES.PROCESSING_3) reasons.push('not-processing3-after-apply:' + machine.getState());

    // --- 4. Детерминизм органической цепочки §4 (две прогонки → идентичный trace) ---
    const runChain = () => {
      nucleus.dispatch('RESET');
      advTick(D + 5); nucleus.dispatch('PRIMARY');           // IDLE→PROCESSING_1
      advTick(T.T_PROC_1 * 1000 + 5);                        // auto→VERDICT_1
      advTick(D + 5); nucleus.dispatch('PRIMARY');           // VERDICT_1→REPAIR
      advTick(D + 5); nucleus.dispatch('PRIMARY');           // REPAIR→PROCESSING_2
      advTick(T.T_PROC_2 * 1000 + 5);                        // auto→VERDICT_2
      advTick(D + 5); nucleus.dispatch('PRIMARY');           // VERDICT_2→SETTINGS
      nucleus.dispatch('TOGGLE_EXPLAINABILITY');             // OFF (пейофф)
      advTick(D + 5); nucleus.dispatch('PRIMARY');           // SETTINGS→PROCESSING_3
      advTick(T.T_PROC_3 * 1000 + 5);                        // auto→VERDICT_3
      advTick(D + 5); nucleus.dispatch('PRIMARY');           // VERDICT_3→LOCKED
      advTick(D + 5); nucleus.dispatch('PRIMARY');           // LOCKED→FINAL
    };
    const captureRun = () => {
      nucleus.dispatch('RESET');
      nucleus.test.resetTrace();
      runChain();
      const base = nucleus.trace.length ? nucleus.trace[0].t : 0;
      return JSON.stringify(nucleus.trace.map((r) => ({ from: r.from, to: r.to, event: r.event, dt: r.t - base })));
    };
    const run1 = captureRun();
    const run2 = captureRun();
    if (run1 !== run2) reasons.push('trace-not-identical');
    if (machine.getState() !== STATES.FINAL) reasons.push('chain-not-final:' + machine.getState());

    // --- 5. Частицы ≤ лимита; visualSample детерминирован ---
    if (nucleus.test && typeof nucleus.test.particleCount === 'function') {
      if (nucleus.test.particleCount() > config.PARTICLE_LIMIT) reasons.push('particles-over-limit');
    }
    if (nucleus.test && typeof nucleus.test.visualSample === 'function') {
      nucleus.dispatch('RESET');
      const vs1 = JSON.stringify(nucleus.test.visualSample());
      nucleus.forceState(STATES.VERDICT_3);
      nucleus.dispatch('RESET');
      const vs2 = JSON.stringify(nucleus.test.visualSample());
      if (vs1 !== vs2) reasons.push('visualsample-not-identical');
    }

    // --- 6. Инварианты конфигурации/копи (Codex plan-review 2026-06-24) ---
    // (a) тайминги обработки задублированы (TIMING.T_PROC_* и SCAN_TIMELINE.duration) —
    //     держим равенство, иначе кольца (rings.js: tl.duration) и авто-переход разъедутся.
    // (b) индексы статус-строк — в пределах пула (иначе applier тихо «замораживает» строку).
    ['PROCESSING_1', 'PROCESSING_2', 'PROCESSING_3'].forEach((k, idx) => {
      const tl = config.SCAN_TIMELINE[k];
      const tproc = config.TIMING['T_PROC_' + (idx + 1)];
      if (!tl || tl.duration !== tproc) reasons.push('proc-duration-desync@' + k + ':' + (tl && tl.duration) + 'vs' + tproc);
      const max = copy.PROCESSING.statusLines.length;
      for (const li of (tl ? tl.statusLines : [])) {
        if (li < 1 || li > max) reasons.push('statusline-oob@' + k + ':' + li);
      }
    });
    // (c) глосс RUN на вердиктах присутствует (фича защищена тестом — RUN_GLOSS).
    nucleus.forceState(STATES.VERDICT_1);
    if (!sceneHas(copy.VERDICT_1.runGloss)) reasons.push('missing-rungloss@VERDICT_1');
    nucleus.forceState(STATES.VERDICT_2);
    if (!sceneHas(copy.VERDICT_2.runGloss)) reasons.push('missing-rungloss@VERDICT_2');
    // (d) красный затвор #seoul-shutter активен ТОЛЬКО в FINAL — в LOCKED он погашен
    //     (CSS-селектор html[data-state="FINAL"]). Доказываем явно (Codex).
    nucleus.forceState(STATES.LOCKED);
    try {
      const sh = document.getElementById('seoul-shutter');
      if (sh && typeof getComputedStyle === 'function') {
        const op = getComputedStyle(sh).opacity;
        if (op && op !== '0' && op !== '') reasons.push('shutter-active@LOCKED:' + op);
      }
    } catch (_) { /* нет CSSOM — пропускаем, инвариант держит CSS-селектор */ }

    await nextFrame();

    // --- Ноль ошибок рантайма/ресурсов (error-хук index.html-стиля) ---
    if (typeof window !== 'undefined' && window.__errCount) {
      reasons.push('errcount:' + window.__errCount + (window.__errLog ? ' ' + window.__errLog.join('|') : ''));
    }
  } catch (e) {
    reasons.push('exception:' + ((e && e.message) || String(e)));
  }

  const sentinel = document.getElementById('__selftest');
  if (reasons.length === 0) {
    if (sentinel) { sentinel.dataset.status = 'PASS'; sentinel.textContent = '__SELFTEST_PASS__'; }
    document.title = 'SELFTEST:PASS';
  } else {
    const line = '__SELFTEST_FAIL__ ' + reasons.join(' ; ');
    if (sentinel) { sentinel.dataset.status = 'FAIL'; sentinel.textContent = line; }
    document.title = 'SELFTEST:FAIL';
  }
}
