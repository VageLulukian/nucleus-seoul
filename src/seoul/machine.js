// seoul/machine.js — детерминированный сценарный автомат экрана «Сеул» (ролик №2).
//
// ФОРК паттерна src/state/machine.js под СВОЙ граф (screen.md §4), а НЕ
// переиспользование общего автомата: у ролика №1 + спутника общий enum
// STATES/PRIMARY_TARGETS/JUMP замкнут в createMachine() и наружу не отдан, граф
// у них ОДИН и тот же — поэтому спутник берёт createMachine целиком. У «Сеула»
// граф ДРУГОЙ (PROCESSING_1..3 / VERDICT_1..3 / REPAIR / SETTINGS / FINAL), а
// мутировать общий machine.js НЕЛЬЗЯ (на нём висит бит-в-бит синхрон ролика №1 и
// спутника — docs/11 §B, C2-D8). Решение plan-review (Codex, 2026-06-24): форк с
// ТЕМ ЖЕ публичным контрактом, скопировав примитивы:
//   - монотонный stateEpoch + атомарная transition() = teardown → ++epoch → setup;
//   - epoch-захваченное планирование авто-перехода + tick(now) (фаер только если
//     now>=fireAt И epoch===stateEpoch) — убивает осиротевшие таймеры (docs/02 §10);
//   - инжектированный детерминированный clock → trace {t, from, to, event, epoch};
//   - READY-gate: старт в LOADING; markReady() → BOOT → IDLE (авто @ T_BOOT).
//
// DOM-free и зависимости-инжектируемые (как оригинал): ни одного обращения к
// document/window; config и (опц.) audio приходят через фабрику.
//
// Отличия графа «Сеула» от ролика №1 (screen.md §4):
//   - PROCESSING_1/2/3 — «пафосная обработка» (аналог SCAN: кольца + счётчик +
//     статус-строки), авто-переход в свой VERDICT;
//   - REPAIR / SETTINGS — диегетические подэкраны «под капотом» (кадры 6/9);
//   - VERDICT_3 — третий вердикт без паники (красный только в строке ROLLBACK, §5);
//   - FINAL — терминальная карточка → красный затвор (кадр 13);
//   - explainability — персистентный runtime-флаг (живёт в замыкании, как muted в
//     аудио — переживает teardown; сбрасывается RESET). Тумблер OUT кадра 9 = пейофф;
//   - SETTINGS→PROCESSING_3 (apply) НО-ОП, пока explainability !== false: главный
//     жест «выключи объяснения» обязателен, иначе оператор проскочит пейофф
//     (plan-review Codex, SPEC).

// --- Полный enum состояний «Сеула» (screen.md §4). ---------------------------
export const STATES = Object.freeze({
  LOADING: 'LOADING',
  BOOT: 'BOOT',
  IDLE: 'IDLE',
  PROCESSING_1: 'PROCESSING_1', // кадр 3
  VERDICT_1: 'VERDICT_1',       // кадр 4 — RUN 01, одиночный SEOUL
  REPAIR: 'REPAIR',             // кадр 6 — RECALIBRATE / RESTART
  PROCESSING_2: 'PROCESSING_2',
  VERDICT_2: 'VERDICT_2',       // кадр 7 — RUN 02 // CONFIRMED, сверка+штамп
  SETTINGS: 'SETTINGS',         // кадр 9 — тумблер explainability → OFF
  PROCESSING_3: 'PROCESSING_3',
  VERDICT_3: 'VERDICT_3',       // кадр 10 — сухой манифест + красный ROLLBACK
  LOCKED: 'LOCKED',             // печать решения «залочено» — manifest SEALED (между VERDICT_3 и FINAL)
  FINAL: 'FINAL',               // кадр 13 — RESISTANCE → красный затвор → в чёрный
});

// Капчур-состояния (8) — то, что снимается/проверяется покадрово (screen.md §5).
// forceState() пускает прыжок ТОЛЬКО сюда; selftest/Playwright бьют по ним.
export const CAPTURE_STATES = Object.freeze([
  STATES.PROCESSING_1, STATES.VERDICT_1, STATES.REPAIR, STATES.VERDICT_2,
  STATES.SETTINGS, STATES.VERDICT_3, STATES.LOCKED, STATES.FINAL,
]);

