// visuals/scanlines.js — CRT-сканлайны + лёгкий дрейф (Шаг 1, Task 7). docs/03 §5.3.
//
// Тонкий премиальный CRT-оверлей (НЕ ретро): очень низкая непрозрачность,
// медленный вертикальный дрейф. SCAN — чуть плотнее; ALERT — жёстче, в accent-
// цвете (docs/03 §7). Цвет до ALERT — нейтрально-белый (не вводим лишний оттенок);
// в ALERT берёт красный accent (палитра-гард).

export function createScanlines() {
  return {
    render(env) {
      const { ctx, w, h, vt, dpr, isAlert, isScan: scan, accent, rgba } = env;
      if (!ctx) return;
      const gap = Math.max(2, Math.round((dpr || 1) * 3));
      const drift = (vt * 0.02) % gap; // медленный вертикальный сдвиг
      const alpha = isAlert ? 0.08 : scan ? 0.05 : 0.03;
      // До ALERT — нейтральный белый штрих; в ALERT — красный accent.
      ctx.fillStyle = isAlert ? rgba(accent, alpha) : rgba('#FFFFFF', alpha);
      for (let y = -gap + drift; y < h; y += gap) {
        ctx.fillRect(0, y, w, 1);
      }
    },
  };
}
