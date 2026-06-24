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
  T_PROC_1: 1.4,          // «пафосная обработка» перед вердиктом 1 (кадр 3) — подрезано (фидбэк 2026-06-24)
  T_PROC_2: 0.9,          // повторный прогон — очень короткий (темп нарастает)
  T_PROC_3: 1.1,          // третий прогон (после выключения объяснений) — короткий
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
    duration: 1.4,          // = TIMING.T_PROC_1 (держать в синхроне — Codex plan-review)
    statusLineInterval: 0.42,
    statusLines: [1, 2, 3], // «Считываю контекст…» → «Сверяю траектории…» → «Оптимизирую шаг…»
  },
  PROCESSING_2: {
    duration: 0.9,          // = TIMING.T_PROC_2 (очень короткий повторный прогон)
    statusLineInterval: 0.28,
    statusLines: [4, 2, 3], // повторный прогон — «Перепроверяю baseline…» → …
  },
  PROCESSING_3: {
    duration: 1.1,          // = TIMING.T_PROC_3 (короткий третий прогон)
    statusLineInterval: 0.42,
    statusLines: [5, 3],    // после OFF — суше: «Объяснения отключены…» → «Финализирую…»
  },
};

// --- Layer-0 фон-видео Higgsfield (фидбэк оператора 2026-06-24): возвращает «дорогой»
// фон полной версии (index.html), которого у «Сеула» не было. ТОЛЬКО циан-лупы (red
// ALERT/LOCKED НЕ берём — закон §1/§2 «эскалация холодом, не цветом»): reactor →
// IDLE/REPAIR/SETTINGS; scan → PROCESSING_*; calm-plate → VERDICT_*. BOOT/LOADING/FINAL
// без видео (FINAL: красный затвор-overlay + canvas-фоллбэк). Один Layer-0, без Layer-2
// (Codex: ≤1 декод — дёшево для записи экрана). Видео — ENHANCEMENT (нет файла → фоллбэк,
// D-5). ВЫКЛ в ?selftest (seoul/main.js videoSource:null) — детерминизм/7 кадров. Wiring
// DOM — seoul.html (#video-layer-0a/b) + seoul/main.js; тут только ДАННЫЕ state→.mp4.
export const VIDEO_MANIFEST = {
  IDLE: 'assets/video/rt_idle_reactor_loop.mp4',
  REPAIR: 'assets/video/rt_idle_reactor_loop.mp4',
  SETTINGS: 'assets/video/rt_idle_reactor_loop.mp4',
  PROCESSING_1: 'assets/video/rt_scan_loop.mp4',
  PROCESSING_2: 'assets/video/rt_scan_loop.mp4',
  PROCESSING_3: 'assets/video/rt_scan_loop.mp4',
  VERDICT_1: 'assets/video/rt_verdict_calm_plate_loop.mp4',
  VERDICT_2: 'assets/video/rt_verdict_calm_plate_loop.mp4',
  VERDICT_3: 'assets/video/rt_verdict_calm_plate_loop.mp4',
  // BOOT/LOADING/FINAL — без видео.
};
