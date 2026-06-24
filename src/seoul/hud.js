// seoul/hud.js — постоянная HUD-кромка «Сеула» (вертикаль, screen.md §3).
// Верхний бар: wordmark/заголовок слева (state-aware) + сессия справа; нижний
// футер-хайрлайн. Заголовок меняется в техн. режиме (NUCLEUS · MAINTENANCE / ·
// RUNTIME) — подписка на машину. Угловые скобки/линии — в CSS (seoul.html).

export function createHud(opts) {
  const machine = opts && opts.machine;
  const mount = opts && opts.mount;
  const copy = opts && opts.copy;
  if (!mount || !copy) return { destroy() {} };

  function titleFor(state) {
    if (state === 'REPAIR') return copy.HUD.maintenance;
    if (state === 'SETTINGS') return copy.HUD.runtime;
    return copy.HUD.wordmark;
  }

  const wordmark = document.createElement('div');
  wordmark.className = 'seoul-hud__wordmark';
  wordmark.textContent = copy.HUD.wordmark;

  const session = document.createElement('div');
  session.className = 'seoul-hud__session';
  session.textContent = copy.HUD.session;

  const top = document.createElement('div');
  top.className = 'seoul-hud seoul-hud--top';
  top.appendChild(wordmark);
  top.appendChild(session);

  const bottom = document.createElement('div');
  bottom.className = 'seoul-hud seoul-hud--bottom';
  bottom.textContent = copy.HUD.footer;

  mount.appendChild(top);
  mount.appendChild(bottom);

  let unsubscribe = function () {};
  if (machine && typeof machine.subscribe === 'function') {
    const apply = (state) => { wordmark.textContent = titleFor(state); };
    apply(machine.getState());
    unsubscribe = machine.subscribe((rec) => apply(rec.to));
  }

  return {
    destroy() {
      unsubscribe();
      if (top.parentNode) top.parentNode.removeChild(top);
      if (bottom.parentNode) bottom.parentNode.removeChild(bottom);
    },
  };
}
