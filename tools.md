# AI-инструменты для концепт-дизайна кальянной (Дананг)

**Дата проверки:** 2026-11-19. Порог «старых» источников: всё, что старше 2026-05-19, помечено ⚠.
**Объект:** 2 этажа, на каждом открытый зал 10×14 м (≈140 м², всего ≈280 м²). Колонны по длинным стенам, 4 на сторону. Одна лестница. Высота потолка неизвестна.
**Цель:** план в мм → 3D → фотореалистичные рендеры → спецификация мебели (Ш×Г×В, материал, кол-во) для цеха во Вьетнаме.

Правила документа:
- Цифры взяты с официальных сайтов, из документации и README на GitHub. Вьетнамские цены — с сайтов самих компаний, это маркетинговые страницы, а не независимые источники.
- **[вывод]** означает мой вывод, а не цитату источника.
- «не подтверждено» означает, что официального подтверждения не нашлось.
- Цены в USD показаны для посетителя не из Вьетнама. SketchUp, Coohom и D5 прямо пишут, что цена зависит от региона, поэтому из Вьетнама она может отличаться.
- Многие страницы проверены во время акций Black Friday и Year-end sale, поэтому цены могут быть временными.

---

## 1. Что требуется на выходе (данные вьетнамского рынка)

Это определяет выбор инструментов, поэтому идёт первым.

