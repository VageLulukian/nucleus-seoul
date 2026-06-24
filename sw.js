// sw.js — service worker экрана «Сеул»: офлайн-прекэш всего замыкания (S-D14).
//
// Цель: после ПЕРВОЙ загрузки с интернетом приложение, добавленное на экран
// «Домой», работает БЕЗ сети — на локации/в самолёте, без компьютера рядом.
// Стратегия cache-first: всё нужное прекэшируется на install; fetch отдаёт из
// кэша, сеть — фоллбэк. Навигации без сети → кэшированный seoul.html.
//
// Пути относительны расположения sw.js (корень сайта) — корректны и на
// GitHub-Pages-подпути (https://<user>.github.io/<repo>/). Бамп CACHE при правке
// списка/ассетов, иначе старый кэш переживёт деплой.

const CACHE = 'nucleus-seoul-v4';

const ASSETS = [
  // НЕ кэшируем './' — на GitHub Pages корень без index.html отдаёт 404, а один
  // 404 валит весь cache.addAll. Точка входа приложения — seoul.html (manifest
  // start_url тоже на неё), её и кэшируем; навигации офлайн фоллбэчат на неё.
  'seoul.html',
  'seoul.webmanifest',
  // seoul-модули
  'src/seoul/main.js',
  'src/seoul/config.js',
  'src/seoul/copy.js',
  'src/seoul/machine.js',
  'src/seoul/visuals.js',
  'src/seoul/hud.js',
  'src/seoul/selftest.js',
  'src/seoul/scenes/index.js',
  'src/seoul/scenes/idle.js',
  'src/seoul/scenes/processing.js',
  'src/seoul/scenes/verdict1.js',
  'src/seoul/scenes/verdict2.js',
  'src/seoul/scenes/verdict3.js',
  'src/seoul/scenes/repair.js',
  'src/seoul/scenes/settings.js',
  'src/seoul/scenes/final.js',
  // переиспользуемые общие примитивы (state-agnostic)
  'src/config.js',
  'src/input/controls.js',
  'src/visuals/core.js',
  'src/visuals/particles.js',
  'src/visuals/scanlines.js',
  'src/visuals/rings.js',
  'src/visuals/background.js',
  'src/visuals/media-utils.js',
  // Layer-0 фон-видео Higgsfield (фидбэк оператора 2026-06-24) — только циан-лупы.
  // Без прекэша офлайн-PWA откроется, но «дорогой» фон не приедет без сети (S-D14),
  // поэтому кэшируем их и бампнули CACHE v3→v4 выше.
  'assets/video/rt_idle_reactor_loop.mp4',
  'assets/video/rt_scan_loop.mp4',
  'assets/video/rt_verdict_calm_plate_loop.mp4',
  // шрифты (самохост, без FOUT)
  'assets/fonts/martian-grotesk-condensed-black.woff2',
  'assets/fonts/martian-grotesk-400.woff2',
  'assets/fonts/martian-grotesk-500.woff2',
  'assets/fonts/ibm-plex-mono-latin-400.woff2',
  'assets/fonts/ibm-plex-mono-latin-500.woff2',
  'assets/fonts/ibm-plex-mono-latin-600.woff2',
  'assets/fonts/ibm-plex-mono-cyrillic-400.woff2',
  'assets/fonts/ibm-plex-mono-cyrillic-500.woff2',
  'assets/fonts/ibm-plex-mono-cyrillic-600.woff2',
];

self.addEventListener('install', (e) => {
  // skipWaiting — новый SW активируется сразу (свежий деплой не ждёт закрытия вкладок).
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  // Снести старые версии кэша + забрать управление открытыми клиентами.
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          // Подкэшировать успешно полученное того же origin (на случай, если что-то
          // вне списка — напр. ?-вариант пути). Чужие origin не трогаем.
          if (res && res.ok && req.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // Офлайн и нет в кэше: для навигаций отдать оболочку seoul.html.
          if (req.mode === 'navigate') return caches.match('seoul.html');
          return Response.error();
        });
    }),
  );
});
