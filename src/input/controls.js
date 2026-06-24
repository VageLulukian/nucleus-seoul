// input/controls.js — слой ввода NUCLEUS (Шаг 1, Task 4).
//
// Две части (docs/02 §2/§11, docs/plans/... Task 4):
//   1. keyToEvent(key) — ЧИСТАЯ функция (DOM-free, node-тестируемая): значение
//      KeyboardEvent.key → имя события машины. Сюда же замаплены типовые коды
//      Bluetooth-кликера/презентера (PageDown/PageUp/→/↓ → PRIMARY) — актёр на
//      съёмке двигает сюжет BT-кликером в свободной руке (docs/02 §2, docs/06 §3).
//   2. createControls(...) — слой навешивания listener'ов: keydown / клик кнопки →
//      dispatch в машину; курсор-автоскрытие по простою (CURSOR_HIDE, docs/02 §2).
//
// Гварды/debounce PRIMARY и вся no-op матрица §11 живут В МАШИНЕ (DOM-free,
// детерминированный clock) — здесь только маршрутизация DOM-событий. FULLSCREEN —
// DOM-концерн (Fullscreen API), в машину не уходит: маршрутизируется в
// инжектированный onFullscreen-хук (полная реализация — Task 8).
//
// DOM-free верхний уровень: keyToEvent и константы не трогают document/window —
// импортируется и браузером (через main.js), и node (logic-tests.mjs).

import { TIMING } from '../config.js';

// --- Маппинг клавиш → события (docs/02 §2). ---------------------------------
// Многосимвольные .key (Enter, Backspace, PageDown, ArrowRight…) — точное имя.
const NAMED_EVENT = Object.freeze({
  Enter: 'PRIMARY',
  PageDown: 'PRIMARY',
  PageUp: 'PRIMARY',
  ArrowRight: 'PRIMARY',
  ArrowDown: 'PRIMARY',
  Backspace: 'STEP_BACK',
});
// Буквы — регистро-независимо (KeyboardEvent.key даёт 'r' или 'R').
const LETTER_EVENT = Object.freeze({ r: 'RESET', p: 'REPLAY_VOICE', m: 'MUTE', f: 'FULLSCREEN' });
// Цифры 1–5 → JUMP_1..5.
const DIGIT_EVENT = Object.freeze({ 1: 'JUMP_1', 2: 'JUMP_2', 3: 'JUMP_3', 4: 'JUMP_4', 5: 'JUMP_5' });

/**
 * keyToEvent — чистый маппинг значения KeyboardEvent.key → имя события машины.
 * Возвращает null для неназначенных клавиш (вызывающий слой их игнорирует).
 * @param {string} key — KeyboardEvent.key
 * @returns {string|null}
 */
export function keyToEvent(key) {
  if (typeof key !== 'string' || key === '') return null;
  // Пробел: KeyboardEvent.key === ' '; 'Spacebar' — легаси-вариант старых движков.
  if (key === ' ' || key === 'Spacebar') return 'PRIMARY';
  if (NAMED_EVENT[key]) return NAMED_EVENT[key];
  if (key.length === 1) {
    const lower = key.toLowerCase();
    if (LETTER_EVENT[lower]) return LETTER_EVENT[lower];
    if (DIGIT_EVENT[key]) return DIGIT_EVENT[key];
  }
  return null;
}

// CSS-класс на корне, по которому стиль прячет курсор (правило — в index.html).
export const CURSOR_HIDDEN_CLASS = 'cursor-hidden';

/**
 * createControls — навешивает слой ввода на DOM и связывает с машиной.
 * @param {object}   opts
 * @param {object}   opts.machine       — стейт-машина (createMachine). dispatch(event).
 * @param {Element}  [opts.button]      — кнопка «Анализировать» (клик → PRIMARY).
 * @param {Window}   [opts.window]      — источник keydown/таймеров (default window).
 * @param {Document} [opts.document]    — источник mousemove (default document).
 * @param {Element}  [opts.root]        — узел для класса скрытия курсора (default <html>).
 * @param {Function} [opts.onFullscreen]— хук FULLSCREEN (DOM-концерн; Task 8). default no-op.
 * @param {boolean}  [opts.allowStateInput] — пускать ли стейт-события в машину
 *   (default true). В follower-режиме узла (?sync=1, docs/11 §G) = false: контрол
 *   принадлежит ЯДРУ, локальная клавиатура MacBook НЕ должна уводить узел со стейта
 *   мастера (STATE-AUTHORITY, Codex review). FULLSCREEN/курсор остаются — это DOM-only.
 * @returns {{ route, showCursor, hideCursor, isCursorHidden, destroy }}
 */