- **Стандарт форматов:** 3D-модель в SketchUp **.skp** плюс 2D-чертежи AutoCAD **.dwg**. На руки заказчику отдают **PDF-комплект чертежей с размерами** и рендеры **JPG**.
  - Источник: [Thế Giới Mộc, 16.11.2026](https://thegioimoc.vn/ho-so-thiet-ke-noi-that/) (HCMC).
  - Это же требование есть в вакансиях цехов: [jobbim.vn](https://jobbim.vn/jobs/thiet-ke-noi-that-autocad-sketchup-xuong-san-xuat-15-25-trie-dok34d) (Ханой).
- **Цеха берут и попроще:**
  - Sofa Z (Ханой) принимает CAD, SketchUp/3ds Max/Revit, а также «PDF или фото, если есть размеры» ([sofaz.vn](https://sofaz.vn/xuong-san-xuat-sofa-theo-yeu-cau-cho-kien-truc-su-va-nha-thau.html), дата не указана).
  - Gia Công Sofa Đà Nẵng: «присылайте чертёж в Zalo для расчёта», «нет чертежа — приедем замерить и начертим» ([giacongsofa.vn](https://giacongsofa.vn/), на странице упомянуты 10/2026).
- **Главный риск:** если отдать цеху одни рендеры без технических чертежей, «каждая сторона понимает размеры по-своему, сложно принимать работу» ([Thế Giới Mộc](https://thegioimoc.vn/ho-so-thiet-ke-noi-that/)).
- **Цех сам делает shop drawing и согласует его до производства:** так пишет Bemos (Ханой, [30.07.2026](https://bemos.com.vn/gia-cong-do-go-theo-ban-ve)).
- Прямой фразы «принимаем .skp / .dwg» на данангских сайтах **не нашлось (не подтверждено)**. Это надо уточнить в Zalo.

**Вывод для выбора инструментов [вывод]:**
- Спецификацию и чертежи нужно брать **из CAD-модели с точной геометрией**, а не из AI-картинки.
- Рендер нужен только как иллюстрация. Он может быть генеративным, если построен с вида той же модели.
- Минимальный пакет для цеха: **PDF с размерами + DXF/DWG + таблица спецификации**. Файл **.skp** даёт заметный плюс.

---

## 2. Сравнительная таблица

Столбцы:
- **Цена:** в месяц, по официальной странице.
- **Free:** бесплатный тариф.
- **MCP/API:** возможность управлять из Claude Code.
- **Фото чертежа:** импорт растрового чертежа.
- **Мебель:** бар, диваны, кальянные столы.
- **Экспорт:** форматы выгрузки.
- **Размеры:** сохраняются ли реальные размеры.
- **VN:** доступность из Вьетнама.

### 2.1 Планировщики «всё в одном» (план → 3D → рендер)

| Инструмент | Цена/мес | Free | MCP/API для Claude Code | Фото чертежа | Мебель | Экспорт | Размеры | VN |
|---|---|---|---|---|---|---|---|---|
| **Coohom** (+AIHom) | Pro $29 (мес.) / $25 (год); Elite $69 / $58; Enterprise по запросу ([pricing](https://www.coohom.com/pricing?hl=en)) | Да: 3 проекта, рендеры с водяным знаком ([pricing](https://www.coohom.com/pricing?hl=en)) | MCP для Claude Code **не подтверждён**. Есть бизнес-OpenAPI ([open.coohom.com](https://open.coohom.com/)) и плагин «Coohom-Freeform» для **Codex** ([GitHub](https://github.com/manycore-research/Coohom-Freeform/blob/master/docs/marketplace.md), 20.09.2026) | Да: PDF/PNG/JPG с автораспознаванием стен, масштаб по известному отрезку; есть и DWG/DXF ([help, 04.09.2026](https://www.coohom.com/helpcenter/how-to-upload-a-cad-floor-plan-from-images-or-pdf)) | Есть категории Booth Seating и Commercial Design, модели барных стоек ([каталог](https://www.coohom.com/3d-models/Booth-Seating)). На Pro: кастомное моделирование и BOM ([pricing](https://www.coohom.com/pricing?hl=en)) | CAD/PDF/JPG строительных чертежей, только **Elite** ([help, 04.09.2026](https://www.coohom.com/helpcenter/how-to-export-your-projects)). .skp/.obj — не подтверждено | CAD-редактор с калибровкой масштаба. Точность модели — [вывод]. Размеры на экспортированных чертежах не подтверждены | Есть вьетнамский интерфейс ([?hl=vi](https://www.coohom.com/?hl=vi)) и VN-лендинг ([e.coohom.com](https://www.e.coohom.com/coohom-vietnam-3d-signup)). VN-способы оплаты не подтверждены |
| **Planner 5D** | Premium $19.99 (мес.) или $59.99/год; Pro $49.99 (мес.) или $399.99/год ([pricing](https://planner5d.com/pricing)) | Да: 50% каталога, без рендеров и без загрузки плана ([pricing](https://planner5d.com/pricing)) | **Официальный REST API на Pro** ([help](https://support.planner5d.com/en/articles/18243431-planner-5d-api-pro-access-and-white-label-integrations), [reference](https://planner5d.com/reference/public-api)). WebMCP работает только через агента со встроенным браузером ([webmcp](https://planner5d.com/ai/webmcp)). Работа из CLI не подтверждена | Да, AI-распознавание jpg/png/pdf/dwg, только на платных тарифах. На плане **должны быть размеры**. Срок от 10 мин до 24 ч ([help](https://support.planner5d.com/en/articles/14434484-how-to-upload-a-floor-plan)) | Каталог 8–10 тыс. предметов, менять размер можно (Premium) ([pricing](https://planner5d.com/pricing)). Диваны-кабинки и кальянные столы не подтверждены | DWG/DXF только 2D и только на Pro ([help](https://support.planner5d.com/en/articles/17706580-how-to-export-your-projects-to-cad)); PDF ([help](https://support.planner5d.com/en/articles/16527164-how-to-export-your-project-in-pdf)); рендеры HD/4K | Да для плана и DWG. Размерные линии в DWG не подтверждены | Не подтверждено (planner5d.com/vi отдаёт 404) |
| **Homestyler** | Pro+ от $6.8; Master+ от $11.8; Team от $19.9 за место ([pricing](https://www.homestyler.com/pricing)). Период оплаты не подтверждён | Да: Basic с рендерами 1K ([pricing](https://www.homestyler.com/pricing)) | API только на Enterprise ([api.pdf](https://3d-assets.homestyler.com/v2/media/api.pdf)). MCP нет | Да: картинка или DWG, автоматическое 3D ([floor-planner](https://www.homestyler.com/solution/design_floor-planner)) | Более 1 млн моделей, загрузка своих SKP/GLB, BOM на Pro+ ([pricing](https://www.homestyler.com/pricing)) | PDF/PNG/DWG, BOM ([floor-planner](https://www.homestyler.com/solution/design_floor-planner)). SKP не указан | Классический рендер по 3D-сцене [вывод]. Отдельный «AI Render» генеративный | Не подтверждено |
| **Maket** | Homeowner $20; Pro $100; Scale по запросу. Годовая оплата −17% ([pricing](https://www.maket.ai/pricing)) | 30 разовых кредитов, без экспорта | API только на Scale ([faqs](https://www.maket.ai/faqs)). MCP не подтверждён | Homeowner: 1 AI-загрузка; Pro: 5 загрузок в месяц с проверкой человеком ([pricing](https://www.maket.ai/pricing)) | Коммерческая мебель не подтверждена | PDF с размерами, DXF, PNG ([export](https://www.maket.ai/features/share-and-export)) | «Design-stage, not construction documents» ([faqs](https://www.maket.ai/faqs)) | Не подтверждено. ⛔ **В FAQ прямо сказано: только жилые проекты, коммерческие вне scope** ([faqs](https://www.maket.ai/faqs)) |
| **ArchiVinci** | $79 в месяц; $549 в год; $39 в неделю ([pricing](https://www.archivinci.com/pricing)) | 3 пробных рендера; Floor Plan Maker бесплатен ([floor-plan-maker](https://www.archivinci.com/floor-plan-maker)) | Не подтверждено (не найдено) | Да: JPG/PNG/PDF/скетч → план с размерами, масштаб по отрезку ([floor-plan-maker](https://www.archivinci.com/floor-plan-maker)) | Библиотека из 153 предметов с масштабированием. Коммерческая мебель не подтверждена | DXF, PDF, SVG, PNG, GLB, OBJ. Нет .skp/.dwg | План в размерах. Сохраняет ли AI-рендер геометрию — не подтверждено | Не подтверждено |
| **Rayon** | Solo $45 (мес.) / $38 (год); Studio на 3 места $96 / $82 ([pricing](https://docs.rayon.design/documentation/team-management-and-pricing/pricing-and-billing.md), тарифы с 16.11.2026) | Да, без экспорта; триал 14 дней ([pricing](https://docs.rayon.design/documentation/team-management-and-pricing/pricing-and-billing.md)) | Удалённый MCP `mcp.rayon.design/mcp` в статусе «preview». В документации описан как **custom connector claude.ai**, Claude Code не упомянут ([docs, 18.11.2026](https://docs.rayon.design/documentation/work-with-ai/use-rayon-in-claude-custom-connector)) | Да: JPG/PNG/PDF до 35 МБ, калибровка масштаба 1:N или по отрезку, AI «Detect walls» ([docs](https://docs.rayon.design/documentation/import-export/pdf-and-image-import.md)) | Более 10 000 блоков, импорт GLB/SKP в мм, AI-объект по фото ([docs](https://docs.rayon.design/documentation/work-in-3d/libraries-in-3d.md)) | DWG, DXF, PDF, PNG на платных тарифах. SKP только импорт | Точный 2D CAD. Рендер по 3D-сцене; совпадение в мм не подтверждено ([docs](https://docs.rayon.design/documentation/work-in-3d/rendering.md)) | Не подтверждено |
| **Nuit** (nuit.archi) | «От $39/мес» по meta страницы. Цены Design/Studio **не подтверждены** ([pricing](https://nuit.archi/pricing)) | 300 кредитов разово, только личное использование | Удалённый MCP `mcp.nuit.archi`, 19 инструментов. Описан для claude.ai/Desktop, Claude Code не упомянут ([mcp](https://nuit.archi/mcp/)) | «Upload an existing plan and Nuit reads it»; планы помечены «conceptual — not construction-ready» ([floor-plans](https://nuit.archi/floor-plans/)) | Параметрические элементы. Коммерческая мебель не подтверждена (сайт заточен под частные дома) | IFC4, DXF, GLB, OBJ на платных тарифах | Параметрическая модель; рендер в мм не подтверждён | Не подтверждено |

### 2.2 CAD/3D-моделлеры и MCP-серверы (Claude строит модель с точными размерами)

| Инструмент | Цена/мес | Free | MCP/API для Claude Code | Фото чертежа | Мебель | Экспорт | Размеры | VN |
|---|---|---|---|---|---|---|---|---|
| **SketchUp** (Trimble) | При оплате за год: Go $10.75; **Pro $33.25 ($399/год)**; Studio $71.58. Цена помесячной оплаты не подтверждена ([pricing](https://sketchup.trimble.com/en/plans-and-pricing)) | SketchUp Free: только веб, **не для коммерции**, без расширений ([help, 21.08.2026](https://help.sketchup.com/en/admin/sketchup-free)). Триал с функциями Pro, длительность не подтверждена ([help](https://help.sketchup.com/en/studio-trial)) | Ruby API, только в десктопе ([ruby.sketchup.com](https://ruby.sketchup.com/)). Сторонние MCP: [zinin/sketchup-mcp2](https://github.com/zinin/sketchup-mcp2) (MIT, push 19.11.2026, теги claude-code); [NeoNexAI/sketchup-mcp](https://github.com/NeoNexAI/sketchup-mcp) (`claude mcp add sketchup -- uvx neonexai-sketchup-mcp`); [mhyrr/sketchup-mcp](https://github.com/mhyrr/sketchup-mcp) (⚠ push 25.04.2026). Официальный «SketchUp Connector for Claude» подключается через каталог коннекторов claude.ai и **умеет только создавать новые .skp** ([help](https://help.sketchup.com/en/sketchup-claude-connector)), по условиям задачи не рассматривается | Импорт JPG/PNG (**максимум 1024×1024 px**, больше — уменьшается), масштаб рулеткой по известной длине ([help, 29.09.2026](https://help.sketchup.com/en/sketchup/importing-and-exporting-image-files), [scale](https://help.sketchup.com/en/sketchup/scaling-your-model-or-parts-your-model)); импорт PDF ([help](https://help.sketchup.com/en/sketchup/using-sketchup-data-other-modeling-programs-or-tools)) | 3D Warehouse: на Pro до 1500 загрузок в день; Dynamic Components ([pricing](https://sketchup.trimble.com/en/plans-and-pricing)). Любые свои размеры. Наличие кальянных моделей не подтверждено | **.skp**; DWG/DXF (Go/Pro/Studio); PNG/JPG; PDF в масштабе ([help, 21.10.2026](https://help.sketchup.com/en/sketchup/using-sketchup-data-other-modeling-programs-or-tools)); **LayOut** (Pro): PDF и DWG с размерами как нативными объектами ([help](https://help.sketchup.com/en/layout/exporting-cad-data-layout)) | **Да**, точная геометрия | Оплата Visa/MC/PayPal. Официальный VN-реселлер не подтверждён (заявляют FrontA и Arotech) |
| **Sweet Home 3D** | Бесплатно ([features](https://www.sweethome3d.com/features/)) | Да | Сторонние MCP: [grimashevich/sweethome3d-mcp-server](https://github.com/grimashevich/sweethome3d-mcp-server) (GPL-2.0, 94★, v1.2.0 от 21.10.2026, **нужно открытое окно приложения**, 46 команд, включая `render_photo`); [consultantstanleymn/sweethome3d-mcp](https://github.com/consultantstanleymn/sweethome3d-mcp) (MIT, 1★, без GUI, без рендера) | Подложка BMP/JPG/PNG, масштаб по отрезку ([guide](https://www.sweethome3d.com/users-guide/), ⚠ 08.04.2026) | Встроенный каталог и импорт своих моделей, любые размеры | PDF, PNG, SVG, OBJ; **список мебели в CSV** ([history](https://www.sweethome3d.com/history/), ⚠ последняя версия 7.5.2 от 29.08.2024) | **Да** | Скачивается свободно. Ограничений не найдено (не подтверждено) |
| **3D New Era AI** | Бесплатно, Apache-2.0/MIT ([GitHub](https://github.com/leandrodaf/3d-new-era-ai)) | Да | Плагин для Claude Code (`/plugin marketplace add leandrodaf/3d-new-era-ai`), headless `newera serve`. 177★, v3.3.0 от 02.11.2026 | Скан плана «at real scale», инструмент `background` находит стены | **Параметрическая мебель** (bar, sofa, table), столярка, cut list | DXF, PDF, SVG, PNG, OBJ, glTF; cut list в CSV/DXF/SVG; path-traced фото | **Да** (единицы — **см**) | Свободное ПО. Проект создан 13.09.2026, зрелость не проверена |
| **Skopia MCP** | Бесплатно; в README: «будет платным позже» ([GitHub](https://github.com/Skopia-mcp/Skopia-mcp)) | Да, ключ мгновенно | Удалённый HTTP MCP, headless: `claude mcp add --transport http skopia https://skopia.datatreehaus.com/v1 --header "Authorization: Bearer KEY"`. 18 инструментов, есть `seat_a_room`. 0★, v0.2.0 от 14.09.2026 | Не подтверждено; вход — текстовый бриф или обмер | 22 типа фикстур (кухня/ванная/спальня). Бар и лаунж не подтверждены | SVG (план/разрез/фасад), лист в масштабе, **DXF 1:1 в мм**. Нет 3D, .skp, .dwg | **Да**, только 2D | Не подтверждено |
| **Blender** + MCP | Бесплатно (GPL) | Да | [ahujasid → mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) (MIT, ~35k★, push 18.11.2026, `claude mcp add blender uvx mcp-for-blender`, нужен запущенный Blender); официальный [Blender Lab MCP](https://www.blender.org/lab/mcp-server/) (Blender 5.1+, «without any guards», советуют VM). Рендер без GUI: `blender -b … -E CYCLES` ([manual](https://docs.blender.org/manual/en/latest/advanced/command_line/render.html)) | Подложка-картинка (стандартная функция, отдельно не проверял) | Poly Haven, Sketchfab; AI-генерация 3D (Hyper3D и др.) через Premium или свои ключи, **размеры AI-моделей не гарантированы** [вывод] | PNG/EXR; OBJ/glTF (не проверено); DXF через расширение, только R12 ([ext](https://extensions.blender.org/add-ons/import-autocad-dxf-format-dxf/)) | Точно, если строить скриптом. Это не CAD с размерными линиями | Не подтверждено |
| **ezdxf** (Python-библиотека) | Бесплатно, MIT ([docs](https://ezdxf.readthedocs.io/en/stable/)) | Да | Без MCP: Claude пишет Python-скрипт. Полностью headless, v1.4.5, push 18.11.2026 | — | — | DXF R12–R2018 с размерами; PNG/PDF/SVG через аддон `drawing` | **Да**, CAD в мм | Не подтверждено |
| FreeCAD MCP / Bonsai(IFC) MCP / RhinoMCP | FreeCAD и Blender бесплатны; Rhino платный (цена не подтверждена) | — | [freecad-mcp](https://github.com/neka-nat/freecad-mcp) (3.4k★); [Bonsai_mcp](https://github.com/JotaDeRodriguez/Bonsai_mcp); [rhinomcp](https://github.com/jingcheng-chen/rhinomcp). Всем нужен запущенный десктоп | — | — | FreeCAD: DXF/TechDraw не подтверждены; Bonsai: PNG-чертежи и IFC-объёмы | Да (CAD) | — |

### 2.3 Рендер (визуализация существующей модели)

| Инструмент | Цена/мес | Free | MCP/API для Claude Code | Фото чертежа | Мебель | Экспорт | Размеры | VN |
|---|---|---|---|---|---|---|---|---|
| **D5 Render** (LiveSync с SketchUp) | Сейчас: Pro **$30/мес при оплате за год ($360)**, Teams $59 ([pricing, 04.11.2026](https://www.d5render.com/pricing)). **С начала декабря 2026:** Pro 1× $38 (мес.) / $360 (год); Basic 1× $7 / $72 ([анонс, 12.11.2026](https://www.d5render.com/posts/d5-pricing-update)) | Community бесплатен, **но только для некоммерческого использования** ([pricing](https://www.d5render.com/pricing)) | Официальный «D5 Lite CLI» для внешних агентов «like Codex or Claude» ([post, 29.09.2026](https://www.d5render.com/posts/d5-lite-cli-modeling-to-rendering)). MCP ли это — не подтверждено | — (рендерит модель) | Pro: 16 000+ ассетов ([pricing](https://www.d5render.com/pricing)) | Изображения до 16K, видео, панорамы, VR. CAD нет | **Да**: ray tracing реальной геометрии [вывод]; «AI respects your geometry» ([workflow](https://www.d5render.com/workflow/sketchup)) | Не подтверждено. Только десктоп, требования к GPU не проверены |
| **SketchUp AI Render** (бывший Diffusion) | Входит в тариф: 10 кредитов за рендер; Pro даёт 150 кредитов в месяц ≈ 15 рендеров ([help, 04.11.2026](https://help.sketchup.com/en/ai-credits)) | У Free 0 кредитов | Нет | — | — | PNG ([help](https://help.sketchup.com/en/export-options)) | **Не гарантированы**: диффузия, слайдера «respect geometry» в текущей версии нет ([help](https://help.sketchup.com/en/using-ai-render)) | Как у SketchUp |
| **Veras** (Chaos) | При оплате за год: Starter $16.90; Pro $29. Цена помесячной оплаты не подтверждена ([chaos.com/veras](https://www.chaos.com/veras)) | Триал 14 дней ([trial](https://www.chaos.com/veras/trial)) | Не подтверждено | «Sketch, floor plan, image → 3D scene» (генеративно) | Нет | Изображения/видео | **Нет гарантии**: «proportions drift» ([blog, 12.06.2026](https://blog.chaos.com/ai-rendering-in-revit-sketchup)) | Не подтверждено |
| **mnml.ai** | Lite $29; Plus $49; Studio $119; при годовой оплате 2 месяца в подарок ([pricing](https://mnml.ai/pricing)) | 100 кредитов без срока | **MCP с явной поддержкой Claude Code:** `claude mcp add --transport http mnml https://mcp.mnml.ai/mcp` ([blog, 01.10.2026](https://mnml.ai/blog/mnml-mcp-claude-chatgpt)) | Sketch to Floor Plan ([blog, 14.11.2026](https://mnml.ai/blog/studio-sketch-to-floor-plan)) | Нет | PNG; DXF/DWG для планов | «Geometry stays…» (маркетинг). Масштаб не подтверждён | Не подтверждено (оплата LemonSqueezy) |
| **Higgsfield** (уже подключён) | Starter $19; Plus $33; Ultra $50 — **акционные цены Black Friday при оплате за год**; обычные не подтверждены ([pricing](https://higgsfield.ai/pricing)) | Есть, но **без коммерческого использования** | Официальный: для Claude Code — CLI `@higgsfield/cli` + skills; **каждая генерация через MCP/CLI списывает кредиты**, безлимит только на сайте ([help](https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent)) | Нет | Нет | Изображения/видео | **Нет**: генератор пикселей [вывод] | Карты через Stripe ([billing](https://higgsfield.ai/creator-hub/help-center/billing/how-does-billing-work)); «accessed from countries around the world» ([terms §17.1](https://higgsfield.ai/terms-of-use-agreement)) |
| **Gemini image API** (Nano Banana) | По токенам: gemini-3.1-flash-image ≈ $0.067 за изображение 1K; 3-pro-image $0.134 ([pricing](https://aistudio.google.com/docs/pricing)) | Для image-моделей нет | API есть, вызов скриптом из Claude Code [вывод]. Официального MCP не найдено | Принимает картинки на вход | Нет | PNG | Не гарантированы [вывод] | **Вьетнам в списке регионов** ([regions](https://ai.google.dev/gemini-api/docs/available-regions)) |

**Не проверены** (не хватило объёма проверки): LookX, RoomSketcher, Floorplanner, Spacely, PromeAI, Krea, Rendair, Archicad AI Visualizer, Onshape MCP.

**Источники старше 6 месяцев ⚠:**
- Coohom, гайд по загрузке моделей ([2025-12-01](https://www.coohom.com/helpcenter/modeling-and-upload-guide));
- Sweet Home 3D: users guide (2026-04-08), последняя версия 7.5.2 (2024-08-29);
- mhyrr/sketchup-mcp: последний push 2026-04-25;
- пресс-релиз SketchUp × Claude ([2026-04-28](https://investor.trimble.com/news/news-details/2026/Trimble-Links-SketchUp-with-Anthropics-Claude-Bringing-New-Conversational-AI-powered-Capabilities-to-3D-Modeling/default.aspx));
- блог SketchUp Diffusion 2023 г.;
- старая страница цен Veras на evolvelab.io;
- вьетнамские источники, перечисленные в разделе 5.

---

## 3. Топ-3 стека

Время до первых рендеров — **моя оценка**, а не данные источников. Считаю от момента, когда вы передаёте Claude чертежи и схемы расстановки.

### Стек A: «SketchUp + Claude через MCP + D5» (отраслевой стандарт)

**Инструменты:**
- **SketchUp Pro** (десктоп): модель в мм, компоненты мебели, LayOut-чертежи.
- **sketchup-mcp2** или **NeoNexAI/sketchup-mcp**: Claude Code строит модель через Ruby API.
- **D5 Render Pro** через LiveSync: фотореализм.
- **Higgsfield**: по желанию, мудборды и стилизация.

**Стоимость:**
- $33.25 + $30 ≈ **$63/мес** при оплате за год. В деньгах на год это $399 + $360 = $759.
- Помесячные цены SketchUp не подтверждены; D5 Pro с декабря стоит $38 при помесячной оплате.
- Плюс кредиты Higgsfield.

**Время до первых рендеров:** 2–4 дня [оценка].

**Плюсы:**
- На выходе **именно то, что ждут цеха**: .skp + DWG/PDF с размерами из LayOut.
- Геометрия точная, рендер D5 не искажает размеры.
- Claude может построить стены, колонны и мебель скриптом с точными Ш×Г×В. Он же может выгрузить спецификацию в CSV, перебрав компоненты через Ruby API [вывод: Ruby API это позволяет, готового инструмента «spec export» в MCP нет].
- LayOut тоже управляется Ruby API ([ruby.sketchup.com](https://ruby.sketchup.com/)).

**Минусы:**
- Нужен **ваш компьютер**: SketchUp Pro работает только как десктоп-приложение, а D5 — только на десктопе, скорее всего Windows с хорошей видеокартой [вывод].
- MCP-серверы сторонние. `eval_ruby` выполняет любой код без песочницы ([предупреждение](https://www.meltflexai.com/blog/connect-claude-to-sketchup)).
- D5 Community бесплатен, но коммерческий проект на нём вести нельзя.
- Импорт картинки ограничен 1024 px, поэтому лучше обвести чертёж по размерам, а не по пикселям.

### Стек B: «Coohom Elite» (минимум техники, максимум готового каталога)

**Инструменты:**
- **Coohom Elite**: импорт фото плана с автораспознаванием, каталог Booth Seating / Commercial / бар, AIHom, рендеры, BOM, CAD/PDF-чертежи.
- **Higgsfield**: по желанию, атмосфера.

**Стоимость:** **$58/мес** при оплате за год ($699) или **$69** при помесячной оплате. Достаточно 1–2 месяцев.

**Время до первых рендеров:** 1–2 дня [оценка].

**Плюсы:**
- Всё в браузере, ничего не нужно ставить.
- Есть вьетнамский интерфейс.
- Каталог коммерческой мебели и BOM.
- Самый быстрый путь к красивым картинкам.

**Минусы:**
- **Нет MCP для Claude Code**, так что основную работу мышкой делаете вы, а AIHom только помогает.
- Строительные чертежи на Elite **«excluding custom furniture»**: на кастомные диваны и бар, то есть ровно то, что нужно цеху, чертежей не будет.
- Экспорт .skp не подтверждён.

### Стек C: «Всё делает Claude Code, бесплатный open-source»

**Инструменты:**
- **3D New Era AI** или **Sweet Home 3D + MCP**: подложка чертежа, стены, колонны, параметрическая мебель, cut list / CSV-спецификация.
- **ezdxf**: DXF и PDF с размерами.
- **Blender headless** (`blender -b`, Cycles): рендеры.
- **Higgsfield / mnml.ai**: дополнительная стилизация рендеров.

**Стоимость:** **$0** плюс кредиты Higgsfield. mnml по желанию, от $29.

**Время до первых рендеров:** 3–5 дней [оценка], включая отладку.

**Плюсы:**
- Claude действительно делает основную работу.
- Большая часть работает **headless**, даже в облачном контейнере.
- Точные размеры; спецификация выгружается машиной (CSV / cut list).
- Платить не за что.

**Минусы:**
- Инструменты молодые: 3D New Era AI существует с сентября 2026, у Skopia 0★.
- Качество рендера Blender зависит от ассетов и настройки света.
- **Нет .skp**: цеху уйдут DXF + PDF + CSV. Судя по разделу 1, это допустимо, но не стандарт.
- В 3D New Era AI единицы — см.

---

## 4. Рекомендация: стек A, с подстраховкой из стека C

**Почему A:**
- Цех во Вьетнаме работает с **SketchUp + DWG**, и только стек A даёт оба формата нативно и с точными размерами.
- Claude Code управляет SketchUp через MCP, так что строит модель он, а не вы.
- Рендеры D5 строятся по той же геометрии, что и спецификация, поэтому картинка и заказ не разойдутся.

**Если нет Windows-ПК с видеокартой:** D5 заменяется SketchUp AI Render (входит в Pro) или стилизацией видов модели через Higgsfield. Это допустимо, потому что **размеры берутся из модели, а не из рендера**.

**Если вообще нет десктопа:** берите стек C.

### Пошаговый план

0. **Подготовка (вы, около 1 часа).**
   - Узнайте высоту потолка и высоту под балками для обоих этажей. Без неё не построить разрезы, бар и освещение.
   - Положите в репозиторий 2 схемы расстановки и 3 фото чертежей 1:100.
   - Напишите в Zalo 1–2 данангским цехам, например Gia Công Sofa Đà Nẵng, 5E Design, Thiện Quý. Спросите: «nhận file .skp / .dwg / PDF không?» (принимаете ли вы .skp / .dwg / PDF).
1. **Установка (вы и Claude, около 2 часов).**
   - Купите триал или подписку SketchUp Pro, установите на свой компьютер.
   - Поставьте расширение `.rbz` из sketchup-mcp2 или NeoNexAI и выполните `claude mcp add sketchup -- uvx …`. Держите MCP только на localhost.
   - Установите D5 и плагин LiveSync.
2. **План в мм (Claude, день 1).**
   - Claude читает фото чертежей и схемы. Он сводит размеры в таблицу: оси колонн, сечения колонн, лестница, проёмы, санузлы. Неясные места он перечисляет списком вопросов вам.
   - После ваших ответов Claude строит обе «коробки» 10 000 × 14 000 мм с колоннами, лестницей и проёмами. Каждый этаж — отдельный тег (слой).
   - Контроль: вы проверяете рулеткой в SketchUp 3–4 контрольных размера по чертежу.
3. **Мебель (Claude, дни 1–2).**
   - Claude создаёт параметрические компоненты: барная стойка, диваны-кабинки, кальянные столы, пуфы, стеллажи. Размеры — из эргономики, которую вы утверждаете. Пример запроса: «высота сиденья 400–450, стол под кальян 450–550».
   - Каждому компоненту задаются атрибуты: материал, отделка, кол-во.
   - Мебель расставляется по вашим схемам tầng 1 / tầng 2.
4. **Стиль и материалы (вы с Claude, день 2).** Higgsfield генерирует 3–5 мудбордов. Вы выбираете один, Claude назначает материалы и подбирает свет.
5. **Рендеры (D5, дни 2–3).**
   - LiveSync переносит модель в D5, там 6–10 ракурсов на этаж.
   - По желанию: «доводка атмосферы» через Higgsfield с подписью «иллюстрация, размеры не точные».
6. **Документы для цеха (Claude, дни 3–4).**
   - Ruby-скрипт выгружает **спецификацию CSV/XLSX**: позиция, Ш×Г×В мм, материал, кол-во, этаж.
   - LayOut собирает **PDF-комплект**: план каждого этажа с размерами, развёртки бара, по листу на каждое изделие (3 вида и размеры).
   - Плюс экспорт **DWG** и сам **.skp**.
7. **Согласование с цехом.** Отправьте .skp + PDF + CSV в Zalo и попросите báo giá (смету) и shop drawing. Перед оплатой сверьте shop drawing со своей спецификацией.

**Бюджет:** около $63/мес при оплате за год. Если помесячно, цена не подтверждена: проверьте в корзине SketchUp из Вьетнама. На проект скорее всего хватит 1–2 месяцев плюс кредиты Higgsfield.

---

## 5. Сравнение с вариантом «нанять местного дизайнера»

Курс: 1 USD = 25 930 VND (Vietcombank, продажа, 17.11.2026, [baomoi](https://baomoi.com/tien-ich-ty-gia-ngoai-te-vietcombank.epi)).

### Цены данангских студий (маркетинговые страницы компаний)

| Студия | Услуга | VND/м² | USD/м² | Источник |
|---|---|---|---|---|
| 5E Design (Дананг) | Дизайн кафе, тарифы IDEA → ICONIC | 150k / 180k / 250k / 300k / 600k | 5.8–23.1 | [5edesign.vn, 22.06.2026](https://5edesign.vn/thiet-ke-quan-ca-phe-da-nang/) |
| Kiến Trúc Đỏ (Дананг) | Ресторан/кафе: базовый / расширенный (3D + план + детали) | 200–350k / 400–600k | 7.7–13.5 / 15.4–23.1 | [kientrucdo.com, 22.08.2026](https://kientrucdo.com/thiet-ke-thi-cong-noi-that-tai-da-nang/) |
| TAGIA DECOR (Дананг) | Магазин: 2D + 3D + техкомплект | 150–200k | 5.8–7.7 | [kesattrangtridanang.com, 01.07.2026](https://kesattrangtridanang.com/bao-gia-thiet-ke-thi-cong-shop-da-nang-2026.html) |
| Dana Sun (Дананг) | Интерьер кафе, «от» | от 80k | от 3.1 | [danasun.vn](https://danasun.vn/tu-van-thiet-ke-noi-that-quan-cafe-tai-da-nang) (дата не указана) |
| Фриланс (VN) | Пакет 2D + 3D | от 999 999 VND за пакет | от 38.6 | [vietgigs.vn](https://vietgigs.vn/categories/graphic-design/exterior-interior-design) (дата не указана) |
| Фриланс (FB-группа) | Рендер одного ракурса | 800k–1 млн | 31–39 | [facebook](https://www.facebook.com/groups/vethue3d/posts/935962985465496/) (дата не видна) |
| HCMC (для сравнения) | 3D-перспектива / визуализация | 200k / 800k за вид | 7.7 / 30.9 | [dichvudanhvanban.com](https://dichvudanhvanban.com/bao-gia-ve-phoi-canh-3d-tai-tp-hcm-gia-re-dich-vu-nhanh-chong-ho-tro-truc-tuyen-848) ⚠ 20.11.2024 |

**Для 280 м²:** 150–350k/м² дают **42–98 млн VND ≈ $1 620–3 780**. Премиальный тариф 600k/м² даёт около 168 млн ≈ $6 480.

**Сроки:** 5E — 7–15 дней; Song Lê — 10–20 дней; TAGIA — 3D и смета на 3–7-й день.

**Важно: дизайн часто бесплатно или со скидкой при заказе изготовления у той же компании.**
- TAGIA возвращает 70–100% стоимости дизайна.
- Song Lê даёт скидку 50–100%.
- Thiện Quý делает 3D бесплатно при заказе стойки.
- У 5E, Kiến Trúc Đỏ и TAGIA есть свои цеха.

### Сравнение

| | AI-стек A | Местный дизайнер |
|---|---|---|
| Деньги | ≈ $63/мес при оплате за год ($759 за год); на проект 1–2 мес. | $1 620–3 780 за 280 м², **или ~$0 при заказе изготовления у той же компании** |
| Время | 3–5 дней [оценка] плюс ваше время на проверку | 7–20 дней по сайтам студий |
| Ваше участие | Высокое: проверка размеров, решения, работа с цехом | Низкое |
| Знание местных норм, материалов и цен | Нет | Да |
| Свобода выбора цеха | Полная: файлы ваши | При «бесплатном» дизайне вы привязаны к их цеху |
| Риск ошибок в размерах | Ваш: проверять обязательно | На дизайнере и цехе (shop drawing) |

**Вывод [вывод]:**
- Самая выгодная схема для вас — **гибрид**. Сделайте концепт на стеке A: модель, рендеры, спецификацию. С этим пакетом запросите сметы у 2–3 данангских студий с собственным цехом.
- Студия всё равно сделает свой shop drawing. Если она даёт дизайн бесплатно при заказе изготовления, ваш AI-концепт становится техзаданием, по которому сметы можно сравнить честно.
- Если концепт делать самому не хочется, дизайнер обойдётся всего в $1.6–3.8k, а при заказе изготовления у той же студии — почти бесплатно. По деньгам это близко к AI-стеку, но сэкономит ваше время.

### Цены на мебель на заказ, для ориентира

| Изделие | VND | USD | Источник |
|---|---|---|---|
| Стойка ЛДСП/МДФ (Дананг) | 2.5–5 млн за пог. м | 96–193 за м | [ducanvu.com](https://ducanvu.com/dong-quay-cafe-tai-da-nang.html) |
| Стойка из массива (Дананг) | 4.5–8 млн за пог. м | 174–309 за м | там же |
| Стойка: нержавейка / сталь с покраской (Дананг) | 3–6 млн за пог. м | 116–231 за м | там же |
| Диваны-кабинки, кальянные столы | — | **не подтверждено** (только «báo giá theo bản vẽ», смета по чертежу) | [giacongsofa.vn](https://giacongsofa.vn/) |

Примеров именно кальянных или шиша-лаунжей в Дананге **не найдено**.
