// seoul/scenes/locked.js — LOCKED: печать решения «залочено» (между VERDICT_3 и FINAL;
// фидбэк оператора 2026-06-24). Холодный deploy-консольный манифест: ЧТО именно
// запечатано (NEXT STEP / COMMIT / ROLLBACK / SIGNATURE) + человеческая строка.
// Циан/холод, БЕЗ красного и БЕЗ alert-класса — красный остаётся ровно дважды (строка
// ROLLBACK кадра 10 + затвор FINAL). Зеркалит сетку verdict3 (.seoul-mrow) + карточку
// final. Это НЕ брачная шутка LOCKED ролика №1 — у «Сеула» свой холодный голос. Кнопки
// нет: PRIMARY (тач/клавиша) → FINAL операторский. Видео нет (canvas-only «запечатано»).

export function renderLocked(ctx) {
  const { el, copy } = ctx;
  const c = copy.LOCKED;

  const mrow = (kv) => el('p', { class: 'seoul-mrow' }, [
    el('span', { class: 'seoul-mrow__k', text: kv.label }),
    el('span', { class: 'seoul-mrow__cell' }, [
      el('span', { class: 'seoul-mrow__v', text: kv.value }),
    ]),
  ]);

  return el('section', { class: 'seoul-scene seoul-scene--locked' }, [
    el('div', { class: 'seoul-zone-manifest seoul-lockcard' }, [
      el('p', { class: 'seoul-locktag', text: c.tag }),
      ...c.rows.map(mrow),
      el('p', { class: 'seoul-lockline', text: c.line }),
    ]),
  ]);
}
