// seoul/scenes/final.js — FINAL: затвор → в чёрный (кадр 13, запись экрана).
// Холодная терминальная карточка: RESISTANCE: ACCOUNTED FOR (моно, англ.) +
// «Сопротивление было частью плана.» (рус., человеческая строка). Затем — медленный
// красный вдох → чёрный: это overlay #seoul-shutter (НАД сценой), анимируется CSS по
// html[data-state="FINAL"] (plan-review Codex #4: #viz ниже #scene, красным на canvas
// текст не закрыть). Конфабуляция (S-D2): твоё сопротивление уже было в модели.

export function renderFinal(ctx) {
  const { el, copy } = ctx;
  const c = copy.FINAL;

  return el('section', { class: 'seoul-scene seoul-scene--final' }, [
    el('div', { class: 'seoul-zone-final' }, [
      el('p', { class: 'seoul-tag', text: c.tag }),
      el('p', { class: 'seoul-finalline', text: c.line }),
    ]),
  ]);
}
