// visuals/background.js — Layer 0: фон-видео Higgsfield + canvas-фоллбэк (Шаг 3).
//
// Layer 0 (docs/03 §5, docs/09 §3/§10): ДВА предзагруженных ping-pong <video> (A/B)
// кроссфейдят лупы состояния ПОД canvas-HUD (#viz z1). Видео — ENHANCEMENT: без
// ассетов работает ТОЛЬКО фоллбэк-путь (canvas/CSS), семантика не меняется (D-5).
//
// ЗАГРУЗКА = fetch→blob, НЕ <video src="...mp4">: битый/несуществующий .mp4,
// выставленный как .src элемента, ловится capture-фазой error-хука (index.html) и
// спайкает #__errCount → валит smoke. fetch() 404 — это resolved non-ok, который мы
// глотаем → шов зелёный без ассетов. Blob = полностью забуференный = бесшовный
// kiosk-луп. Зеркалит fetch-прогрев аудио-движка (docs/04, нулевая латентность).
//
// ДЕТЕРМИНИЗМ (docs/02 §6.4, docs/01 §7.3): видео-reset живёт ТОЛЬКО здесь, его
// дёргает index.js reseed(toState, event) → enter(toState, event). Event-aware:
//   - смена src                          → ping-pong swap + opacity-кроссфейд + currentTime=0
//   - тот же src + in-story PRIMARY       → CONTINUITY (без reseek); LOCKED → pause()
//   - тот же src + RESET/JUMP/STEP/AUTO/init → ПРИНУДИТЕЛЬНО currentTime=0 (детерм. кадр)
//   - целевой LOCKED                      → currentTime=0 затем pause() (замороженный кадр)
// XOR R-13: если на этот вход играет Layer-2 transition — кроссфейд НЕ делаем
// (2 декода Layer-0 + 1 transition = 3 = KILL); hard-swap вместо кроссфейда.
//
// Окклюзия (P0): #viz (z1) каждый кадр заливает весь canvas цветом BASE → перекрыл
// бы z0-видео. Поэтому render() в видео-режиме (shown) ПРОПУСКАЕТ заливку BASE/
// depth/вигнетки — передние canvas-слои (сканлайны/кольца/ядро/частицы/глитч)
// рисуются поверх видео (index.js). Нет видео → фоллбэк-заливка как раньше.

import { createBlobCache, safePlay, safePause, instantStyle } from './media-utils.js';

const BASE = '#05070A'; // --bg-900 (docs/03 §2)

