// seoul/scenes/verdict2.js — VERDICT_2 / RUN 02 // CONFIRMED (кадр 7, запись экрана).
// Чистый режим, но ВИЗУАЛЬНО ИНОЙ, чем кадр 4 (C2-D5): не одиночное SEOUL, а
// сверка/подтверждение двух прогонов + машинный штамп CONFIRMED. Циан, красного нет.
// Штамп — грамматика «ПОДТВЕРЖДЕНО» ролика №1 (двойная hairline-рамка, БЕЗ поворота
// и glow). Читается: «перепрогнал — тот же ответ, заверено». CTA → PRIMARY → SETTINGS.

export function renderVerdict2(ctx) {
  const { el, copy, machine } = ctx;
  const c = copy.VERDICT_2;

  const cta = el('button', { class: 'seoul-cta', type: 'button', text: c.cta });
  cta.addEventListener('click', () => machine.dispatch('PRIMARY'));

  return el('section', { class: 'seoul-scene seoul-scene--verdict seoul-scene--verdict-2' }, [
    el('p', { class: 'seoul-context', text: c.run }),
    el('div', { class: 'seoul-zone-hero' }, [
      el('div', { class: 'seoul-compare' }, [
        el('p', { class: 'seoul-compare__row', text: c.compareRun1 }),
        el('p', { class: 'seoul-compare__row', text: c.compareRun2 }),
        el('p', { class: 'seoul-compare__row seoul-compare__match' }, [
          el('span', { class: 'seoul-compare__k', text: c.matchLabel }),
          ' ',
          el('span', { class: 'seoul-compare__v', text: c.matchValue }),
        ]),
      ]),
      el('div', { class: 'seoul-stamp', text: c.stamp }),
    ]),
    el('div', { class: 'seoul-zone-cta' }, [cta]),
  ]);
}
