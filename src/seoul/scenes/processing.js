// seoul/scenes/processing.js — PROCESSING_1/2/3: «пафосная обработка» (кадр 3).
// Технический режим. Циан, красного нет. Кнопки нет (как SCAN ролика №1).
// Доминанта-счётчик «processing 4.2 TB…» + эхо вопроса + одна статус-строка,
// которая СМЕНЯЕТСЯ (applier читает scanProgress.statusLine). Кольца — на canvas
// (visuals: isScan=true). Легче 9-тайлового скана ролика №1 (screen.md §5 кадр 3).

export function renderProcessing(ctx, _variant) {
  const { el, copy } = ctx;
  const c = copy.PROCESSING;

  return el('section', { class: 'seoul-scene seoul-scene--processing seoul-scene--tech' }, [
    el('div', { class: 'seoul-rule' }),
    el('p', { class: 'seoul-coreonline', text: copy.HUD.coreOnline }),
    el('div', { class: 'seoul-zone-hero' }, [
      // Стартовый текст = 0.0 TB (applier считает вверх до 4.2); строится из
      // prefix/suffix, чтобы совпасть с первым кадром аплаера (без мигания 4.2→0.0).
      el('p', { class: 'seoul-dominant', text: c.dominantPrefix + (0).toFixed(1) + c.dominantSuffix }),
    ]),
    el('div', { class: 'seoul-zone-readout' }, [
      el('p', { class: 'seoul-query', text: c.query }),
      // Стартовая строка = первая (statusLines[0]); applier сменит по расписанию.
      el('p', { class: 'seoul-status', text: c.statusLines[0] }),
    ]),
  ]);
}

// createProcessingApplier(node, copy) — патчит текущую статус-строку из scanProgress
// (1-based индекс в copy.PROCESSING.statusLines), как createScanApplier ролика №1.
export function createProcessingApplier(node, copy) {
  const statusEl = node.querySelector('.seoul-status');
  const domEl = node.querySelector('.seoul-dominant');
  const lines = copy.PROCESSING.statusLines;
  const pre = copy.PROCESSING.dominantPrefix;
  const suf = copy.PROCESSING.dominantSuffix;
  return function apply(progress) {
    if (!progress) return;
    if (statusEl) {
      const i = (progress.statusLine || 1) - 1;
      const text = lines[i];
      if (text && statusEl.textContent !== text) statusEl.textContent = text;
    }
    // Счётчик-доминанта «processing X.X TB…» (scanProgress.dataTb растёт 0→4.2).
    if (domEl && typeof progress.dataTb === 'number') {
      const t = pre + progress.dataTb.toFixed(1) + suf;
      if (domEl.textContent !== t) domEl.textContent = t;
    }
  };
}