export function createBackground(config, opts) {
  const o = opts || {};
  // videoSource = { a: <video>, b: <video> } | null. Нет элементов (или ?selftest)
  // → чистый фоллбэк, поведение байт-идентично Шагу 1.
  const els = o.videoSource && o.videoSource.a && o.videoSource.b ? o.videoSource : null;
  const manifest = o.manifest || {}; // state → url (.mp4) | undefined
  const root = o.root || (typeof document !== 'undefined' ? document.documentElement : null);
  const freeze = o.freezeStates || new Set(); // состояния, где видео замораживается (LOCKED)
  const hasVideo = !!els;

  // --- Видео-состояние контроллера ---
  let activeEl = els ? els.a : null; // текущий показанный элемент
  let currentSrc = null; // ЛОГИЧЕСКИЙ url состояния (manifest), не blob — для same-src
  let currentState = null;
  let shown = false; // показан ли сейчас видео-фон (драйвит skip canvas-fill + isActive)
  let enterEpoch = 0; // монотонный токен — гасит протухшие canplaythrough/blob-колбэки

  // Мемоизация fetch→blob (404→null) — общий примитив media-utils. blobs.ready(url)
  // даёт СИНХРОННЫЙ срез для enter() (Promise sync-state не отдаёт).
  const blobs = createBlobCache();

  // setOpacity — мгновенно (instant=true: фоллбэк↔видео hard-flip / XOR-transition) или
  // через CSS-transition (видео↔видео кроссфейд 600ms == --dur-scene).
  function setOpacity(el, value, instant) {
    if (!el || !el.style) return;
    if (instant) {
      instantStyle(el, (n) => { n.style.opacity = value; });
    } else {
      el.style.opacity = value;
    }
  }

  function setVideoFlag(on) {
    if (!root || !root.dataset) return;
    if (on) root.dataset.video = 'on';
    else delete root.dataset.video;
  }

  // Тот же src уже показан: ветвление по event (контракт детерминизма).
  function applySameSrc(event, isFreeze) {
    if (!activeEl) return;
    if (event === 'PRIMARY') {
      // CONTINUITY: in-story-переход того же src — НЕ сикаем. LOCKED → заморозка.
      if (isFreeze) safePause(activeEl);
      // иначе оставляем играть (VERDICT=dimmed idle: приглушение — CSS-слой, не видео)
    } else {
      // RESET/JUMP/STEP_BACK/AUTO/initial → детерминированный кадр 0.
      try { activeEl.currentTime = 0; } catch (_) { /* ignore */ }
      if (isFreeze) safePause(activeEl);
      else safePlay(activeEl);
    }
  }

  // Смена src (или ещё не показан) — ping-pong на простаивающий элемент.
  function swapTo(blobUrl, logicalUrl, isFreeze, transitionActive, myEpoch) {
    const incoming = activeEl === els.a ? els.b : els.a;
    const wasShown = shown;
    const outgoing = wasShown ? activeEl : null;
    if (outgoing === incoming) return; // защита (не должно случиться при 2 элементах)

    const reveal = () => {
      if (myEpoch !== enterEpoch) return; // вытеснён более новым enter()
      try { incoming.currentTime = 0; } catch (_) { /* ignore */ }
      if (isFreeze) safePause(incoming);
      else safePlay(incoming);
      setVideoFlag(true);
      // Кроссфейд (opacity 600ms) ТОЛЬКО видео↔видео и без активного Layer-2 transition.
      const smooth = wasShown && !!outgoing && !transitionActive;
      setOpacity(incoming, '1', !smooth); // фоллбэк→видео / XOR → мгновенно (canvas прикрывал)
      if (outgoing) {
        setOpacity(outgoing, '0', !smooth);
        if (smooth) {
          const done = () => {
            outgoing.removeEventListener('transitionend', done);
            // ГОНКА (Codex code-review): за 600ms кроссфейда быстрый RESET/JUMP/STEP
            // мог ПЕРЕ-использовать этот же элемент как НОВЫЙ activeEl (ping-pong).
            // Протухший transitionend НЕ должен паузить уже-видимый луп — паузим
            // ТОЛЬКО если элемент всё ещё не активный (реально исходящий).
            if (outgoing !== activeEl) safePause(outgoing);
          };
          outgoing.addEventListener('transitionend', done);
        } else {
          safePause(outgoing);
        }
      }
      activeEl = incoming;
      currentSrc = logicalUrl;
      shown = true;
    };

    // Этот элемент УЖЕ держит ИМЕННО этот blob и декодирован (ping-pong reuse того
    // же src, objectURL мемоизирован) — показываем сразу. ИНАЧЕ ВСЕГДА назначаем
    // новый src ПЕРЕД ожиданием (иначе reveal() на readyState>=4 показал бы СТАРЫЙ
    // буфер элемента — мигание чужого лупа на кадр).
    if (incoming.getAttribute('src') === blobUrl && incoming.readyState >= 4) {
      reveal();
      return;
    }
    const onReady = () => {
      incoming.removeEventListener('canplaythrough', onReady);
      reveal();
    };
    incoming.addEventListener('canplaythrough', onReady);
    incoming.src = blobUrl; // новый src → старт декода (readyState→0); reveal по canplaythrough
  }

  // Состояние без видео-ассета → увести видео, показать canvas-фоллбэк.
  function hideCurrent() {
    if (shown && activeEl) {
      setOpacity(activeEl, '0', true); // мгновенно — canvas заливка перекроет в этом же кадре
      safePause(activeEl);
    }
    setVideoFlag(false);
    shown = false;
    currentSrc = null;
  }

  return {
    mode: hasVideo ? 'video' : 'fallback',
    hasVideo,
    selectSource(state) {
      return hasVideo && manifest[state] ? 'video' : 'fallback';
    },

    // preload() — прогрев fetch→blob всех уникальных url манифеста (READY-gate).
    // Никогда не reject (allSettled + blobs.get глотает). Без видео → resolved.
    preload() {
      if (!hasVideo) return Promise.resolve([]);
      const urls = [];
      for (const k in manifest) {
        if (manifest[k] && urls.indexOf(manifest[k]) === -1) urls.push(manifest[k]);
      }
      return Promise.allSettled(urls.map((u) => blobs.get(u)));
    },

    // enter(toState, event, transitionActive) — дёргается из reseed на КАЖДОМ переходе.
    enter(toState, event, transitionActive) {
      if (!hasVideo) return; // чистый фоллбэк
      currentState = toState;
      const myEpoch = ++enterEpoch;
      const desired = manifest[toState] || null;
      const isFreeze = freeze.has(toState);
      if (!desired) {
        hideCurrent(); // нет ассета состояния → canvas-фоллбэк (cyan/red вигнетка)
        return;
      }
      if (desired === currentSrc && shown) {
        applySameSrc(event, isFreeze); // тот же src уже показан
        return;
      }
      // Смена src. Если целевой blob УЖЕ готов (предзагружен на READY-gate) — кроссфейд
      // (старый держим до canplaythrough — плавно, без дыры). ИНАЧЕ (нет ассета / ещё
      // грузится) — СРАЗУ увести старое видео в canvas-фоллбэк: иначе render() (shown=
      // true) пропускал бы заливку и ЧУЖОЙ луп тёк бы поверх нового состояния (P2 Codex
      // r2: cyan-scan НЕ должен течь в красный ALERT-fallback, пока резолвится 404).
      // Подменим, когда/если blob успешно догрузится (epoch-guard).
      const readyBlob = blobs.ready(desired);
      if (readyBlob) {
        swapTo(readyBlob, desired, isFreeze, transitionActive, myEpoch);
        return;
      }
      hideCurrent(); // нет готового ассета → немедленный фоллбэк, без утечки старого лупа
      blobs.get(desired).then((blobUrl) => {
        if (myEpoch !== enterEpoch) return; // вытеснён более новым enter()
        if (!blobUrl) return; // нет ассета → остаёмся в canvas-фоллбэке (уже скрыто)
        swapTo(blobUrl, desired, isFreeze, transitionActive, myEpoch);
      });
    },

    isActive() {
      return shown;
    },

    render(env) {
      const { ctx, w, h, vt, accent, isAlert, rgba } = env;
      if (!ctx) return;
      // ВИДЕО-режим: пропустить полно-canvas заливку — z0-видео видно сквозь
      // прозрачный (после clearRect в index.js) #viz; передние слои рисуются поверх.
      if (shown) return;

      // --- Фоллбэк-путь (canvas-вигнетка) — без изменений семантики (D-5) ---
      // База.
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, w, h);

      // Вертикальная глубина: чуть приподнятый верх → самый тёмный низ («корпус»).
      const depth = ctx.createLinearGradient(0, 0, 0, h);
      depth.addColorStop(0, rgba('#0A0E14', 0.55));
      depth.addColorStop(0.5, rgba(BASE, 0));
      depth.addColorStop(1, rgba(BASE, 0.6));
      ctx.fillStyle = depth;
      ctx.fillRect(0, 0, w, h);

      // Радиальная accent-вигнетка от центра ядра (база; основное свечение даёт
      // гало ядра в core.js — здесь лишь мягкая подложка, чтобы не двоить яркость).
      const cx = w / 2;
      const cy = h * 0.42;
      const r = Math.max(w, h) * 0.75;
      let intensity = 0.05;
      if (isAlert) {
        // Пульс красного ~0.75с (docs/03 §7): тревожно, но не строб.
        intensity = 0.09 + 0.05 * Math.abs(Math.sin((vt / 1000) * (Math.PI / 0.75)));
      }
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, rgba(accent, intensity));
      g.addColorStop(1, rgba(BASE, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },

    destroy() {
      enterEpoch += 1; // погасить любые ожидающие колбэки
      if (els) {
        safePause(els.a);
        safePause(els.b);
      }
      blobs.revokeAll();
    },
  };
}
