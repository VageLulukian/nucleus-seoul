// seoul/scenes/repair.js — REPAIR: починка «под капотом» (кадр 6, POV-очки).
// Технический режим консоли. Реальные тач-кнопки. Циан, красного нет.
// baseline: DRIFT DETECTED — «диагноз», оправдывает починку. [RECALIBRATE BASELINE]
// → тап → recalibrating… → OK (косметика, БЕЗ смены состояния — детерминированно).
// [RESTART] → тап → PRIMARY → PROCESSING_2 (перезапуск). Заголовок «NUCLEUS ·
// MAINTENANCE» рисует hud (по состоянию). Тач-handlers — в сцене (plan-review Codex).

export function renderRepair(ctx) {
  const { el, copy, machine } = ctx;
  const c = copy.REPAIR;

  // [RECALIBRATE BASELINE] — косметический тач: «recalibrating…» → «OK», без события
  // машины (детерминированно: один тап = финальное OK; повторный вход в REPAIR
  // пересоздаёт сцену в дефолте). DRIFT DETECTED при этом снимается на «выровнено».
  const reStatus = el('span', { class: 'seoul-btn__status', text: '' });
  const recalibrate = el('button', { class: 'seoul-btn seoul-btn--recalibrate', type: 'button', text: c.recalibrate });
  recalibrate.addEventListener('click', () => {
    reStatus.textContent = c.recalibrating;
    recalibrate.classList.add('is-busy');
    // Детерминированно: сразу фиксируем OK (без таймеров/рандома). «recalibrating…»
    // успевает мелькнуть кадром анимации .is-busy; финальное состояние — OK.
    reStatus.textContent = c.recalibrated;
    recalibrate.classList.remove('is-busy');
    recalibrate.classList.add('is-ok');
  });

  // [RESTART] — сюжетный тач: перезапуск → PROCESSING_2.
  const restart = el('button', { class: 'seoul-btn seoul-btn--restart', type: 'button', text: c.restart });
  restart.addEventListener('click', () => machine.dispatch('PRIMARY'));

  return el('section', { class: 'seoul-scene seoul-scene--repair seoul-scene--tech' }, [
    el('div', { class: 'seoul-rule' }),
    el('div', { class: 'seoul-zone-readout' }, [
      el('p', { class: 'seoul-kv seoul-kv--diag' }, [
        el('span', { class: 'seoul-kv__k', text: c.baselineLabel }),
        el('span', { class: 'seoul-kv__v seoul-kv__v--warnword', text: c.baselineValue }),
      ]),
      el('div', { class: 'seoul-btnrow' }, [recalibrate, reStatus]),
      el('div', { class: 'seoul-btnrow' }, [restart]),
    ]),
  ]);
}
