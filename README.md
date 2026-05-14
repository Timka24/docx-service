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
  - строгая backend-валидация календарных дат и структуры payload;
  - версионирование рендеров (`archive_renders`);
  - асинхронная генерация DOCX отдельным воркером;
  - асинхронная генерация PDF отдельным воркером через Gotenberg с retry/backoff.
  - Docker Compose-стек с nginx reverse proxy для HTTP/HTTPS.
  - UX-слой формы: режимы `basic/full`, секционная навигация, прогресс заполнения, восстановление черновика и подсветка серверных ошибок валидации.
- **В развитии:** расширение бизнес-валидации обязательных полей и UX сценариев повторной загрузки данных.

## Функциональность

- **Веб-форма СЛР**
  - ввод данных бригады, пациента, времени, этапов СЛР, ритмов, дефибрилляции, медикаментов;
  - поддержка хронометража по минутам (1–70) для ряда блоков;
  - режимы формы: `basic` скрывает неключевые разделы целиком, `full` показывает полную форму;
  - секционная структура формы с аккордеоном и быстрой навигацией по видимым разделам;
  - автосохранение черновика в `localStorage` с восстановлением данных и выбранного режима после перезагрузки;
  - индикатор прогресса заполнения и блок проверки ключевых полей перед формированием;
  - отображение `validation_error.details` от backend: подсветка проблемного поля, текст ошибки рядом с полем и заметные состояния блока формирования;
  - сборка payload клиентскими модулями в `public/js`.
  - legacy-совместимая сборка фронтенда через Babel в `public/js-legacy` для старых версий Google Chrome, включая Chrome 64/75.

- **Сохранение и архив**
  - сохранение сырого payload и нормализованных данных в PostgreSQL;
  - получение списка архива с фильтрами/пагинацией;
  - карточка записи с историей версий рендера;
  - поиск по номеру карты `kv_num`.

- **Уникальность `kv_num`**
  - на уровне БД используется частичный уникальный индекс `archives_kv_num_uniq` для непустых номеров;
  - на уровне API конфликт уникальности возвращается как `409 kv_num_exists`;
  - форма показывает конфликт понятным сообщением, подсвечивает поле `kvNumber` и предлагает загрузить существующую карту по `kv_num`;
  - форма блокирует кнопку формирования на время запроса, чтобы не отправлять один и тот же payload повторным кликом.

