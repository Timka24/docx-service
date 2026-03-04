# docx-service

Сервис для заполнения медицинских протоколов сердечно-лёгочной реанимации (СЛР). Пользователь заполняет веб-форму, данные сохраняются в PostgreSQL, генерируется DOCX-документ по шаблону.

## Статус проекта (актуально)

- **Статус:** рабочий MVP / pre-production
- **Что стабильно работает:** форма СЛР, сохранение архива, версионирование рендеров, асинхронная генерация DOCX и PDF воркерами
- **Что в процессе развития:** UI для просмотра архива, backend-валидация обязательных полей

## Функциональность

- **Веб-форма** — форма ввода данных протокола СЛР (бригада, пациент, время, ВДП, сосудистый доступ, ИВЛ, ритмы, дефибрилляция, медикаменты)
- **Генерация DOCX** — постановка задачи в очередь рендеров и асинхронная обработка отдельным воркером
- **Архив** — сохранение данных формы в БД (JSONB), получение списка, карточки записи и её рендер-версий
- **Уникальность `kv_num`** — на уровне БД и API предотвращаются дубли; при конфликте возвращается `409 kv_num_exists`
- **Поиск карты по `kv_num`** — отдельный endpoint для быстрого поиска ранее сохранённой записи
- **Хронометраж по минутам (1–70)** — интерактивные сетки для ручных/автоматических компрессий, ИВЛ, ритмов, энергии дефибрилляции, объёмов лекарств (адреналин, амиодарон)

## Структура проекта

```
docx-service/
├── index.js              # Точка входа Express
├── lib/
│   ├── normalize.js      # Нормализация данных (pad2, normalizeRow70, normalizeMl70, …)
│   ├── template-data.js  # Сборка объекта для шаблона из req.body
│   ├── docx-render.js    # Рендеринг DOCX (Docxtemplater + PizZip)
│   └── archive-service.js# Сохранение архива и создание версий рендера
├── routes/
│   ├── form.js           # GET /form
│   ├── generate.js       # POST /generate (save + queue render)
│   └── archive.js        # /archive API (list, details, save, queue render)
├── public/
│   ├── form.html         # Страница формы (HTML)
│   ├── css/
│   │   └── form.css      # Стили формы
│   └── js/
│       ├── form-init.js      # Инициализация, обработчики, submit
│       ├── form-payload.js   # Сборка payload, formatDateForDocx, marksFromResult
│       ├── grid-chrono.js    # createChronoRow — символьные сетки (+, -, ■)
│       ├── grid-energy.js    # createEnergyRow — энергия дефибрилляции (Дж)
│       └── grid-numeric.js   # createNumericRow — объёмы в мл (дробные)
├── migrations/
│   ├── 001_init.sql      # Базовая таблица archives
│   ├── 002_archive_versions.sql # Версионирование рендеров + новые поля archives
│   ├── 003_add_pdf_retry_fields.sql # Поля retry для PDF-конвейера
│   └── 004_kv_num_unique.sql # Уникальный индекс по kv_num + индекс поиска
├── test/
│   └── archive-service.test.js # Unit-тесты сценариев saveArchive
├── worker/
│   ├── docx-worker.js    # Фоновая обработка pending DOCX-рендеров
│   └── pdf-worker.js     # Фоновая конвертация DOCX -> PDF через Gotenberg
├── template.docx         # Шаблон DOCX
├── docker-compose.yaml   # app + docx-worker + pdf-worker + gotenberg + postgres
├── Dockerfile
└── package.json
```

## API

| Метод | Маршрут | Описание |
|-------|---------|----------|
| GET   | `/form` | Страница формы |
| POST  | `/generate` | Сохранение архива + постановка DOCX-рендера в очередь (`queued`) |
| GET   | `/archive` | Список последних 100 архивов + статусы последнего рендера |
| GET   | `/archive/by-kv?kv_num=...` | Поиск архива по номеру карты (`kv_num`) |
| GET   | `/archive/:id` | Карточка архива + все версии рендеров |
| POST  | `/archive/save` | Сохранить/обновить архив без постановки рендера |
| POST  | `/archive/:id/render` | Поставить новую версию рендера в очередь |

