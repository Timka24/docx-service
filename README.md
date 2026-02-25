# docx-service

Сервис для заполнения медицинских протоколов сердечно-лёгочной реанимации (СЛР). Пользователь заполняет веб-форму, данные сохраняются в PostgreSQL, генерируется DOCX-документ по шаблону.

## Статус проекта (актуально)

- **Статус:** рабочий MVP / pre-production
- **Что стабильно работает:** форма СЛР, сохранение архива, версионирование рендеров, асинхронная генерация DOCX воркером
- **Что в процессе развития:** PDF-конвейер (поля и статусы уже в БД), UI для просмотра архива, backend-валидация обязательных полей

## Функциональность

- **Веб-форма** — форма ввода данных протокола СЛР (бригада, пациент, время, ВДП, сосудистый доступ, ИВЛ, ритмы, дефибрилляция, медикаменты)
- **Генерация DOCX** — постановка задачи в очередь рендеров и асинхронная обработка отдельным воркером
- **Архив** — сохранение данных формы в БД (JSONB), получение списка, карточки записи и её рендер-версий
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
│   ├── form.html         # Страница формы (HTML + CSS)
│   └── js/
│       ├── form-init.js      # Инициализация, обработчики, submit
│       ├── form-payload.js   # Сборка payload, formatDateForDocx, marksFromResult
│       ├── grid-chrono.js    # createChronoRow — символьные сетки (+, -, ■)
│       ├── grid-energy.js    # createEnergyRow — энергия дефибрилляции (Дж)
│       └── grid-numeric.js   # createNumericRow — объёмы в мл (дробные)
├── migrations/
│   ├── 001_init.sql      # Базовая таблица archives
│   └── 002_archive_versions.sql # Версионирование рендеров + новые поля archives
├── worker/
│   └── docx-worker.js    # Фоновая обработка pending DOCX-рендеров
├── template.docx         # Шаблон DOCX
├── docker-compose.yaml   # app + worker + postgres
├── Dockerfile
└── package.json
```

## API

| Метод | Маршрут | Описание |
|-------|---------|----------|
| GET   | `/form` | Страница формы |
| POST  | `/generate` | Сохранение архива + постановка DOCX-рендера в очередь (`queued`) |
| GET   | `/archive` | Список последних 100 архивов + статусы последнего рендера |
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

### Таблица `archive_renders`

- `archive_id`, `version` — версия рендера для конкретного архива
- `docx_status` / `docx_key` / `docx_error` — статус DOCX-конвейера
- `pdf_status` / `pdf_key` / `pdf_error` — задел под PDF-конвейер

Миграции: `migrations/001_init.sql`, затем `migrations/002_archive_versions.sql`

## Запуск

### Переменные окружения

- `DATABASE_URL` — строка подключения PostgreSQL (обязательно)
- `PORT` — порт (по умолчанию 3000)
- `DOCX_DIR` — директория хранения DOCX у воркера (по умолчанию `./storage/docx`)
- `WORKER_POLL_INTERVAL_MS` — интервал опроса очереди (по умолчанию `3000`)
- `WORKER_BATCH_SIZE` — размер батча за цикл (по умолчанию `1`)

### Локально

```bash
npm install
# Выполнить migrations/001_init.sql
DATABASE_URL=postgresql://user:pass@localhost/db node index.js
```

### Docker

```bash
docker build -t docx-service .
docker run -e DATABASE_URL=postgresql://... -p 3000:3000 docx-service
```

### Docker Compose (app + worker + postgres)

1. Подготовьте директорию на хосте для DOCX-файлов:

```bash
sudo mkdir -p /srv/slr-docx
sudo chown -R $USER:$USER /srv/slr-docx
```
docker compose up -d --build
docker compose logs -f worker
```

`docker-compose.yaml` поднимает:

- `db` (PostgreSQL) с постоянным томом `db_data`
- `app` (API) на `3000:3000`
- `worker` (DOCX-воркер) из того же образа

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
- [x] Docker Compose стек: `app + worker + postgres`

## Не реализовано / на будущее

- Интерфейс просмотра архива/версий (есть только API)
- PDF-воркер и фактическая генерация PDF (схема в БД уже подготовлена)
- Вынос CSS в отдельный файл
- Расширенная валидация обязательных полей на бэкенде

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