- **Асинхронный конвейер документов**
  - `POST /generate` требует валидную дату приёма вызова, затем создаёт/обновляет архив и ставит задачу в очередь рендера;
  - DOCX-воркер формирует `docx_key` и сохраняет документ в файловое хранилище;
  - PDF-воркер берёт готовый DOCX, строго разбирает дату для пути PDF, отправляет DOCX в Gotenberg, сохраняет PDF и пишет `pdf_key`;
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
│   ├── date-utils.js         # Строгий парсинг/нормализация дат DD.MM.YYYY и YYYY-MM-DD
│   ├── validation.js         # Backend-валидация payload
│   ├── normalize.js          # Нормализация полей формы
│   ├── template-data.js      # Сборка данных для шаблона
│   ├── docx-render.js        # Генерация DOCX (docxtemplater + pizzip)
│   └── archive-service.js    # Save/update архива + create render version
├── worker/
│   ├── docx-worker.js        # Обработка docx_status=pending
│   └── pdf-worker.js         # Обработка pdf_status=pending + retry/backoff
├── nginx/
│   └── default.conf          # Reverse proxy: HTTP redirect + HTTPS proxy to app:3000
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
│   └── js-legacy/
│       ├── form-init.js
│       ├── form-payload.js
│       ├── form-config.js
│       ├── archive-list.js
│       ├── archive-card.js
│       ├── grid-chrono.js
│       ├── grid-energy.js
│       └── grid-numeric.js
├── test/
│   ├── archive-service.test.js
│   ├── generate.test.js
│   ├── pdf-worker.test.js
│   ├── template-data.test.js
│   └── validation.test.js
├── Dockerfile
├── docker-compose.yaml
└── package.json
```

## Архитектура и поток данных

1. Клиент отправляет форму на `POST /generate`.
2. API валидирует payload (`lib/validation.js`) и для `/generate` требует валидную дату приёма вызова в `pr_date_iso_raw` или `pr_date`.
3. API сохраняет архив (`lib/archive-service.js`).
4. Для архива создаётся новая версия рендера в `archive_renders` со статусами `pending`.
5. `worker/docx-worker.js` забирает pending-задачу, генерирует DOCX, сохраняет файл и отмечает `docx_status = ready`.
6. `worker/pdf-worker.js` обрабатывает задачи с готовым DOCX, выбирает дату для PDF path в порядке `data.pr_date_iso → data.pr_date → raw_data.pr_date_iso_raw → raw_data.nowDate → raw_data.pr_date`, конвертирует через Gotenberg и отмечает `pdf_status = ready`.
7. UI архива позволяет отслеживать статусы и скачивать итоговые файлы.

В Docker Compose входящий HTTP/HTTPS-трафик принимает nginx и проксирует запросы к Express-приложению внутри сети Docker на `app:3000`.

## API и маршруты

### UI маршруты

- `GET /form` — страница формы.
- `GET /archive` — список архива.
- `GET /archive/:archiveId` — карточка архивной записи.

### Основные API

- `POST /generate` — валидация, обязательная валидная дата приёма вызова, сохранение и постановка версии рендера.
- `GET /api/archive` — список архива (фильтры/пагинация).
- `GET /api/archive/by-kv?kv_num=...` — поиск записи по `kv_num`.
- `GET /api/archive/:id` — карточка архива + версии рендеров.
- `POST /api/archive/save` — сохранение архива без постановки рендера; дата приёма не обязательна, но непустые date-поля проходят строгую проверку.
- `POST /api/archive/:id/render` — ручная постановка новой версии рендера.
- `GET /api/archive/:id/download/docx?version=...` — скачать DOCX.
- `GET /api/archive/:id/download/pdf` — скачать PDF.

### Legacy-алиасы (обратная совместимость)

- `GET /archive/by-kv`
- `POST /archive/save`
- `POST /archive/:id/render`

### Ответы `POST /generate`

Успешные ответы сохраняют текущий контракт:
- `message: "queued"` — архив сохранён, версия рендера поставлена в очередь;
- `message: "saved_no_kv_num"` — архив сохранён без постановки рендера, потому что не заполнен `kv_num`.

Ошибки возвращаются в едином JSON-формате:

```json
{
  "error": "validation_error",
  "message": "Проверьте заполнение формы. Некоторые поля содержат некорректные значения.",
  "details": [
    { "path": "pr_h", "message": "must be 0..23" }
  ]
}
```

Для `/generate` отсутствие валидной даты приёма вызова возвращается как `validation_error` с detail по `pr_date`.

Поле `details` добавляется, когда сервер может указать конкретные поля. UI формы показывает `message`, для `validation_error` дополнительно выводит список деталей в блоке статуса формирования и подсвечивает связанные поля формы. Основной mapping находится в `public/js/form-init.js`: `kv_num → kvNumber`, `pr_date`/`pr_date_iso_raw → nowDate`, `end_date`/`end_date_iso_raw → end_date`.

## Логика сохранения архива (`saveArchive`)

- **Create-режим** (без `archive_id`) — создаётся новая запись.
- **Edit-режим** (с `archive_id`):
  - если `kv_num` не изменился, обновляется текущая запись;
  - если `kv_num` изменился, создаётся новая запись (историчность сохраняется).
- При конфликте уникальности по `kv_num` API возвращает `409` с ошибкой `kv_num_exists`.
- Перед добавлением/переустановкой уникального индекса в существующей базе нужно проверить и разобрать уже накопленные дубли `kv_num`; иначе миграция `004_kv_num_unique.sql` не применится.

## Валидация payload (backend)

На текущий момент валидация проверяет:
- тип верхнего объекта (должен быть JSON object);
- длины текстовых полей;
- формат и диапазоны час/мин полей;
- строгую календарную валидность дат `pr_date`, `pr_date_iso_raw`, `end_date`, `end_date_iso_raw` в форматах `DD.MM.YYYY` и `YYYY-MM-DD`;
- размер и типы minute-grid полей (ровно 70 элементов);
- форматы значений для числовых/энергетических сеток;
- лимиты grid-значений: обычные grid-поля до 8 символов на элемент, numeric grid-поля до 10 символов на элемент, пустые элементы допустимы;
- unknown-поля: разрешены только строки в общем текстовом лимите; object/array/number/boolean/null отклоняются.

`POST /generate` дополнительно требует валидную дату приёма вызова в `pr_date_iso_raw` или `pr_date` до сохранения архива и создания задачи рендера. `POST /api/archive/save` остаётся совместимым с черновиками и не требует дату как обязательную.

`lib/template-data.js` нормализует валидные даты в ISO для шаблона, но невозможные даты не превращает в ISO. PDF-воркер остаётся финальной защитой и не делает fallback на текущую дату.

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

Перед применением `004_kv_num_unique.sql` на базе с рабочими данными проверьте существующие дубли:

```sql
select kv_num, count(*) as cnt, array_agg(id order by updated_at desc, id desc) as archive_ids
from archives
where kv_num is not null
group by kv_num
having count(*) > 1
order by cnt desc, kv_num;
```

3) Соберите legacy-версии фронтенд-скриптов:

```bash
npm run build:js-legacy
```

4) Запустите API:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/docxdb npm start
```

