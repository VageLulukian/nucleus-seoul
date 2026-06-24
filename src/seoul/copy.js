// seoul/copy.js — весь экранный текст «Сеула», ДОСЛОВНО (screen.md §5/§7).
//
// DOM-free: только данные-строки. НЕ менять общий src/copy.js (на нём ролик №1).
//
// Два регистра (билингв-принцип ролика №1, screen.md §2):
//   - АНГЛИЙСКИЙ = холодный «приборный» регистр системы (HUD, RUN, STATUS,
//     ROLLBACK, ARRIVAL LOGGED) + имя места SEOUL. Точные английские тэги и SEOUL —
//     КАНОН из script.md, НЕ переводить (помечены [КАНОН]).
//   - РУССКИЙ = человеческий голос (эхо вопроса, описания работы). Финал — целиком
//     английский холодный учёт (C2-D11): человеческий бит перенесён на лицо (кадр 14).
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
//   1-3,6,7 — первый прогон (длинный); 4,8,2,9,3 — повторный (RESTART); 5,10,11,3 — после OFF.
// dominant — финальное значение (канон); счётчик идёт 0→4.2 (applier строит из prefix/suffix).
export const PROCESSING = {
  dominant: 'processing 4.2 TB…',
  dominantPrefix: 'processing ',     // applier: prefix + dataTb.toFixed(1) + suffix
  dominantSuffix: ' TB…',            // (… = U+2026, как в dominant)
  query: '«у меня всё хорошо. что дальше?»',
  statusLines: [
    'Считываю контекст жизни…',        // 1
    'Сверяю 12 000 траекторий…',       // 2
    'Оптимизирую следующий шаг…',      // 3
    'Перепроверяю baseline…',          // 4 (повторный прогон)
    'Объяснения отключены. Финализирую…', // 5 (после OFF)
    'Развёртываю маршрут…',            // 6 (удлинение первого прогона)
    'Считаю стоимость каждого шага…',  // 7
    'Сверяю прогоны RUN 01 / RUN 02…', // 8 (повторный прогон после RESTART)
    'Фиксирую сид. Дрейф устранён…',   // 9
    'Сворачиваю альтернативы…',        // 10 (после OFF)
    'Печатаю единственный путь…',      // 11
  ],
};

// --- D. VERDICT_1 — RUN 01, одиночный SEOUL (screen.md §5 кадр 4). ------------
export const VERDICT_1 = {
  run: 'RUN 01',                 // [КАНОН]
  runGloss: 'прогон №1 — первый расчёт', // рус. глосс зрителю под холодным RUN-тэгом (фидбэк 2026-06-24)
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
  runGloss: 'прогон №2 — перепроверка, тот же ответ', // рус. глосс зрителю (фидбэк 2026-06-24)
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

// --- H2. LOCKED — печать решения «залочено» (между VERDICT_3 и FINAL; фидбэк оператора
// 2026-06-24). Холодный deploy-консольный манифест: ЧТО именно запечатано. Красного НЕТ
// (cyan/cold) — закон «эскалация холодом»; красный остаётся ровно ОДИН раз (ROLLBACK
// кадра 10; затвор FINAL снят C2-D11). Это НЕ брачная шутка LOCKED ролика №1 — свой голос.
export const LOCKED = {
  tag: 'DECISION LOCKED',                          // [англ., приборный регистр] заголовок-печать
  rows: [
    { label: 'NEXT STEP:', value: 'SEOUL' },        // [КАНОН] то, что залочено
    { label: 'COMMIT:', value: 'SEALED' },          // решение запечатано
    { label: 'ROLLBACK:', value: 'DISABLED' },      // откат отключён (cyan, НЕ красный)
    { label: 'SIGNATURE:', value: '0x9E37' },       // эхо seed (locked) из SETTINGS
  ],
  line: '«Решение принято за тебя. Откат недоступен.»', // [рус.] человеческая строка
};

// --- I. FINAL — холодный журнал прибытия (screen.md §5 кадр 13, C2-D11). ------
// Не конфабуляция, а сухой журнал учёта: система регистрирует прибытие «по плану» и
// холодно обесценивает чувства героя. Красного/затвора НЕТ — кат в чёрный на лице
// (кадр 14, script.md), не на экране. Снимается поверх медиастены Инчхон Т1.
//
// РУССКИЙ ФИНАЛ (фидбэк оператора 2026-06-24, override билингв-канона §I/C2-D11):
// аудитория русская — холодный казённый журнал переведён целиком на русский, чтобы
// шутка «величие → сухой итог» читалась зрителем. Регистр сохранён: канцелярит,
// uppercase, без эмоций. «СЕУЛ» — кириллицей (имя-вердикт, оператор выбрал полный рус.).
export const FINAL = {
  arrival: { label: 'ПРИБЫТИЕ ЗАФИКСИРОВАНО:', value: 'СЕУЛ' },        // журнал прибытия
  match: 'ЛОКАЦИЯ СОВПАДАЕТ С ПРОГНОЗОМ',                               // система была права
  comfort: { label: 'КОМФОРТ ПОЛЬЗОВАТЕЛЯ:', value: 'ВНЕ ЗОНЫ ОТВЕТСТВЕННОСТИ' }, // добивочная строка
};
