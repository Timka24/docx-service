# docx-service

Сервис для заполнения медицинских протоколов сердечно-лёгочной реанимации (СЛР). Пользователь заполняет веб-форму, данные сохраняются в PostgreSQL, генерируется DOCX-документ по шаблону.

## Функциональность

- **Веб-форма** — форма ввода данных протокола СЛР (бригада, пациент, время, ВДП, сосудистый доступ, ИВЛ, ритмы, дефибрилляция, медикаменты)
- **Генерация DOCX** — заполнение шаблона `template.docx` плейсхолдерами `[[...]]` с помощью Docxtemplater
- **Архив** — сохранение данных формы в БД (JSONB), получение списка и отдельной записи по ID
- **Хронометраж по минутам (1–70)** — интерактивные сетки для ручных/автоматических компрессий, ИВЛ, ритмов, энергии дефибрилляции, объёмов лекарств (адреналин, амиодарон)

## Структура проекта

```
docx-service/
├── index.js              # Точка входа Express
├── lib/
│   ├── normalize.js      # Нормализация данных (pad2, normalizeRow70, normalizeMl70, …)
│   ├── template-data.js  # Сборка объекта для шаблона из req.body
│   └── docx-render.js    # Рендеринг DOCX (Docxtemplater + PizZip)
├── routes/
│   ├── form.js           # GET /form
│   ├── generate.js       # POST /generate
│   └── archive.js        # GET /archive, GET /archive/:id
├── public/
│   ├── form.html         # Страница формы (HTML + CSS)
│   └── js/
│       ├── form-init.js      # Инициализация, обработчики, submit
│       ├── form-payload.js   # Сборка payload, formatDateForDocx, marksFromResult
│       ├── grid-chrono.js    # createChronoRow — символьные сетки (+, -, ■)
│       ├── grid-energy.js    # createEnergyRow — энергия дефибрилляции (Дж)
│       └── grid-numeric.js   # createNumericRow — объёмы в мл (дробные)
├── migrations/
│   └── 001_init.sql      # Таблица archives
├── template.docx         # Шаблон DOCX
├── Dockerfile
└── package.json
```

## API

| Метод | Маршрут        | Описание                                   |
|-------|----------------|--------------------------------------------|
| GET   | `/form`        | Страница формы                             |
| POST  | `/generate`    | Генерация DOCX, сохранение в БД, отдача файла |
| GET   | `/archive`     | Список последних 100 записей               |
| GET   | `/archive/:id` | Запись архива по ID                        |

## БД

PostgreSQL. Таблица `archives`:

- `id` — bigserial
- `created_at` — timestamptz
- `stored` — флаг (на будущее)
- `docx_key` — ключ хранения (на будущее)
- `data` — JSONB с данными формы

Миграция: `migrations/001_init.sql`

## Запуск

### Переменные окружения

- `DATABASE_URL` — строка подключения PostgreSQL (обязательно)
- `PORT` — порт (по умолчанию 3000)

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
- [x] Сохранение в PostgreSQL
- [x] Скачивание файла `filled_<id>.docx`
- [x] API архива (список и запись по ID)
- [x] Docker-образ

## Не реализовано / на будущее

- Интерфейс просмотра архива (есть только API)
- Поле `stored` и `docx_key` — под выгрузку DOCX в общее хранилище
- Вынос CSS в отдельный файл
- Валидация обязательных полей на бэкенде