export function createControls(opts) {
  const machine = opts && opts.machine;
  if (!machine || typeof machine.dispatch !== 'function') {
    throw new Error('createControls: requires { machine } with dispatch()');
  }
  const win = opts.window || (typeof window !== 'undefined' ? window : null);
  const doc = opts.document || (typeof document !== 'undefined' ? document : null);
  const button = opts.button || null;
  const root = opts.root || (doc ? doc.documentElement : null);
  const onFullscreen = typeof opts.onFullscreen === 'function' ? opts.onFullscreen : function () {};
  const allowStateInput = opts.allowStateInput !== false; // default true (ядро/?auto без изменений)
  const cursorHideMs = TIMING.CURSOR_HIDE * 1000;

  // --- Маршрутизация события: FULLSCREEN → DOM-хук, остальное → машина. ------
  function route(eventName) {
    if (!eventName) return false;
    if (eventName === 'FULLSCREEN') {
      onFullscreen();
      return true;
    }
    // Follower-режим (allowStateInput=false): стейт-события в машину НЕ уходят —
    // узел чисто зеркалит мастера (docs/11 §G). Локальный бамп клавиатуры игнор.
    if (!allowStateInput) return false;
    return machine.dispatch(eventName);
  }

  function onKeyDown(e) {
    const eventName = keyToEvent(e && e.key);
    if (!eventName) return; // неназначенная клавиша — не вмешиваемся
    // Гасим дефолт прокрутки/«назад» для перехваченных клавиш (Space/PageDown/
    // стрелки/Backspace), чтобы реквизит не скроллился/не навигировал в кадре.
    if (typeof e.preventDefault === 'function') e.preventDefault();
    route(eventName);
  }

  function onButtonClick() {
    route('PRIMARY'); // debounce/гварды — в машине (§7/§11)
  }

  // --- Курсор-автоскрытие по простою (docs/02 §2). --------------------------
  let cursorTimer = null;
  function clearCursorTimer() {
    if (cursorTimer != null && win && typeof win.clearTimeout === 'function') {
      win.clearTimeout(cursorTimer);
    }
    cursorTimer = null;
  }
  function hideCursor() {
    if (root && root.classList) root.classList.add(CURSOR_HIDDEN_CLASS);
  }
  function showCursor() {
    if (root && root.classList) root.classList.remove(CURSOR_HIDDEN_CLASS);
    clearCursorTimer();
    if (win && typeof win.setTimeout === 'function') {
      cursorTimer = win.setTimeout(hideCursor, cursorHideMs);
    }
  }
  function isCursorHidden() {
    return !!(root && root.classList && root.classList.contains(CURSOR_HIDDEN_CLASS));
  }
  function onMouseMove() {
    showCursor(); // любое движение — показать курсор и перезавести таймер простоя
  }

  // --- Навеска listener'ов --------------------------------------------------
  if (win && typeof win.addEventListener === 'function') win.addEventListener('keydown', onKeyDown);
  if (doc && typeof doc.addEventListener === 'function') doc.addEventListener('mousemove', onMouseMove);
  if (button && typeof button.addEventListener === 'function') {
    button.addEventListener('click', onButtonClick);
  }
  // Старт: курсор виден, таймер простоя взведён (спрячется через CURSOR_HIDE).
  showCursor();

  function destroy() {
    if (win && typeof win.removeEventListener === 'function') win.removeEventListener('keydown', onKeyDown);
    if (doc && typeof doc.removeEventListener === 'function') doc.removeEventListener('mousemove', onMouseMove);
    if (button && typeof button.removeEventListener === 'function') {
      button.removeEventListener('click', onButtonClick);
    }
    clearCursorTimer();
  }

  return { route, showCursor, hideCursor, isCursorHidden, destroy };
}
