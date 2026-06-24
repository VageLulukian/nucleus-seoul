// seoul/scenes/verdict3.js — VERDICT_3 / самый сухой приговор (кадр 10, запись экрана).
// Чистый режим, манифест деплоя — самый холодный и стриптый. ПЕРВОЕ появление
// красного: строка ROLLBACK: NOT RECOMMENDED ● — холодный красный (LED + слова) =
// «откату не подлежит». Без тряски/сирены, статично (screen.md §2/§5/§8).
// Объяснений НЕТ (explainability выключен в кадре 9): rationale отсутствует,
// EXPLAINABILITY: OFF показывается КАНОНИЧЕСКИ всегда (тихое эхо, пейофф уже
// случился в кадре 9 — устойчиво и при прямом прыжке forceState, plan-review Codex).
// CTA не показываем (запись экрана манифеста); PRIMARY (печать/затвор)→FINAL —
// операторский (клавиатура/тач), как в графе §4.

export function renderVerdict3(ctx) {
  const { el, copy } = ctx;
  const c = copy.VERDICT_3;

  const mrow = (kv, alert) => el(
    'p',
    { class: alert ? 'seoul-mrow seoul-mrow--alert' : 'seoul-mrow' },
    [
      el('span', { class: 'seoul-mrow__k', text: kv.label }),
      // value + LED живут в ОДНОЙ правой ячейке грида (иначе третий ребёнок
      // переносится на новую грид-линию и красная точка уезжает влево).
      el('span', { class: 'seoul-mrow__cell' }, [
        el('span', { class: 'seoul-mrow__v', text: kv.value }),
        alert ? el('span', { class: 'seoul-mrow__led', 'aria-hidden': 'true' }) : null,
      ]),
    ],
  );

  return el('section', { class: 'seoul-scene seoul-scene--verdict seoul-scene--verdict-3' }, [
    el('div', { class: 'seoul-zone-manifest' }, [
      mrow(c.nextStep, false),
      mrow(c.status, false),
      mrow(c.rollback, true), // ← единственная красная строка кадра 10
      mrow(c.explainability, false),
    ]),
  ]);
}
