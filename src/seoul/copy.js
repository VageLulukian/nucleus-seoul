// seoul/copy.js — весь экранный текст «Сеула», ДОСЛОВНО (screen.md §5/§7).
//
// DOM-free: только данные-строки. НЕ менять общий src/copy.js (на нём ролик №1).
//
// Два регистра (билингв-принцип ролика №1, screen.md §2):
//   - АНГЛИЙСКИЙ = холодный «приборный» регистр системы (HUD, RUN, STATUS,
//     ROLLBACK, RESISTANCE) + имя места SEOUL. Точные английские тэги и SEOUL —
//     КАНОН из script.md, НЕ переводить (помечены [КАНОН]).
//   - РУССКИЙ = человеческий голос (эхо вопроса, описания работы, финальная строка).
// Мягкая копи (eyebrow, h1, статус-строки) — предлагаемая (screen.md §7), тюнится тут.

// --- A. HUD / постоянный хром (screen.md §3). ---------------------------------
export const HUD = {
  wordmark: 'NUCLEUS',                 // [КАНОН] имя/герой из ролика №1 (S-D11)
  session: 'SID-7F3A · PRIVATE',       // сессия/доступ справа (моно, низкий контраст)
  maintenance: 'NUCLEUS · MAINTENANCE',// заголовок техн. режима — кадр 6
  runtime: 'NUCLEUS · RUNTIME',        // заголовок техн. режима — кадр 9
  coreOnline: 'DECISION CORE: ONLINE', // HUD-центр обработки (кадр 3)
  footer: '© NUCLEUS · CONFIDENTIAL',  // конфиденшл-футер хайрлайн
};

// --- B. IDLE — простой экран до вопроса (screen.md §7). -----------------------
export const IDLE = {
  eyebrow: 'NUCLEUS · LIFE-PATH INTELLIGENCE',
  h1: 'Первый ИИ, который видит твою жизнь целиком.',
  sub: 'Считываем 4.2 ТБ твоего контекста. Один следующий шаг. Ноль догадок.',
  cta: 'Анализировать', // [КАНОН CTA] тот же, что ролик №1 (S-D11)
};

// --- C. PROCESSING — «пафосная обработка» (screen.md §5 кадр 3). --------------
// dominant — [КАНОН] доминанта-счётчик. query — эхо вопроса (рус., низкий контраст).
// statusLines — 1-based пул (config.SCAN_TIMELINE[*].statusLines индексирует его):
//   1..3 — первый прогон; 4 — повторный; 5 — после выключения объяснений.
export const PROCESSING = {
  dominant: 'processing 4.2 TB…',
  query: '«у меня всё хорошо. что дальше?»',
  statusLines: [
    'Считываю контекст жизни…',        // 1
    'Сверяю 12 000 траекторий…',       // 2
    'Оптимизирую следующий шаг…',      // 3
    'Перепроверяю baseline…',          // 4 (повторный прогон, кадр 7-обработка)
    'Объяснения отключены. Финализирую…', // 5 (после OFF, кадр 10-обработка)
  ],
};

// --- D. VERDICT_1 — RUN 01, одиночный SEOUL (screen.md §5 кадр 4). ------------
export const VERDICT_1 = {
  run: 'RUN 01',                 // [КАНОН]
  word: 'SEOUL',                 // [КАНОН] доминанта во всю ширину
  status: 'STATUS: COMMITTED',   // [КАНОН] единственное сухое поле
  rationaleLabel: 'rationale',   // опц., бледно: «объяснение» (исчезнет к кадру 10)
  rationaleValue: '▸ 99.4%',
  cta: 'Анализировать',          // [КАНОН CTA]
};

// --- E. REPAIR — починка «под капотом» (screen.md §5 кадр 6). ----------------
export const REPAIR = {
  baselineLabel: 'baseline:',
  baselineValue: 'DRIFT DETECTED', // «диагноз», оправдывает починку
  recalibrate: 'RECALIBRATE BASELINE', // [КАНОН] тач-кнопка
  recalibrating: 'recalibrating…',
  recalibrated: 'OK',
  restart: 'RESTART',              // [КАНОН] тач-кнопка → PROCESSING_2
};

// --- F. VERDICT_2 — RUN 02 // CONFIRMED, сверка+штамп (screen.md §5 кадр 7). --
export const VERDICT_2 = {
  run: 'RUN 02 // CONFIRMED //',   // [КАНОН]
  compareRun1: 'RUN 01  →  SEOUL', // сверка двух прогонов
  compareRun2: 'RUN 02  →  SEOUL',
  matchLabel: 'MATCH:',
  matchValue: '100%',
  stamp: 'CONFIRMED',              // [КАНОН] машинный штамп (двойная hairline-рамка)
  cta: 'Анализировать',           // [КАНОН CTA]
};

// --- G. SETTINGS — системный заход, тумблер (screen.md §5 кадр 9). -----------
// explainability — ГЛАВНЫЙ ЖЕСТ: крупный тумблер ON→OFF; после OFF строка гаснет,
// система холодно подтверждает «rationale output: DISABLED». temperature/seed — канон.
export const SETTINGS = {
  title: 'NUCLEUS · RUNTIME',
  model: { label: 'model:', value: 'nucleus-core' },
  temperature: { label: 'temperature:', value: '0' }, // [КАНОН]
  explainability: { label: 'explainability:', on: 'ON', off: 'OFF' }, // [КАНОН OFF]
  rationaleOutput: { label: '→ rationale output:', on: 'ENABLED', off: 'DISABLED' },
  seed: { label: 'seed:', value: '0x9E37  (locked)' },
  apply: 'APPLY', // тач → PROCESSING_3 (но-оп, пока explainability не OFF)
  applyHint: 'выключите объяснения, чтобы применить', // подсказка-гейт до OFF
};

// --- H. VERDICT_3 — самый сухой приговор + красный ROLLBACK (кадр 10). --------
// Канонически объяснений НЕТ (explainability выключен в кадре 9); EXPLAINABILITY: OFF
// показывается всегда (тихое эхо, читаемый пейофф уже случился в кадре 9).
export const VERDICT_3 = {
  nextStep: { label: 'NEXT LIFE STEP:', value: 'SEOUL' },           // [КАНОН]
  status: { label: 'STATUS:', value: 'COMMITTED' },                 // [КАНОН]
  rollback: { label: 'ROLLBACK:', value: 'NOT RECOMMENDED' },       // [КАНОН] красный LED+слова
  explainability: { label: 'EXPLAINABILITY:', value: 'OFF' },       // [КАНОН]
};

// --- I. FINAL — затвор → в чёрный (screen.md §5 кадр 13). --------------------
export const FINAL = {
  tag: 'RESISTANCE: ACCOUNTED FOR',          // [КАНОН] моно, англ.
  line: '«Сопротивление было частью плана.»', // [КАНОН] человеческая строка (рус.)
};