## БД

PostgreSQL.

### Таблица `archives`

- `id` — bigserial
- `created_at` — timestamptz
- `stored` — legacy-флаг (оставлен для обратной совместимости)
- `docx_key` — legacy-ключ хранения (оставлен для обратной совместимости)
- `data` — JSONB с нормализованными данными для шаблона
- `raw_data` — JSONB с исходным payload из формы
- `kv_num` — номер карты/случая (обязателен для постановки рендера)
- `updated_at` — дата обновления записи

Ограничения и индексы:

- уникальный partial index `archives_kv_num_uniq` на `kv_num` (для `kv_num is not null`)
- индекс `archives_kv_num_idx` для быстрого lookup по `kv_num`

### Таблица `archive_renders`

- `archive_id`, `version` — версия рендера для конкретного архива
- `docx_status` / `docx_key` / `docx_error` — статус DOCX-конвейера
- `pdf_status` / `pdf_key` / `pdf_error` — статус PDF-конвейера
- `pdf_attempts` / `pdf_next_attempt_at` — счётчик попыток и время следующего ретрая PDF

Миграции: `migrations/001_init.sql`, затем `migrations/002_archive_versions.sql`, затем `migrations/003_add_pdf_retry_fields.sql`, затем `migrations/004_kv_num_unique.sql`

## Логика сохранения архива (`saveArchive`)

- **Create-режим** (без `archive_id`) — создаётся новая запись.
- **Edit-режим** (с `archive_id`):
  - если `kv_num` не изменился, обновляется текущая запись;
  - если `kv_num` изменился, создаётся **новая** запись (старый архив сохраняется как историческая версия).
- При нарушении уникальности `kv_num` API возвращает `409` с ошибкой `kv_num_exists`.

На клиенте форма использует это поведение так:

- при blur поля номера карты выполняется запрос `GET /archive/by-kv`;
- если карта найдена — предлагается загрузить её в форму;
- при ответе `409 kv_num_exists` поле `kv_num` подсвечивается, после чего предлагается загрузка существующей карты.

## Запуск

### Переменные окружения

- `DATABASE_URL` — строка подключения PostgreSQL (обязательно)
- `PORT` — порт (по умолчанию 3000)
- `DOCX_DIR` — директория хранения DOCX у воркера (по умолчанию `./storage/docx`)
- `PDF_DIR` — директория хранения PDF у `pdf-worker` (по умолчанию `./storage/pdf`)
- `GOTENBERG_URL` — URL сервиса Gotenberg (по умолчанию `http://gotenberg:3000`)
- `GOTENBERG_LIBREOFFICE_ENDPOINT` — endpoint конвертации (по умолчанию `/forms/libreoffice/convert`)
- `PDF_CONVERT_TIMEOUT_MS` — таймаут конвертации PDF (по умолчанию `60000`)
- `MAX_PDF_BYTES` — ограничение размера PDF в байтах (по умолчанию `31457280`)
- `WORKER_POLL_INTERVAL_MS` — интервал опроса очереди (по умолчанию `3000`)
- `WORKER_BATCH_SIZE` — размер батча за цикл (по умолчанию `1`)

### Локально

```bash
npm install
# Выполнить migrations/001_init.sql, 002_archive_versions.sql, 003_add_pdf_retry_fields.sql, 004_kv_num_unique.sql
DATABASE_URL=postgresql://user:pass@localhost/db node index.js
```

### Тесты

```bash
npm test
```

### Docker

```bash
docker build -t docx-service .
docker run -e DATABASE_URL=postgresql://... -p 3000:3000 docx-service
```

### Docker Compose (app + docx-worker + pdf-worker + gotenberg + postgres)

1. Подготовьте директории на хосте для DOCX/PDF-файлов:

```bash
sudo mkdir -p /srv/slr-docx /srv/slr-pdf
sudo chown -R $USER:$USER /srv/slr-docx /srv/slr-pdf
```
```bash
docker compose up -d --build
docker compose logs -f worker
docker compose logs -f pdf-worker
```

