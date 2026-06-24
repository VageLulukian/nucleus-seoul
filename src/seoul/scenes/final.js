// seoul/scenes/final.js — FINAL: холодный журнал прибытия (кадр 13, запись экрана; C2-D11).
// Не конфабуляция, а сухой журнал учёта: ARRIVAL LOGGED: SEOUL / LOCATION MATCHES FORECAST /
// USER COMFORT: OUT OF SCOPE. Циан/холод, БЕЗ красного и БЕЗ затвора — кат в чёрный на лице
// (кадр 14, script.md), не на экране. Та же манифест-сетка, что VERDICT_3/LOCKED. Снимается
// поверх реальной медиастены Инчхон Т1: величие Кореи за спиной (кадр 12) → ничтожный сухой
// итог системы (кадр 13). Кнопки нет: FINAL терминально (PRIMARY no-op, см. machine.js).

export function renderFinal(ctx) {
  const { el, copy } = ctx;
  const c = copy.FINAL;

  const mrow = (kv) => el('p', { class: 'seoul-mrow' }, [
    el('span', { class: 'seoul-mrow__k', text: kv.label }),
    el('span', { class: 'seoul-mrow__cell' }, [
      el('span', { class: 'seoul-mrow__v', text: kv.value }),
    ]),
  ]);

  return el('section', { class: 'seoul-scene seoul-scene--final' }, [
    el('div', { class: 'seoul-zone-manifest' }, [
      mrow(c.arrival),
      el('p', { class: 'seoul-finalmatch', text: c.match }),
      mrow(c.comfort),
    ]),
  ]);
}
