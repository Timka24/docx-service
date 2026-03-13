# docx-service

Сервис для заполнения медицинских протоколов сердечно-лёгочной реанимации (СЛР):
- пользователь заполняет веб-форму;
- данные проходят нормализацию и backend-валидацию;
- запись сохраняется в PostgreSQL (архив);
- генерация DOCX и PDF выполняется асинхронно через очередь рендеров.

## Статус проекта (актуально)

- **Статус:** рабочий MVP / pre-production.
- **Стабильно работает:**
  - форма СЛР (`/form`);
  - архивный UI (список `/archive` + карточка `/archive/:id`);
  - API сохранения/поиска/выдачи архива;
  - версионирование рендеров (`archive_renders`);
  - асинхронная генерация DOCX отдельным воркером;
  - асинхронная генерация PDF отдельным воркером через Gotenberg с retry/backoff.
  - UX-слой формы: режимы `basic/full`, секционная навигация, прогресс заполнения и восстановление черновика.
- **В развитии:** расширение бизнес-валидации обязательных полей и UX сценариев повторной загрузки данных.

## Функциональность

- **Веб-форма СЛР**
  - ввод данных бригады, пациента, времени, этапов СЛР, ритмов, дефибрилляции, медикаментов;
  - поддержка хронометража по минутам (1–70) для ряда блоков;
  - режимы формы: `basic` скрывает неключевые разделы целиком, `full` показывает полную форму;
  - секционная структура формы с аккордеоном и быстрой навигацией по видимым разделам;
  - автосохранение черновика в `localStorage` с восстановлением данных и выбранного режима после перезагрузки;
  - индикатор прогресса заполнения и блок проверки ключевых полей перед формированием;
  - сборка payload клиентскими модулями в `public/js`.

- **Сохранение и архив**
  - сохранение сырого payload и нормализованных данных в PostgreSQL;
  - получение списка архива с фильтрами/пагинацией;
  - карточка записи с историей версий рендера;
  - поиск по номеру карты `kv_num`.

- **Уникальность `kv_num`**
  - на уровне БД используется уникальный индекс;
  - на уровне API конфликт возвращается как `409 kv_num_exists`.

- **Асинхронный конвейер документов**
  - `POST /generate` создаёт/обновляет архив и ставит задачу в очередь рендера;
  - DOCX-воркер формирует `docx_key` и сохраняет документ в файловое хранилище;
  - PDF-воркер берёт готовый DOCX, отправляет в Gotenberg, сохраняет PDF и пишет `pdf_key`;
  - при временных сбоях PDF-воркер делает повторные попытки с backoff.

## Структура проекта

```text
docx-service/
├── index.js                  # Точка входа Express
├── template.docx             # DOCX-шаблон с плейсхолдерами
├── routes/
│   ├── form.js               # GET /form, /archive, /archive/:archiveId
│   ├── generate.js           # POST /generate (validate + save + queue render)
│   └── archive.js            # /api/archive и download endpoints
├── lib/
│   ├── validation.js         # Backend-валидация payload
│   ├── normalize.js          # Нормализация полей формы
│   ├── template-data.js      # Сборка данных для шаблона
│   ├── docx-render.js        # Генерация DOCX (docxtemplater + pizzip)
│   └── archive-service.js    # Save/update архива + create render version
├── worker/
│   ├── docx-worker.js        # Обработка docx_status=pending
│   └── pdf-worker.js         # Обработка pdf_status=pending + retry/backoff
├── migrations/
│   ├── 001_init.sql
│   ├── 002_archive_versions.sql
│   ├── 003_add_pdf_retry_fields.sql
│   └── 004_kv_num_unique.sql
├── public/
│   ├── form.html
│   ├── archive.html
│   ├── archive-card.html
│   ├── css/
│   │   ├── form.css
│   │   └── archive.css
│   └── js/
│       ├── form-init.js
│       ├── form-payload.js
│       ├── archive-list.js
│       ├── archive-card.js
│       ├── grid-chrono.js
│       ├── grid-energy.js
│       └── grid-numeric.js
├── test/
│   └── archive-service.test.js
├── Dockerfile
├── docker-compose.yaml
└── package.json
```

## Архитектура и поток данных

1. Клиент отправляет форму на `POST /generate`.
2. API валидирует payload (`lib/validation.js`) и сохраняет архив (`lib/archive-service.js`).
3. Для архива создаётся новая версия рендера в `archive_renders` со статусами `pending`.
4. `worker/docx-worker.js` забирает pending-задачу, генерирует DOCX, сохраняет файл и отмечает `docx_status = ready`.
5. `worker/pdf-worker.js` обрабатывает задачи с готовым DOCX, конвертирует через Gotenberg и отмечает `pdf_status = ready`.
6. UI архива позволяет отслеживать статусы и скачивать итоговые файлы.

## API и маршруты

### UI маршруты

- `GET /form` — страница формы.
- `GET /archive` — список архива.
- `GET /archive/:archiveId` — карточка архивной записи.

### Основные API

- `POST /generate` — валидация + сохранение + постановка версии рендера.
- `GET /api/archive` — список архива (фильтры/пагинация).
- `GET /api/archive/by-kv?kv_num=...` — поиск записи по `kv_num`.
- `GET /api/archive/:id` — карточка архива + версии рендеров.
- `POST /api/archive/save` — сохранение архива без постановки рендера.
- `POST /api/archive/:id/render` — ручная постановка новой версии рендера.
- `GET /api/archive/:id/download/docx?version=...` — скачать DOCX.
- `GET /api/archive/:id/download/pdf` — скачать PDF.

