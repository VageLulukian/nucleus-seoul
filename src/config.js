// config.js — все детерминированные КОНСТАНТЫ NUCLEUS (Шаг 1, Task 2).
//
// DOM-free: ни одного обращения к document/window. Импортируется и браузером
// (через main.js/машину/визуал), и node (logic-tests.mjs через await import).
//
// Зеркало источников истины:
//   - тайминги:                 docs/02 §5
//   - покадровое расписание скана: docs/02 §12
//   - числа биомаркеров/счётчиков: docs/05 §C
// Детерминизм (docs/02 §6.1): ноль рандома в данных и таймингах — всё здесь
// фиксировано дубль-к-дублю. Любая правка значения = правка дока, и наоборот.

// --- Тайминги (СЕКУНДЫ). docs/02 §5. -------------------------------------
// Хранятся в секундах, как в доке. Планировщик машины (Task 3/5) умножает на
// 1000 при работе с performance.now()/мс. T_SCAN_3 срывается в ALERT через
// T_GLITCH после своей длительности (docs/02 §12).
export const TIMING = {
  T_BOOT: 1.8,           // сплеш (только первая загрузка)
  T_SCAN_1: 6.0,         // полный драматичный скан перед вердиктом 1
  T_SCAN_2: 4.5,         // «повторный анализ» — чуть быстрее
  T_SCAN_3: 3.0,         // «критический» — быстрый, срывается в тревогу
  T_GLITCH: 0.6,         // глитч-переход SCAN(3) → ALERT
  T_TRANSITION: 0.35,    // межэкранные переходы (fade / scanline-wipe)
  DEBOUNCE_PRIMARY: 0.25, // окно блокировки PRIMARY после входа в интеракт.
  CURSOR_HIDE: 1.5,      // автоскрытие курсора по простою (docs/02 §2)
};

// Сид детерминированного PRNG визуала (docs/02 §6.4, docs/07 §6). Любой
// декоративный рандом фона сидируется отсюда и ресидится на RESET/JUMP.
export const PRNG_SEED = 0x9e3779b9; // golden-ratio constant — фикс. сид

// Лимит частиц фонового поля (docs/03 §5.2 параллакс, docs/07 §8 перф-гард ~60fps).
export const PARTICLE_LIMIT = 120;

// --- Числовые финалы счётчиков. docs/05 §C. ------------------------------
// SCAN твинит их 0 → final по ease-out (docs/02 §12). Текстовая подача —
// в copy.js (SCAN.counters); здесь — числа для анимации.
export const COUNTERS = {
  MARKERS: 47880,  // «МАРКЕРОВ: 47 880 / 47 880»
  DATA_TB: 2.3,    // «ОБРАБОТАНО: 2.3 ТБ / 2.3 ТБ»
  RING_PCT: 100,   // кольцо прогресса 0 → 100%
};

// --- Числовые финалы тайлов биомаркеров. docs/05 §C. ---------------------
// Для детерминированных твинов значений в SCAN. Экранные строки (label/value/
// status) — в copy.js (SCAN.tiles). Порядок зеркалит copy.SCAN.tiles.
export const BIOMARKERS = {
  GENOME_PAIRS_BLN: 3.2,      // Геном: 3.2 млрд пар
  MICROBIOME_SPECIES: 12400,  // Микробиом: 12 400 видов
  CORTISOL: 11.4,             // Кортизол: 11.4 µg/dL
  TESTOSTERONE: 624,          // Тестостерон: 624 нг/dL
  HRV: 72,                    // HRV: 72 мс
  HRV_RECOVERY_PCT: 94,       // recovery 94%
  BODY_FAT_PCT: 12.3,         // жир 12.3%
  BODY_MUSCLE_PCT: 81.2,      // мышцы 81.2%
  VITAMIN_D: 48,              // Витамин D: 48 нг/мл
  BIO_AGE: 32.7,              // Биологический возраст: 32.7
  BIO_AGE_DELTA: -2.3,        // −2.3 к хронологическому
};

// --- Покадровое расписание сканов. docs/02 §12. --------------------------
// t отсчитывается от входа в SCAN (СЕКУНДЫ). statusLines — 1-based номера
// строк из copy.SCAN.statusLines (зеркало нумерации дока 05 §C).
//
// Общие кривые (SCAN_CURVES, для всех вариантов):
//   - кольцо 0→100%: ease-out, финиш к t = duration − ringCompleteOffset;
//   - счётчики: ease-out, финал к t = duration × counterCompleteFraction;
//   - тайл: значение твинится ease-out ~tileTweenDuration после появления;
//   - разворот «ФАКТОР РИСКА»: последние riskRevealWindow секунд скана.
export const SCAN_CURVES = {
  ringCompleteOffset: 0.3,      // финиш кольца к t = duration − 0.3 c
  counterCompleteFraction: 0.9, // счётчики достигают финала к t = duration × 0.9
  tileTweenDuration: 0.8,       // значение тайла твинится ~0.8 c
  riskRevealWindow: 0.8,        // «ФАКТОР РИСКА» в последние 0.8 c
};