`docker-compose.yaml` поднимает:

- `db` (PostgreSQL) с постоянным томом `db_data`
- `app` (API) на `3000:3000`
- `worker` (DOCX-воркер) из того же образа
- `pdf-worker` (PDF-воркер) из того же образа
- `gotenberg` (конвертация DOCX -> PDF)

> Важно: SQL-скрипты из `./migrations` в `/docker-entrypoint-initdb.d` применяются только при первом старте новой БД (когда том `db_data` пустой).


## Технологии

- **Backend:** Node.js, Express, pg, docxtemplater, pizzip
- **Frontend:** ES modules (без сборки), vanilla JS
- **Шаблон:** один DOCX с плейсхолдерами `[[...]]`

## Реализовано

- [x] Модульная структура (lib, routes, public/js)
- [x] Ведение протокола СЛР (форма, валидация, нормализация)
- [x] Хронометраж 1–70 мин: символы (+, -, ■), энергия (Дж), объёмы (мл)
- [x] Режимы заполнения сеток: рисование (drag) и диапазон (2 тапа)
- [x] Генерация DOCX с подстановкой данных
- [x] Сохранение в PostgreSQL (`data` + `raw_data`)
- [x] Асинхронная очередь рендеров DOCX (`archive_renders`)
- [x] Версионирование рендеров для одного архива
- [x] API архива (список, карточка, сохранение, постановка рендера)
- [x] Docker-образ
- [x] Docker Compose стек: `app + docx-worker + pdf-worker + gotenberg + postgres`

## Не реализовано / на будущее

- Интерфейс просмотра архива/версий (есть только API)
- Вынос CSS в отдельный файл
- Расширенная валидация обязательных полей на бэкенде

## PDF worker

Асинхронная генерация PDF выполняется отдельным воркером:

```bash
node worker/pdf-worker.js
```

Переменные окружения:

- `DATABASE_URL` — подключение к PostgreSQL
- `DOCX_DIR` — директория исходных DOCX
- `PDF_DIR` — директория хранения PDF
- `GOTENBERG_URL` — URL Gotenberg
- `GOTENBERG_LIBREOFFICE_ENDPOINT` — endpoint конвертации (по умолчанию `/forms/libreoffice/convert`)
- `PDF_CONVERT_TIMEOUT_MS` — таймаут запроса к Gotenberg
- `MAX_PDF_BYTES` — ограничение размера принимаемого PDF
- `WORKER_POLL_INTERVAL_MS` — интервал опроса очереди
- `WORKER_BATCH_SIZE` — размер батча за цикл

Логика:

- берёт записи `archive_renders` со статусами `docx_status='ready'` и `pdf_status='pending'`;
- строит путь PDF по `pr_date` (предпочтительно `archives.data.pr_date_iso`) и `kv_num` в формате `YYYY/<месяц_рус_нижний>/DD/<kv_num>.pdf`;
- конвертирует готовый DOCX через Gotenberg;
- при временных ошибках выполняет до 3 попыток с backoff и сохраняет `pdf_attempts`/`pdf_next_attempt_at`;
- выставляет `pdf_status` в `ready` или `failed`.

## DOCX worker

Асинхронная генерация DOCX выполняется отдельным воркером:

```bash
node worker/docx-worker.js
```

Переменные окружения:

- `DATABASE_URL` — подключение к PostgreSQL
- `DOCX_DIR` — директория хранения DOCX (по умолчанию `./storage/docx`)
- `WORKER_POLL_INTERVAL_MS` — интервал опроса очереди (по умолчанию `3000`)
- `WORKER_BATCH_SIZE` — размер батча за цикл (по умолчанию `1`)

Воркер берёт записи `archive_renders` со статусом `docx_status='pending'`,
генерирует DOCX из `archives.data`, сохраняет файл в `DOCX_DIR` по ключу вида
`YYYY/MM/DD/<archive_id>/v<version>.docx` и выставляет `ready/failed`.
