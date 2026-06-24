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
      el('p', { class: 'seoul-dominant', text: c.dominant }),
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
  const lines = copy.PROCESSING.statusLines;
  return function apply(progress) {
    if (!progress || !statusEl) return;
    const i = (progress.statusLine || 1) - 1;
    const text = lines[i];
    if (text && statusEl.textContent !== text) statusEl.textContent = text;
  };
}