// --- События. FULLSCREEN перечислен для ПАРИТЕТА словаря ввода (controls.js
// keyToEvent выдаёт 'FULLSCREEN'), но dispatch() его НЕ обрабатывает (default →
// no-op): controls.js маршрутизирует FULLSCREEN в onFullscreen-хук, не в машину
// (DOM-концерн). TOGGLE_EXPLAINABILITY диспатчит тумблер сцены SETTINGS (тач), не клавиатура.
export const EVENTS = Object.freeze({
  PRIMARY: 'PRIMARY',
  RESET: 'RESET',
  JUMP_1: 'JUMP_1',
  JUMP_2: 'JUMP_2',
  JUMP_3: 'JUMP_3',
  JUMP_4: 'JUMP_4',
  JUMP_5: 'JUMP_5',
  STEP_BACK: 'STEP_BACK',
  TOGGLE_EXPLAINABILITY: 'TOGGLE_EXPLAINABILITY',
  MUTE: 'MUTE',
  REPLAY_VOICE: 'REPLAY_VOICE',
  FULLSCREEN: 'FULLSCREEN',
});

// PRIMARY двигает сюжет (screen.md §4): прямые цели transition()-setup'а.
// PROCESSING_* / LOADING / BOOT / FINAL НЕ в карте → PRIMARY там no-op (в обработке
// кнопки нет, FINAL терминально). SETTINGS→PROCESSING_3 — в карте, но ДОПОЛНИТЕЛЬНО
// гейтится тумблером explainability OFF (см. dispatch PRIMARY). LOCKED → FINAL —
// после экрана «залочено» оператор тапает в красный затвор.
const PRIMARY_TARGETS = Object.freeze({
  [STATES.IDLE]: STATES.PROCESSING_1,
  [STATES.VERDICT_1]: STATES.REPAIR,      // «лезешь чинить»
  [STATES.REPAIR]: STATES.PROCESSING_2,   // RESTART → повторный прогон
  [STATES.VERDICT_2]: STATES.SETTINGS,    // «значит, глубже»
  [STATES.SETTINGS]: STATES.PROCESSING_3, // apply (после explainability→OFF)
  [STATES.VERDICT_3]: STATES.LOCKED,      // печать → экран «залочено»
  [STATES.LOCKED]: STATES.FINAL,          // «залочено» → красный затвор
});

// JUMP_n (клавиши 1–5 через общий controls.js) → 5 ключевых капчур-состояний.
// Полное покрытие 7 (включая POV-кадры REPAIR/SETTINGS) — через forceState(name).
const JUMP_TARGETS = Object.freeze({
  JUMP_1: STATES.VERDICT_1,    // кадр 4
  JUMP_2: STATES.VERDICT_2,    // кадр 7
  JUMP_3: STATES.VERDICT_3,    // кадр 10
  JUMP_4: STATES.FINAL,        // кадр 13
  JUMP_5: STATES.PROCESSING_1, // кадр 3
});

// STEP_BACK — «на один бит назад» (операторская пересъёмка). Реверс PRIMARY-цепочки
// по граничным НЕ-обработочным узлам; PROCESSING_* / IDLE / LOADING / BOOT → нет цели.
const STEP_BACK_TARGETS = Object.freeze({
  [STATES.VERDICT_1]: STATES.IDLE,
  [STATES.REPAIR]: STATES.VERDICT_1,
  [STATES.VERDICT_2]: STATES.REPAIR,
  [STATES.SETTINGS]: STATES.VERDICT_2,
  [STATES.VERDICT_3]: STATES.SETTINGS,
  [STATES.LOCKED]: STATES.VERDICT_3,
  [STATES.FINAL]: STATES.LOCKED,
});

// Состояния с «текущей репликой» для REPLAY_VOICE — вердикты. v1 нем (no-op аудио),
// матрица оставлена как шов на случай озвучивания блипов (screen.md §4).
const REPLAY_VOICE_STATES = new Set([
  STATES.VERDICT_1, STATES.VERDICT_2, STATES.VERDICT_3,
]);

