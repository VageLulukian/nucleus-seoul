// seoul/scenes/final.js — FINAL: холодный журнал прибытия (кадр 13, запись экрана; C2-D11).
// Сухой журнал учёта по-русски (фидбэк оператора 2026-06-24, override билингв-канона):
// ПРИБЫТИЕ ЗАФИКСИРОВАНО: СЕУЛ / ЛОКАЦИЯ СОВПАДАЕТ С ПРОГНОЗОМ / КОМФОРТ ПОЛЬЗОВАТЕЛЯ:
// ВНЕ ЗОНЫ ОТВЕТСТВЕННОСТИ. Фон — «дорогой» неон-Сеул (VIDEO_MANIFEST.FINAL), поверх
// скрим+холодный русский журнал: роскошный город → казённый итог = тот же движок шутки.
// БЕЗ красного и БЕЗ затвора — кат в чёрный на лице (кадр 14, script.md), не на экране.
// Кнопки нет: FINAL терминально (PRIMARY no-op, см. machine.js).

export function renderFinal(ctx) {
  const { el, copy } = ctx;
  const c = copy.FINAL;

  // Премиум-журнал (фидбэк оператора 2026-06-24): стопкой — бледный казённый лейбл
  // сверху, крупное значение снизу. Робастно к длинному русскому («ВНЕ ЗОНЫ
  // ОТВЕТСТВЕННОСТИ» в прежнюю однострочную grid-сетку не влезал). variant задаёт
  // регистр значения: final-hero = крупно/ярко (СЕУЛ — панчлайн города), final-kicker =
  // суше/мельче (холодный добивающий итог). Структура k/cell/v сохранена — selftest якорит на .value.
  const mrow = (kv, variant) => el('p', { class: 'seoul-mrow seoul-mrow--final' + (variant ? ' seoul-mrow--' + variant : '') }, [
    el('span', { class: 'seoul-mrow__k', text: kv.label }),
    el('span', { class: 'seoul-mrow__cell' }, [
      el('span', { class: 'seoul-mrow__v', text: kv.value }),
    ]),
  ]);

  return el('section', { class: 'seoul-scene seoul-scene--final' }, [
    el('div', { class: 'seoul-zone-manifest' }, [
      mrow(c.arrival, 'final-hero'),
      el('p', { class: 'seoul-finalmatch', text: c.match }),
      mrow(c.comfort, 'final-kicker'),
    ]),
  ]);
}
