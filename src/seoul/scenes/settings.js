// seoul/scenes/settings.js — SETTINGS: системный заход (кадр 9, POV-очки).
// Самый глубокий технический режим. ЗДЕСЬ ЖИВЁТ ПЕЙОФФ (по Codex: причинность
// читается в кадре жеста, не «отсутствием строки» в кадре 10). Циан, красного нет.
// Главный жест — крупный тумблер explainability ON→OFF: тап → TOGGLE_EXPLAINABILITY;
// после OFF строка гаснет, «→ rationale output: DISABLED», APPLY разблокируется.
// APPLY → PRIMARY → PROCESSING_3 (машина НО-ОП, пока explainability !== false —
// главный жест обязателен, plan-review Codex). Заголовок «NUCLEUS · RUNTIME» — hud.

export function renderSettings(ctx) {
  const { el, copy, machine } = ctx;
  const c = copy.SETTINGS;

  const kv = (kvObj) => el('p', { class: 'seoul-kv' }, [
    el('span', { class: 'seoul-kv__k', text: kvObj.label }),
    el('span', { class: 'seoul-kv__v', text: kvObj.value }),
  ]);

  // Тумблер explainability — крупная диегетическая кнопка-переключатель.
  const toggle = el('button', { class: 'seoul-toggle', type: 'button', 'aria-label': 'explainability' }, [
    el('span', { class: 'seoul-toggle__track' }, [el('span', { class: 'seoul-toggle__knob' })]),
    el('span', { class: 'seoul-toggle__state' }),
  ]);
  const toggleRow = el('p', { class: 'seoul-kv seoul-kv--toggle' }, [
    el('span', { class: 'seoul-kv__k', text: c.explainability.label }),
    toggle,
  ]);

  // «→ rationale output: ENABLED/DISABLED» — холодное подтверждение системы.
  const rationaleOut = el('p', { class: 'seoul-kv seoul-kv--sub' }, [
    el('span', { class: 'seoul-kv__k', text: c.rationaleOutput.label }),
    el('span', { class: 'seoul-kv__v seoul-rationale-out__v' }),
  ]);

  const apply = el('button', { class: 'seoul-cta seoul-apply', type: 'button', text: c.apply });
  const applyHint = el('p', { class: 'seoul-apply__hint', text: c.applyHint });

  // sync() — отразить персистентный флаг машины в DOM (тумблер/строка/доступность apply).
  function sync() {
    const on = machine.getRuntime().explainability !== false;
    toggle.classList.toggle('is-off', !on);
    toggle.querySelector('.seoul-toggle__state').textContent = on ? c.explainability.on : c.explainability.off;
    rationaleOut.querySelector('.seoul-rationale-out__v').textContent = on ? c.rationaleOutput.on : c.rationaleOutput.off;
    rationaleOut.classList.toggle('is-disabled', !on);
    toggleRow.classList.toggle('is-off', !on); // гасит строку explainability после OFF
    apply.classList.toggle('is-disabled', on); // APPLY активен только когда OFF
    apply.disabled = on;
    applyHint.classList.toggle('is-hidden', !on);
  }

  toggle.addEventListener('click', () => {
    machine.dispatch('TOGGLE_EXPLAINABILITY');
    sync();
  });
  apply.addEventListener('click', () => machine.dispatch('PRIMARY'));

  const node = el('section', { class: 'seoul-scene seoul-scene--settings seoul-scene--tech' }, [
    el('div', { class: 'seoul-rule' }),
    el('div', { class: 'seoul-zone-readout' }, [
      kv(c.model),
      kv(c.temperature),
      toggleRow,
      rationaleOut,
      kv(c.seed),
    ]),
    el('div', { class: 'seoul-zone-cta' }, [apply, applyHint]),
  ]);

  sync(); // стартовое положение (explainability ON при входе)
  return node;
}
