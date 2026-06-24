// seoul/config.js — детерминированные КОНСТАНТЫ экрана «Сеул» (ролик №2).
//
// DOM-free: ни одного обращения к document/window. Импортируется браузером
// (seoul/main.js) и node (если будут logic-tests). Детерминизм (docs/02 §6.1):
// ноль рандома, всё фиксировано дубль-к-дублю.
//
// Сид/лимит/кривые сканов ПЕРЕИСПОЛЬЗУЮТ ядро (../config.js) — тот же визуальный
// детерминизм, что у ролика №1 и спутника. Тайминги «обработки» и расписание
// статус-строк — собственные (граф §4 у «Сеула» другой). screen.md §4/§5/§7.

import { SCAN_CURVES as CORE_SCAN_CURVES, PRNG_SEED as CORE_SEED, PARTICLE_LIMIT as CORE_LIMIT } from '../config.js';

// Визуальный детерминизм — тот же сид/лимит/кривые, что у ядра (единый «прибор»).
export const PRNG_SEED = CORE_SEED;
export const PARTICLE_LIMIT = CORE_LIMIT;
export const SCAN_CURVES = CORE_SCAN_CURVES; // rings.js читает ringCompleteOffset

// --- Тайминги (СЕКУНДЫ). Граф §4: короткие «обработочные» биты под телефон. ----
// Длительности обработки взяты из экранного тайминга кадров 3/—/— (script.md §3):
// кадр 3 ~1.8с. PROCESSING_2/3 чуть быстрее (повторные прогоны, темп нарастает).
// DEBOUNCE_PRIMARY/CURSOR_HIDE — как у ядра (UX-инварианты прибора).
export const TIMING = {
  T_BOOT: 1.4,            // сплеш (только первая загрузка) — короче ядра (телефон)
  T_PROC_1: 5.0,          // «пафосная обработка» — ДЛИННО и красиво, как в полной версии (фидбэк 2026-06-24)
  T_PROC_2: 4.0,          // повторный прогон после RESTART — длинный (место под слой звука в монтаже)
  T_PROC_3: 3.0,          // третий прогон (после OFF) — короче двух первых, но не куцый
  DEBOUNCE_PRIMARY: 0.25, // окно блокировки PRIMARY после входа в интеракт.
  CURSOR_HIDE: 1.5,       // автоскрытие курсора по простою (как ядро)
};

// Плоский алиас (короткие имена для потребителей).
export const { T_BOOT, T_PROC_1, T_PROC_2, T_PROC_3, DEBOUNCE_PRIMARY, CURSOR_HIDE } = TIMING;

// --- Числа дисплея (детерминированные). screen.md §5. -------------------------
// «processing 4.2 TB…» — доминанта кадра 3 (казёмер). 12 000 траекторий — статус.
export const COUNTERS = {
  DATA_TB: 4.2,           // «processing 4.2 TB…» (канон script.md)
  TRAJECTORIES: 12000,    // «Сверяю 12 000 траекторий…»
  CONFIDENCE: 99.4,       // «rationale ▸ 99.4%» (кадр 4)
  MATCH_PCT: 100,         // «MATCH: 100%» (кадр 7)
};