5) (Опционально) Запустите воркеры отдельными процессами:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/docxdb npm run worker:docx
DATABASE_URL=postgresql://user:pass@localhost:5432/docxdb npm run worker:pdf
```

## Сборка legacy frontend

- Исходники фронтенда: `public/js`
- Совместимые с Chrome 64+ файлы: `public/js-legacy`
- Babel-конфиг: `babel.config.json`
- HTML формы подключает именно собранные legacy-модули

```bash
npm run build:js-legacy
```

Короткий алиас:

```bash
npm run build
```

После изменения файлов в `public/js` сборку `public/js-legacy` нужно обновлять повторным запуском команды.

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

## Docker Compose (nginx + app + docx-worker + pdf-worker + gotenberg + postgres)

### Что поднимается

`docker-compose.yaml` поднимает:
- `db` — PostgreSQL 16 + volume `db_data`;
- `app` — Express API на внутреннем порту `3000`, доступном сервисам в сети Docker;
- `nginx` — reverse proxy на внешних портах `80` и `443`, проксирует HTTPS-запросы на `app:3000`;
- `worker` — DOCX-воркер из того же образа;
- `pdf-worker` — PDF-воркер из того же образа;
- `gotenberg` — конвертация DOCX → PDF.

### Подготовка директорий на хосте

```bash
sudo mkdir -p /srv/slr-docx /srv/slr-pdf nginx/certs
sudo chown -R "$USER":"$USER" /srv/slr-docx /srv/slr-pdf nginx/certs
```

Для HTTPS nginx ожидает сертификат и ключ:

```text
nginx/certs/slr.local.crt
nginx/certs/slr.local.key
```

Папка `nginx/certs/` добавлена в `.gitignore`, чтобы локальные сертификаты и приватные ключи не попадали в репозиторий.

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
docker compose up -d --build nginx
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
docker compose logs -f nginx
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
- **Frontend:** vanilla JS (ES modules), HTML/CSS, Babel-сборка legacy-модулей для Chrome 64+
- **База данных:** PostgreSQL

## Дорожная карта (кратко)

- Довести до конца UX базового режима формы: уточнить состав обязательных разделов и критерии показа полей.
- Улучшить UX редактирования/загрузки архивных записей в форму.
- Добавить более детальные операционные алерты/метрики для воркеров.