// Варианты сканов. tileStagger: tile_i появляется в t = base + i×step (count тайлов).
// SCAN_3 — step 0 (мигают разом @ base), glitch=true (на t=duration стартует T_GLITCH).
export const SCAN_TIMELINE = {
  SCAN_1: {
    duration: 6.0,
    statusLineInterval: 0.75,          // смена статус-строки каждые 0.75 c
    statusLines: [1, 2, 3, 4, 5, 6, 7, 8], // строки 1→8 по порядку
    tileStagger: { base: 0.4, step: 0.55, count: 9 },
    riserAt: 4.0,
    glitch: false,
  },
  SCAN_2: {
    duration: 4.5,
    statusLineInterval: 0.5,
    statusLines: [2, 3, 4, 5, 8, 9],   // «повторный»: рваный поднабор
    tileStagger: { base: 0.3, step: 0.42, count: 9 }, // быстрее
    riserAt: 2.5,
    glitch: false,
  },
  SCAN_3: {
    duration: 3.0,
    statusLineInterval: 0.3,
    statusLines: [1, 8, 9, 10],        // «критический»: рваный темп
    tileStagger: { base: 0.3, step: 0, count: 9 }, // мигают разом @ 0.3 c
    riserAt: 1.5,
    glitch: true,
  },
};

// --- Видео-манифесты Layer-0/Layer-2 (Шаг 3, docs/09 §3/§10). -------------
// Ключи — СТРОКОВЫЕ имена состояний (тождественны значениям STATES из
// state/machine.js). config.js сознательно остаётся БЕЗ импортов (DOM-free дом
// констант, docs/07 §7) — не тянем machine.js ради computed keys (ES-cycle риск,
// Codex plan-review). Wiring элементов/предзагрузки — main.js/visuals.
//
// Layer 0 — фоновые лупы состояния: IDLE = idle reactor; VERDICT_1/2 = свой
// calm-plate (приглушённая почти-статика — LUXURY-тир docs/09 §5 реализован
// 2026-06-12); SCAN_1/2/3 = scan loop; ALERT = alert takeover; LOCKED = свой
// quarantine (запечатанный, темнее ALERT). LOADING/BOOT — без видео (нет записи).
// Отсутствующий .mp4 → canvas-фоллбэк (D-5).
export const VIDEO_MANIFEST = {
  IDLE: 'assets/video/rt_idle_reactor_loop.mp4',
  VERDICT_1: 'assets/video/rt_verdict_calm_plate_loop.mp4',
  VERDICT_2: 'assets/video/rt_verdict_calm_plate_loop.mp4',
  SCAN_1: 'assets/video/rt_scan_loop.mp4',
  SCAN_2: 'assets/video/rt_scan_loop.mp4',
  SCAN_3: 'assets/video/rt_scan_loop.mp4',
  ALERT: 'assets/video/rt_alert_takeover_loop.mp4',
  LOCKED: 'assets/video/rt_lock_quarantine_loop.mp4',
};

// Layer 2 (LUXURY) — play-once transition-клипы на входе в состояние: ignition
// (idle→scan) на КАЖДОМ входе в SCAN; prealert-anomaly (CYAN-only, без красного)
// на входе в ALERT; verdict-flare (тёмный кат → cyan-вспышка с широким пиком
// ~0.7–1.2s — окно слэма «ЖЕНИТЬСЯ», Codex: допуск, не кадр) на входе в
// VERDICT_1/2; lock-seal (красный свет сжимается — «затвор») на входе в LOCKED.
// 4 уникальных клипа = пул из 4 <video> (index.html), декод-прогрев
// ПОСЛЕДОВАТЕЛЬНЫЙ (transitions.preload). XOR R-13 с кроссфейдом Layer-0 —
// visuals/transitions.js.
export const TRANSITION_CLIPS = {
  SCAN_1: 'assets/video/rt_scan_ignition_transition.mp4',
  SCAN_2: 'assets/video/rt_scan_ignition_transition.mp4',
  SCAN_3: 'assets/video/rt_scan_ignition_transition.mp4',
  VERDICT_1: 'assets/video/rt_verdict_reveal_flare.mp4',
  VERDICT_2: 'assets/video/rt_verdict_reveal_flare.mp4',
  ALERT: 'assets/video/rt_prealert_anomaly_transition.mp4',
  LOCKED: 'assets/video/rt_lock_seal_transition.mp4',
};

// Удобный плоский алиас таймингов (некоторые модули обращаются по короткому имени).
export const {
  T_BOOT, T_SCAN_1, T_SCAN_2, T_SCAN_3, T_GLITCH, T_TRANSITION,
  DEBOUNCE_PRIMARY, CURSOR_HIDE,
} = TIMING;
