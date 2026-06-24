// visuals/media-utils.js — общие медиа-примитивы видео-слоёв (рефакторинг 2026-06-11).
//
// До рефакторинга fetch→blob-мемоизация, safePause и reflow-трюк «применить стиль
// без CSS-transition» были продублированы байт-в-байт в background.js (Layer 0)
// и transitions.js (Layer 2). Здесь — единственная копия; семантика сохранена.
//
// DOM-free верхний уровень: ни одного обращения к document/window на eval модуля;
// браузер-API (fetch/URL) резолвятся лениво внутри функций — node импортирует
// модуль без падения (logic-tests проверяет экспорт).

/**
 * safePlay — el.play() с проглотом reject'а (автоплей/декод-сбой не валит
 * #__errCount; политика «деградируем молча» — docs/07 §4/§8).
 */
export function safePlay(el) {
  if (!el || typeof el.play !== 'function') return;
  const p = el.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

/** safePause — el.pause() с проглотом throw (идемпотентен на любом состоянии). */
export function safePause(el) {
  if (el && typeof el.pause === 'function') {
    try { el.pause(); } catch (_) { /* ignore */ }
  }
}

/**
 * instantStyle — применить стили МГНОВЕННО, мимо CSS-transition элемента:
 * transition:'none' → apply(el) → форс-reflow (применяет 'none' до восстановления).
 * Нужен видео-слоям: hard-flip opacity/display без 400–600ms кроссфейда.
 * @param {Element}  el
 * @param {Function} apply — (el) => мутации el.style
 */
export function instantStyle(el, apply) {
  if (!el || !el.style) return;
  const prev = el.style.transition;
  el.style.transition = 'none';
  apply(el);
  // eslint-disable-next-line no-unused-expressions
  el.offsetWidth; // reflow до восстановления transition
  el.style.transition = prev || '';
}

/**
 * createBlobCache — мемоизация fetch→blob→objectURL по url (404-safe: non-ok/сбой
 * → null, БЕЗ throw — битый/отсутствующий ассет не спайкает #__errCount).
 * get(url) — промис objectURL|null (кеширован); ready(url) — СИНХРОННЫЙ срез
 * последнего settle (null = «ещё не готов» ИЛИ «ассета нет» — вызывающие не
 * различают, поведение прежнее); revokeAll() — отзыв всех objectURL (destroy).
 */
export function createBlobCache() {
  const promises = new Map(); // url → Promise<objectURL|null>
  const settled = new Map(); // url → objectURL|null (СИНХРОННО, после settle)
  return {
    get(url) {
      if (!url || typeof fetch !== 'function') return Promise.resolve(null);
      if (promises.has(url)) return promises.get(url);
      const p = fetch(url)
        .then((r) => (r && r.ok ? r.blob() : null))
        .then((b) => (b && typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(b) : null))
        .catch(() => null)
        .then((objUrl) => {
          settled.set(url, objUrl || null);
          return objUrl || null;
        });
      promises.set(url, p);
      return p;
    },
    ready(url) {
      const v = settled.get(url);
      return v == null ? null : v;
    },
    revokeAll() {
      if (typeof URL === 'undefined' || !URL.revokeObjectURL) return;
      for (const p of promises.values()) {
        Promise.resolve(p).then((u) => { if (u) URL.revokeObjectURL(u); }).catch(() => {});
      }
    },
  };
}
