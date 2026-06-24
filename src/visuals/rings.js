// visuals/rings.js — прогресс-кольца сканирования (Шаг 1, Task 7). docs/03 §5.4.
//
// Концентрические индикаторы «прогресса подсистем», живут ТОЛЬКО в SCAN, штрих
// светится accent-цветом. Прогресс детерминирован от визуальных часов входа в
// скан по ease-out-кривой (docs/02 §12): кольцо достигает 100% к
// t = duration − ringCompleteOffset (НЕ ровно к T_SCAN — последние ~0.3 c кольцо
// уже «полно», пока разворачивается «ФАКТОР РИСКА»). duration/offset — из config
// (SCAN_TIMELINE[state] / SCAN_CURVES.ringCompleteOffset). Внешние кольца чуть
// быстрее (визуальная глубина), но все clamp к 1.

export function createRings(config) {
  const TL = (config && config.SCAN_TIMELINE) || {};
  const CURVES = (config && config.SCAN_CURVES) || {};
  return {
    render(env) {
      const { ctx, w, h, vt, dpr, accent, state, isScan, coreX: cx, coreY: cy, rgba } = env;
      if (!ctx || !isScan) return;
      const tl = TL[state];
      // §12: 100% достигается к t = duration − ringCompleteOffset, кривая ease-out.
      const completeMs =
        Math.max(0, (tl ? tl.duration : 6) - (CURVES.ringCompleteOffset || 0)) * 1000;
      const linear = completeMs > 0 ? Math.min(1, vt / completeMs) : 1;
      const progress = 1 - (1 - linear) * (1 - linear); // easeOutQuad (docs/02 §12)

      const base = Math.min(w, h) * 0.22;
      const RINGS = 3;
      for (let i = 0; i < RINGS; i += 1) {
        const rr = base * (1 + i * 0.18);
        // Трек кольца (тусклый; 0.22→0.32 — round5: дуги тонули в видео-фоне,
        // привязка readout-полей к ретиклу не читалась с первого взгляда).
        ctx.strokeStyle = rgba(accent, 0.32);
        ctx.lineWidth = Math.max(1, dpr || 1);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
        // Дуга прогресса (яркая), чуть быстрее на внешних кольцах, но clamp к 1.
        const p = Math.min(1, progress * (1 + i * 0.1));
        ctx.strokeStyle = rgba(accent, 0.8);
        ctx.lineWidth = Math.max(1.5, (dpr || 1) * 1.6);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
        ctx.stroke();
      }
    },
  };
}
