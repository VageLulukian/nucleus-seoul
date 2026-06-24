// seoul/scenes/verdict1.js — VERDICT_1 / RUN 01 (кадр 4, запись экрана).
// Чистый режим: спокойно, минимум. Циан, красного нет. Шок — в безмятежной
// уверенности: терабайты → одно слово SEOUL, поданное как уже решённое.
// Единственное сухое поле STATUS: COMMITTED + бледная rationale (исчезнет к кадру 10).
// CTA «Анализировать» снизу (тач → PRIMARY → REPAIR: «лезешь чинить»).

export function renderVerdict1(ctx) {
  const { el, copy, machine } = ctx;
  const c = copy.VERDICT_1;

  const cta = el('button', { class: 'seoul-cta', type: 'button', text: c.cta });
  cta.addEventListener('click', () => machine.dispatch('PRIMARY'));

  return el('section', { class: 'seoul-scene seoul-scene--verdict seoul-scene--verdict-1' }, [
    el('p', { class: 'seoul-context', text: c.run }),
    el('div', { class: 'seoul-zone-hero' }, [
      el('p', { class: 'seoul-word', text: c.word }),
    ]),
    el('div', { class: 'seoul-zone-readout' }, [
      el('p', { class: 'seoul-field', text: c.status }),
      el('p', { class: 'seoul-rationale' }, [
        el('span', { class: 'seoul-rationale__k', text: c.rationaleLabel }),
        ' ',
        el('span', { class: 'seoul-rationale__v', text: c.rationaleValue }),
      ]),
    ]),
    el('div', { class: 'seoul-zone-cta' }, [cta]),
  ]);
}
