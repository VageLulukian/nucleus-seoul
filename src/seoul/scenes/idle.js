// seoul/scenes/idle.js — IDLE: простой экран до вопроса (screen.md §7).
// Чистый режим: eyebrow + h1 + sub в геро-зоне; CTA «Анализировать» снизу (тач →
// PRIMARY → PROCESSING_1). biom-ядро рисуется на canvas позади (visuals).

export function renderIdle(ctx) {
  const { el, copy, machine } = ctx;
  const c = copy.IDLE;

  const cta = el('button', { class: 'seoul-cta seoul-cta--primary', type: 'button', text: c.cta });
  cta.addEventListener('click', () => machine.dispatch('PRIMARY'));

  return el('section', { class: 'seoul-scene seoul-scene--idle' }, [
    el('div', { class: 'seoul-zone-hero' }, [
      el('p', { class: 'seoul-eyebrow', text: c.eyebrow }),
      el('h1', { class: 'seoul-h1', text: c.h1 }),
      el('p', { class: 'seoul-sub', text: c.sub }),
    ]),
    el('div', { class: 'seoul-zone-cta' }, [cta]),
  ]);
}