// Округление счётчика-доминанты «processing X.X TB…» до одного знака (детерминированно).
const round1 = (x) => Math.round(x * 10) / 10;

// Внутренний no-op звук, если адаптер не инжектирован: «Сеул» по умолчанию НЕМ
// (звук кладётся в монтаже, screen.md §4 / D-14). Держит машину автономной/DOM-free.
function nullAudio() {
  return {
    audioUnlocked: false,
    muted: false,
    unlock() {},
    play() {},
    stop() {},
    duck() {},
    setMuted(v) { this.muted = !!v; return this.muted; },
    toggleMuted() { this.muted = !this.muted; return this.muted; },
  };
}

/**
 * Фабрика сценарного автомата «Сеула».
 * @param {object}   opts
 * @param {object}   opts.config — константы (seoul/config.js): TIMING + SCAN_TIMELINE.
 * @param {Function} [opts.now]  — источник реального времени (мс). Задан → clock
 *   синхронится из него (продакшн); НЕ задан → чистый инжектируемый clock
 *   (детерминный харнесс, как спутник: now:undefined в ?selftest).
 * @param {object}   [opts.audio]— аудио-адаптер. По умолчанию нем (nullAudio).
 */
export function createMachine(opts) {
  const config = opts && opts.config;
  if (!config || !config.TIMING) {
    throw new Error('createMachine(seoul): requires { config } with TIMING');
  }
  const injectedNow = opts && typeof opts.now === 'function' ? opts.now : null;
  const audio = (opts && opts.audio) || nullAudio();

  // Авто-переходы по таймеру (screen.md §4). Длительности — в config (СЕКУНДЫ).
  const AUTO = {
    [STATES.BOOT]: { durMs: config.TIMING.T_BOOT * 1000, target: STATES.IDLE },
    [STATES.PROCESSING_1]: { durMs: config.TIMING.T_PROC_1 * 1000, target: STATES.VERDICT_1 },
    [STATES.PROCESSING_2]: { durMs: config.TIMING.T_PROC_2 * 1000, target: STATES.VERDICT_2 },
    [STATES.PROCESSING_3]: { durMs: config.TIMING.T_PROC_3 * 1000, target: STATES.VERDICT_3 },
  };

  // Покадровое расписание «обработки» (аналог docs/02 §12, но легче: только смена
  // статус-строк — кольца/счётчик считаются closed-form от vt в визуале/сцене).
  const SCAN_TL = config.SCAN_TIMELINE || {};

  // --- Внутреннее состояние ---
  let current = STATES.LOADING;
  let ready = false;
  let stateEpoch = 0;
  let clockMs = 0;
  let stateEnteredAt = 0;
  let pending = null;       // {fireAt, epoch, target} | null
  const scheduled = [];     // epoch-захваченные шаги расписания обработки
  let scanProgress = null;  // снимок прогресса текущей PROCESSING для сцен; null вне неё

  // Персистентный runtime-флаг (screen.md §5 кадр 9). Живёт в замыкании, как muted
  // в аудио — teardown его НЕ трогает; сбрасывает только RESET / initial.
  let explainability = true;

  const trace = [];
  const subscribers = [];

  function clock() { return clockMs; }

  function syncClock(nowArg) {
    if (typeof nowArg === 'number') clockMs = nowArg;
    else if (injectedNow) clockMs = injectedNow();
  }

  function notify(rec) {
    for (const fn of subscribers) fn(rec);
  }

  // teardown — отменить/остановить ВСЁ отложенное (docs/02 §10). Идемпотентен.
  // explainability НЕ трогаем (персистентный флаг, как audio.muted).
  function teardown() {
    pending = null;
    scheduled.length = 0;
    scanProgress = null;
    audio.stop();
  }

  // Расписание «обработки» (легче скана ролика №1: только статус-строки).
  function scheduleProc(stateId, t0) {
    const tl = SCAN_TL[stateId];
    if (!tl) return;
    const at = (sec) => t0 + sec * 1000;
    const ep = stateEpoch;
    for (let i = 0; i < tl.statusLines.length; i += 1) {
      scheduled.push({
        fireAt: at(i * tl.statusLineInterval), epoch: ep,
        kind: 'status', value: tl.statusLines[i], fired: false,
      });
    }
    // Счётчик-доминанта «processing X.X TB…» считается ВВЕРХ дискретными шагами,
    // равномерно по ВСЕЙ длительности (не по statusLineInterval) — число лезет весь
    // бит, без мёртвой паузы после последней статус-строки. Те же epoch-захваченные
    // scheduled[] (детерминизм, без vt/Date.now). Последний шаг (j=countSteps) попадает
    // на duration и даёт ровно countTo (канон 4.2 TB); fireScheduledDue() идёт ДО
    // fireDue() в tick() — значит финальное число применяется до авто-перехода.
    if (tl.countTo && tl.countSteps) {
      for (let j = 1; j <= tl.countSteps; j += 1) {
        scheduled.push({
          fireAt: at((j / tl.countSteps) * tl.duration), epoch: ep,
          kind: 'count', value: round1(tl.countTo * (j / tl.countSteps)), fired: false,
        });
      }
    }
  }

  function applyProcStep(step) {
    if (!scanProgress) return;
    if (step.kind === 'status') scanProgress.statusLine = step.value;
    else if (step.kind === 'count') scanProgress.dataTb = step.value;
  }

  function fireScheduledDue() {
    for (const step of scheduled) {
      if (step.fired || step.epoch !== stateEpoch || clockMs < step.fireAt) continue;
      step.fired = true;
      applyProcStep(step);
    }
  }

  // Звук входа состояния — v1 НЕМ (seoul по умолчанию без звука). Шов оставлен.
  function audioForState(_target) { /* no-op в v1; звук — в монтаже (D-14) */ }

  // setup(target): поднять состояние + запланировать авто-переход + (для PROCESSING)
  // расписание ПОД НОВОЙ эпохой (docs/02 §10).
  function setup(target) {
    const auto = AUTO[target];
    if (auto) pending = { fireAt: clock() + auto.durMs, epoch: stateEpoch, target: auto.target };
    const tl = SCAN_TL[target];
    if (tl) {
      // dataTb стартует с 0.0 — счётчик-доминанта считается вверх по расписанию.
      scanProgress = { variant: target, statusLine: tl.statusLines[0], dataTb: 0 };
      scheduleProc(target, clock());
    }
    audioForState(target);
  }

  // Единая точка перехода (docs/02 §10): teardown → ++epoch → setup → trace.
  function transition(target, event) {
    const from = current;
    teardown();
    stateEpoch += 1;
    current = target;
    stateEnteredAt = clock();
    setup(target);
    const rec = { t: clock(), from, to: target, event, epoch: stateEpoch };
    trace.push(rec);
    notify(rec);
    return rec;
  }

  // Фаер «созревшего» авто-перехода. Epoch-guard убивает протухшие колбэки.
  function fireDue() {
    if (pending && pending.epoch === stateEpoch && clockMs >= pending.fireAt) {
      const target = pending.target;
      pending = null;
      transition(target, 'AUTO');
    }
  }

  function tick(nowArg) {
    syncClock(nowArg);
    fireScheduledDue();
    fireDue();
  }

  // READY-gate (docs/02 §9): LOADING → BOOT (BOOT сам планирует авто → IDLE).
  function markReady() {
    if (ready) return false;
    ready = true;
    if (current === STATES.LOADING) {
      syncClock();
      transition(STATES.BOOT, 'READY');
    }
    return true;
  }

  function jump(target, event) {
    if (!ready) return false; // JUMP до READY — no-op
    transition(target, event);
    return true;
  }

  // forceState(name): ПУБЛИЧНЫЙ операторский/верификационный прыжок в ЛЮБОЕ из 7
  // капчур-состояний (screen.md §5). По plan-review Codex — НЕ тест-дыра: валидирует
  // цель, требует READY (иначе можно обойти READY-gate и поймать недетерминированный
  // первый кадр), идёт через тот же transition() (teardown→epoch++→setup→trace,
  // event 'FORCE'). Используют selftest, Playwright и window.__nucleusSeoul.
  function forceState(name) {
    if (!ready) return false;
    if (CAPTURE_STATES.indexOf(name) < 0) return false;
    if (name === current) return false; // идемпотентно
    syncClock();
    transition(name, 'FORCE');
    return true;
  }

  // dispatch(event): единственный вход событий (RESET, JUMP_1..5, PRIMARY, STEP_BACK,
  // TOGGLE_EXPLAINABILITY, MUTE, REPLAY_VOICE). FULLSCREEN — DOM (controls.js).
  function dispatch(event) {
    syncClock();
    switch (event) {
      case EVENTS.RESET:
        if (!ready) return false;
        explainability = true; // RESET возвращает пейофф-флаг в исходное (дубль-к-дублю)
        transition(STATES.IDLE, EVENTS.RESET);
        return true;
      case EVENTS.JUMP_1:
      case EVENTS.JUMP_2:
      case EVENTS.JUMP_3:
      case EVENTS.JUMP_4:
      case EVENTS.JUMP_5:
        return jump(JUMP_TARGETS[event], event);
      case EVENTS.PRIMARY: {
        if (!ready) return false;
        const target = PRIMARY_TARGETS[current];
        if (!target) return false; // PROCESSING/FINAL/LOADING/BOOT → no-op
        // Debounce: первые DEBOUNCE_PRIMARY после входа PRIMARY игнорируется.
        if (clock() - stateEnteredAt < config.TIMING.DEBOUNCE_PRIMARY * 1000) return false;
        // Гейт пейоффа (plan-review Codex, screen.md §5 кадр 9): apply из SETTINGS не
        // проходит, пока объяснения не выключены — главный жест обязателен.
        if (current === STATES.SETTINGS && explainability !== false) return false;
        audio.unlock();
        transition(target, EVENTS.PRIMARY);
        return true;
      }
      case EVENTS.STEP_BACK: {
        if (!ready) return false;
        const target = STEP_BACK_TARGETS[current];
        if (!target) return false;
        transition(target, EVENTS.STEP_BACK);
        return true;
      }
      case EVENTS.TOGGLE_EXPLAINABILITY:
        // Тумблер сцены SETTINGS (тач). Активен только в SETTINGS — пейофф «сам
        // выключаешь предохранитель» (screen.md §5 кадр 9). Флаг персистентен.
        // READY-gate для консистентности с остальными событиями (code-review Codex):
        // до READY недостижимо штатно (SETTINGS только после READY), но гард явный.
        if (!ready) return false;
        if (current !== STATES.SETTINGS) return false;
        explainability = !explainability;
        // Перерисовать сцену под новое положение тумблера: уведомляем подписчиков
        // synthetic-переходом в то же состояние? Нет — это сломало бы epoch/детерминизм.
        // Сцена сама читает getRuntime() в своём tap-обработчике и патчит DOM.
        return true;
      case EVENTS.MUTE:
        audio.setMuted(!audio.muted);
        return true;
      case EVENTS.REPLAY_VOICE:
        if (!REPLAY_VOICE_STATES.has(current)) return false;
        audio.play(null); // v1 нем
        return true;
      default:
        return false;
    }
  }

  function subscribe(fn) {
    subscribers.push(fn);
    return function unsubscribe() {
      const i = subscribers.indexOf(fn);
      if (i >= 0) subscribers.splice(i, 1);
    };
  }

  // Диагностический/харнесс-срез (подключается main.js только в ?selftest/dev).
  const test = {
    advance(ms) { clockMs += ms; return clockMs; },
    tick(nowArg) { return tick(nowArg); },
    now() { return clockMs; },
    resetTrace() { trace.length = 0; },
  };

  return {
    STATES,
    EVENTS,
    CAPTURE_STATES,
    trace,
    audio,
    get ready() { return ready; },
    get stateEpoch() { return stateEpoch; },
    getState() { return current; },
    // Снимок прогресса текущей PROCESSING для сцен; null вне неё.
    getScanProgress() { return scanProgress; },
    // Персистентные runtime-флаги (explainability) для сцен (тумблер/гейт пейоффа).
    getRuntime() { return { explainability }; },
    dispatch,
    forceState,
    markReady,
    tick,
    subscribe,
    test,
  };
}