// --- Расписание «обработки» (аналог docs/02 §12, легче). ----------------------
// Ключи = имена состояний PROCESSING_* (тождественны STATES; config без импорта
// machine.js — DOM-free дом констант). statusLines — 1-based номера строк
// copy.PROCESSING.statusLines, сменяются каждые statusLineInterval секунд.
// duration — для closed-form колец (rings.js: 100% к duration − ringCompleteOffset).
// Кольца/счётчик считаются от vt в визуале/сцене; тайлов/risk/glitch у «Сеула» НЕТ
// (обработка легче скана: кольца + большой счётчик + 2–3 строки, screen.md §5 кадр 3).
export const SCAN_TIMELINE = {
  PROCESSING_1: {
    duration: 5.0,          // = TIMING.T_PROC_1 (синхрон обязателен — selftest проверяет равенство)
    statusLineInterval: 0.7,
    statusLines: [1, 2, 3, 6, 7],     // 5 строк на ~5с (длинный «дорогой» прогон)
    countTo: COUNTERS.DATA_TB, countSteps: 10, // доминанта «processing X.X TB…» считается 0→4.2
  },
  PROCESSING_2: {
    duration: 4.0,          // = TIMING.T_PROC_2 (длинный прогон после RESTART — место под звук)
    statusLineInterval: 0.65,
    statusLines: [4, 8, 2, 9, 3],     // restart-регистр: baseline → сверка прогонов → траектории → сид → шаг
    countTo: COUNTERS.DATA_TB, countSteps: 8,
  },
  PROCESSING_3: {
    duration: 3.0,          // = TIMING.T_PROC_3 (после OFF — суше, но не куцый)
    statusLineInterval: 0.7,
    statusLines: [5, 10, 11, 3],      // после OFF: «Объяснения отключены…» → суше
    countTo: COUNTERS.DATA_TB, countSteps: 6,
  },
};

// --- Layer-0 фон-видео Higgsfield (фидбэк оператора 2026-06-24): возвращает «дорогой»
// фон полной версии (index.html), которого у «Сеула» не было. ТОЛЬКО циан-лупы (red
// ALERT/LOCKED НЕ берём — закон §1/§2 «эскалация холодом, не цветом»): reactor →
// IDLE/REPAIR/SETTINGS; scan → PROCESSING_*; calm-plate → VERDICT_*. BOOT/LOADING/FINAL
// без видео (FINAL: красный затвор-overlay + canvas-фоллбэк). Один Layer-0, без Layer-2
// (Codex: ≤1 декод — дёшево для записи экрана). Видео — ENHANCEMENT (нет файла → фоллбэк,
// D-5). ВЫКЛ в ?selftest (seoul/main.js videoSource:null) — детерминизм/8 кадров. Wiring
// DOM — seoul.html (#video-layer-0a/b) + seoul/main.js; тут только ДАННЫЕ state→.mp4.
export const VIDEO_MANIFEST = {
  IDLE: 'assets/video/rt_idle_reactor_loop.mp4',
  REPAIR: 'assets/video/rt_idle_reactor_loop.mp4',
  SETTINGS: 'assets/video/rt_idle_reactor_loop.mp4',
  PROCESSING_1: 'assets/video/rt_scan_loop.mp4',
  PROCESSING_2: 'assets/video/rt_scan_loop.mp4',
  PROCESSING_3: 'assets/video/rt_scan_loop.mp4',
  // Корейский фон вердикта (фидбэк оператора 2026-06-24, override S-D13): флаг/тэгык
  // на главный момент SEOUL (VERDICT_1), скайлайн Сеула на сверку/манифест (VERDICT_2/3).
  VERDICT_1: 'assets/video/seoul_korean_flag_loop.mp4',
  VERDICT_2: 'assets/video/seoul_korean_skyline_loop.mp4',
  VERDICT_3: 'assets/video/seoul_korean_skyline_loop.mp4',
  // ФИНАЛ — «дорогой» неон-Сеул ночью (фидбэк оператора 2026-06-24, override C2-D11
  // «FINAL без видео / холодный canvas»): аудитория русская, оператор просил яркий
  // премиум-фон вместо серого канваса. Тёплое золото + фирменная бирюза (Higgsfield
  // nano_banana → kling3_0_turbo, 9:16). Шутка цела: роскошный город → холодный
  // русский журнал прибытия поверх (скрим в seoul.html держит читаемость текста).
  FINAL: 'assets/video/seoul_final_neon_loop.mp4',
  // BOOT/LOADING/LOCKED — без видео (LOCKED: холодный canvas-only «запечатано»).
};
