// visuals/core.js — детерминированный визуал-керн + биом-ядро NUCLEUS (Шаг 1, Task 7).
//
// Две роли:
//   1. makePRNG(seed) — ЧИСТЫЙ сидируемый PRNG (mulberry32), DOM-free и node-
//      тестируемый. Никакого Math.random (docs/02 §6.3, docs/07 §6): весь
//      декоративный «рандом» фона детерминирован от config.PRNG_SEED и
//      ресидится на входе в состояние/RESET (docs/02 §6.4) — дубли визуально
//      повторяются. Возвращает float в [0, 1).
//   2. createCore() — рендер «биометрического ядра» (docs/03 §5.1): тёмный
//      клинический орб по центру с cyan-свечением-«дыханием». IDLE дышит
//      спокойно, SCAN ускоряется, ALERT краснеет+джиттерит (docs/03 §7).
//      Цвет приходит из env.accent (палитра-гард: красный только в ALERT/LOCKED).
//
// DOM-free верхний уровень (makePRNG — чистая функция); createCore().render
// трогает 2D-контекст только при вызове из общего rAF-цикла (main.js).

/**
 * makePRNG — детерминированный mulberry32. Один и тот же seed → одна и та же
 * последовательность (база детерминизма дубль-к-дублю, docs/02 §6).
 * @param {number} seed — целочисленный сид (config.PRNG_SEED).
 * @returns {() => number} генератор float ∈ [0, 1).
 */
export function makePRNG(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Период пульса дыхания (мс) — медленный в IDLE (docs/03 §6 --breath 3.6s).
const BREATH_MS = 3600;
const TWO_PI = Math.PI * 2;
const ORBITAL_TICKS = 60; // число орбитальных делений (closed-form по индексу)
const SPOKES = 6;         // радиальные спицы

/**
 * createCore — фабрика рендерера «биометрического ядра-реактора» (docs/03 §5.1).
 * Без состояния между кадрами и БЕЗ живого env.prng (детерминизм-ревью Codex): вся
 * структура — closed-form функция от env.vt (часы от входа в состояние) и индекса
 * деления → дубль-в-дубль идентично на данном vt; visualSample() не затрагивается.
 * Слои (изнутри наружу): гало во фланги → концентрические кольца → орбитальные тики
 * → спицы → радар-свип → корпус-кольцо → ирис-линза. Цвет из env.accent
 * (палитра-гард: красный только в ALERT/LOCKED — литералов красного здесь нет).
 */
export function createCore() {
  return {
    render(env) {
      const { ctx, w, h, vt, accent, isAlert, isScan: scan, coreX: cx, coreY: cy, rgba } = env;
      if (!ctx) return;
      const unit = Math.min(w, h) * 0.17; // базовый радиус-юнит
      const lw = Math.max(1, Math.min(w, h) * 0.0016);

      // Темп «дыхания»: SCAN ускоряется, ALERT нестабилен (docs/03 §7).
      const rate = scan ? 2.0 : isAlert ? 2.6 : 1.0;
      const breath = Math.sin((vt / BREATH_MS) * rate * TWO_PI);
      const pulse = 1 + 0.05 * breath;

      // ALERT — консервативная тряска 2–5px (docs/03 §7), синхронна пульсу красного.
      let ox = 0;
      let oy = 0;
      if (isAlert) {
        const amp = 3; // в пределах 2–5px — текст вердикта остаётся читаемым
        ox = Math.sin(vt * 0.013) * amp;
        oy = Math.cos(vt * 0.017) * amp;
      }
      const x = cx + ox;
      const y = cy + oy;

      // --- 1. Широкое гало во фланги: тянет ядро к приборным крыльям, убивает
      // «мёртвую» черноту по бокам. Очень слабое → НЕ засвечивает текст героя. ---
      const haloR = Math.max(w, h) * 0.55;
      const halo = ctx.createRadialGradient(x, y, unit * 0.4, x, y, haloR);
      halo.addColorStop(0, rgba(accent, isAlert ? 0.1 : 0.07));
      halo.addColorStop(0.55, rgba(accent, 0.02));
      halo.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // --- 2. Концентрические кольца-корпус (3, разный радиус/яркость). ---
      ctx.lineWidth = lw;
      for (let i = 0; i < 3; i += 1) {
        const rr = unit * (0.92 + i * 0.46) * pulse;
        ctx.strokeStyle = rgba(accent, 0.28 - i * 0.07);
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, TWO_PI);
        ctx.stroke();
      }

      // --- 3. Орбитальные тики: кольцо делений, медленно вращается (closed-form). ---
      const tickR = unit * 1.62 * pulse;
      const tickRot = vt * (scan ? 0.0009 : 0.00035); // медленно в IDLE, быстрее в SCAN
      ctx.lineWidth = Math.max(1, lw * 0.9);
      for (let k = 0; k < ORBITAL_TICKS; k += 1) {
        const a = (k / ORBITAL_TICKS) * TWO_PI + tickRot;
        const major = k % 5 === 0;
        const len = unit * (major ? 0.12 : 0.06);
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        ctx.strokeStyle = rgba(accent, major ? 0.55 : 0.22);
        ctx.beginPath();
        ctx.moveTo(x + ca * tickR, y + sa * tickR);
        ctx.lineTo(x + ca * (tickR + len), y + sa * (tickR + len));
        ctx.stroke();
      }

      // --- 4. Радиальные спицы (тонкие, контр-вращение). ---
      const spokeRot = -vt * 0.0002;
      ctx.lineWidth = lw;
      for (let s = 0; s < SPOKES; s += 1) {
        const a = (s / SPOKES) * TWO_PI + spokeRot;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        ctx.strokeStyle = rgba(accent, 0.1);
        ctx.beginPath();
        ctx.moveTo(x + ca * unit * 0.5, y + sa * unit * 0.5);
        ctx.lineTo(x + ca * unit * 1.5, y + sa * unit * 1.5);
        ctx.stroke();
      }

      // --- 5. Радар-свип: яркая дуга, обегающая ядро (живость прибора). Слабый в
      // IDLE (спокойствие, docs/03 §7), ярче в SCAN, резкий в ALERT. ---
      const sweepA = vt * (scan ? 0.0022 : isAlert ? 0.003 : 0.0011);
      const sweepLen = 0.6;
      const sweepR = unit * 1.38 * pulse;
      ctx.lineWidth = lw * 2;
      ctx.strokeStyle = rgba(accent, scan ? 0.7 : isAlert ? 0.6 : 0.32);
      ctx.beginPath();
      ctx.arc(x, y, sweepR, sweepA, sweepA + sweepLen);
      ctx.stroke();

      // --- 6. Корпус-кольцо (яркое, тонкое). ---
      ctx.lineWidth = lw * 1.4;
      ctx.strokeStyle = rgba(accent, 0.5);
      ctx.beginPath();
      ctx.arc(x, y, unit * 0.62 * pulse, 0, TWO_PI);
      ctx.stroke();

      // --- 7. Ирис-линза: яркий центр с тёмным «зрачком» для глубины/объёма. ---
      const irisR = unit * 0.5 * pulse;
      const iris = ctx.createRadialGradient(x, y, 0, x, y, irisR);
      iris.addColorStop(0, rgba(accent, isAlert ? 0.5 : 0.42));
      iris.addColorStop(0.45, rgba(accent, 0.16));
      iris.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = iris;
      ctx.beginPath();
      ctx.arc(x, y, irisR, 0, TWO_PI);
      ctx.fill();
    },
  };
}