### Legacy-алиасы (обратная совместимость)

- `GET /archive/by-kv`
- `POST /archive/save`
- `POST /archive/:id/render`

## Логика сохранения архива (`saveArchive`)

- **Create-режим** (без `archive_id`) — создаётся новая запись.
- **Edit-режим** (с `archive_id`):
  - если `kv_num` не изменился, обновляется текущая запись;
  - если `kv_num` изменился, создаётся новая запись (историчность сохраняется).
- При конфликте уникальности по `kv_num` API возвращает `409` с ошибкой `kv_num_exists`.

## Валидация payload (backend)

На текущий момент валидация проверяет:
- тип верхнего объекта (должен быть JSON object);
- длины текстовых полей;
- формат и диапазоны час/мин полей;
- размер и типы minute-grid полей (ровно 70 элементов);
- форматы значений для числовых/энергетических сеток.

> Важно: это базовая структурная/форматная валидация. Полная проверка обязательности бизнес-полей продолжает развиваться.

## Переменные окружения

### Обязательная

- `DATABASE_URL` — строка подключения PostgreSQL.

### Основные

- `PORT` — порт приложения (по умолчанию `3000`).
- `DOCX_DIR` — директория хранения DOCX (по умолчанию `./storage/docx`).
- `PDF_DIR` — директория хранения PDF (по умолчанию `./storage/pdf`).

### Gotenberg / PDF

- `GOTENBERG_URL` — адрес Gotenberg (по умолчанию `http://gotenberg:3000`).
- `GOTENBERG_LIBREOFFICE_ENDPOINT` — endpoint конвертации (по умолчанию `/forms/libreoffice/convert`).
- `PDF_CONVERT_TIMEOUT_MS` — таймаут запроса конвертации (по умолчанию `60000`).
- `MAX_PDF_BYTES` — лимит размера получаемого PDF (по умолчанию `31457280`).

### Воркеры

- `WORKER_POLL_INTERVAL_MS` — интервал опроса очереди (по умолчанию `3000`).
- `WORKER_BATCH_SIZE` — количество задач за цикл (по умолчанию `1`).

## Локальный запуск (без Docker)

1) Установите зависимости:

```bash
npm install
```

2) Примените SQL-миграции в порядке:

```bash
migrations/001_init.sql
migrations/002_archive_versions.sql
migrations/003_add_pdf_retry_fields.sql
migrations/004_kv_num_unique.sql
```

3) Запустите API:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/docxdb npm start
```

4) (Опционально) Запустите воркеры отдельными процессами:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/docxdb npm run worker:docx
DATABASE_URL=postgresql://user:pass@localhost:5432/docxdb npm run worker:pdf
```

## Тесты

```bash
npm test
```

## Docker

```bash
docker build -t docx-service .

docker run --rm -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/docxdb \
  -e DOCX_DIR=/app/storage/docx \
  -e PDF_DIR=/app/storage/pdf \
  docx-service
```

## Docker Compose (app + docx-worker + pdf-worker + gotenberg + postgres)

### Что поднимается

`docker-compose.yaml` поднимает:
- `db` — PostgreSQL 16 + volume `db_data`;
- `app` — Express API на `3000:3000`;
- `worker` — DOCX-воркер из того же образа;
- `pdf-worker` — PDF-воркер из того же образа;
- `gotenberg` — конвертация DOCX → PDF.

### Подготовка директорий на хосте

```bash
sudo mkdir -p /srv/slr-docx /srv/slr-pdf
sudo chown -R "$USER":"$USER" /srv/slr-docx /srv/slr-pdf
```

### Перечень команд Docker Compose

#### Запуск и сборка

```bash
# запуск всего стека в фоне с пересборкой
docker compose up -d --build

# запуск отдельных сервисов
docker compose up -d --build app
docker compose up -d --build worker
docker compose up -d --build pdf-worker
docker compose up -d --build gotenberg
docker compose up -d --build db
```

#### Статус и диагностика

```bash
# состояние сервисов
docker compose ps

# потоковые логи всего стека
docker compose logs -f

# логи конкретных сервисов
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f pdf-worker
docker compose logs -f db
docker compose logs -f gotenberg
```

#### Выполнение команд внутри контейнеров

```bash
# shell внутри API-контейнера
docker compose exec app sh

# подключение к postgres
docker compose exec db psql -U docx -d docxdb
```

#### Остановка и удаление

```bash
# мягкая остановка контейнеров
docker compose stop

# остановка + удаление контейнеров и сети
docker compose down

# полная очистка с удалением volume (ОПАСНО: удалит данные БД)
docker compose down -v
```

> Важно: SQL-скрипты из `./migrations`, проброшенные в `/docker-entrypoint-initdb.d`, выполняются только при первом старте нового volume `db_data`.

## Технологии

- **Backend:** Node.js, Express, pg
- **Генерация документов:** docxtemplater, pizzip, Gotenberg
- **Frontend:** vanilla JS (ES modules), HTML/CSS без сборки
- **База данных:** PostgreSQL

## Дорожная карта (кратко)

- Довести до конца UX базового режима формы: уточнить состав обязательных разделов и критерии показа полей.
- Улучшить UX редактирования/загрузки архивных записей в форму.
- Добавить более детальные операционные алерты/метрики для воркеров.
