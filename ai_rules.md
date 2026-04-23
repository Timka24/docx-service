PROJECT: CPR PROTOCOL DOCX SERVICE
AI DEVELOPMENT RULES

This document defines rules for AI assistants (Codex, Cursor, Copilot, GPT agents)
when modifying this repository.


GENERAL PRINCIPLES
==================================================

1) Do not redesign the architecture.

The system architecture is intentionally simple:

Form UI -> API -> PostgreSQL -> DB Queue -> Workers -> Storage

Do NOT introduce:
- message brokers
- new queues
- background frameworks
- additional microservices

Workers use DB polling.


2) Keep the rendering pipeline intact.

Current high-level flow:

form payload
-> validation
-> saveArchive
-> buildTemplateData
-> normalize helpers
-> archive insert/update
-> render queue
-> docx worker
-> pdf worker

Notes:
- `/generate` currently validates the raw payload first.
- `buildTemplateData()` uses helpers from `lib/normalize.js`.
- Do not rewrite this flow casually in routes or UI code.


3) Do not change database schema without migration.

All database changes must be implemented via migrations
inside the `/migrations` directory.


4) Do not break kv_num logic.

`kv_num` is a key identifier for cases.

Format example:

100-26-12345

Rules:
- must stay unique
- must remain searchable
- must not be reformatted automatically


5) All new form fields must follow the full pipeline.

When adding a field:

Step 1 - add UI field
Step 2 - update form payload
Step 3 - update validation if needed
Step 4 - update template-data.js
Step 5 - update normalize helpers if needed
Step 6 - update DOCX template if required
Step 7 - update tests


FRONTEND BUILD RULES
==================================================

Frontend source modules live in:

public/js/

Babel output lives in:

public/js-legacy/

Current entrypoints:
- `public/form.html` loads `/js-legacy/form-init.js`
- `public/archive.html` loads `/js/archive-list.js`
- `public/archive-card.html` loads `/js/archive-card.js`

Build commands:
- `npm run build:js-legacy`
- `npm run build`

Important command:
- `build:js-legacy` runs:
  `babel public/js --out-dir public/js-legacy --extensions .js --source-maps`

Rules:
1) Prefer editing source files in `public/js/`.

2) After changing a source file, verify which HTML page actually loads it.

3) If a page loads a `public/js-legacy/*` file, keep the corresponding Babel output synchronized.

4) Do not assume every page uses `public/js-legacy/`.

5) Do not treat `public/js-legacy/` as the primary source of truth.


FORM UI RULES
==================================================

Primary files:

public/form.html
public/css/form.css
public/js/form-*.js
public/js/grid-*.js

Compiled files used by the form:

public/js-legacy/form-*.js
public/js-legacy/grid-*.js

Rules:

1) Do not remove existing field names.

They are referenced in backend validation, template-data mapping, and archive raw_data restore.

2) Avoid heavy frameworks.

The UI intentionally uses vanilla JS.

3) Do not break grid logic.

Chronometry grids use custom logic in `grid-*` modules.

4) Visibility logic must work in all states:
- first empty load
- manual toggle
- clear/reset actions
- draft restore
- archive restore


ARCHIVE UI RULES
==================================================

Files:

public/archive.html
public/archive-card.html
public/js/archive-list.js
public/js/archive-card.js
public/js-legacy/archive-list.js
public/js-legacy/archive-card.js

Rules:

1) Do not change archive API format.

2) Archive must remain read-only.

Archive UI must not modify saved cases.

3) Verify which bundle is actually loaded before editing source or compiled files.


API RULES
==================================================

Files:

routes/*.js
index.js

Rules:

1) Keep API stateless.

2) Validate all incoming payloads.

3) Do not embed business logic inside routes.

4) Routes should orchestrate validation, persistence, and queue creation; deep transformation logic belongs in `lib/`.


BUSINESS LOGIC RULES
==================================================

Files:

lib/

Key modules:

validation.js
normalize.js
archive-service.js
template-data.js
docx-render.js

Rules:

1) `validation.js` must only validate data.

2) `normalize.js` provides reusable normalization helpers.

3) `template-data.js` is responsible for mapping stored/raw payload data into DOCX-ready fields.

4) `archive-service.js` handles archive persistence and render-version creation.

5) If you change template field semantics, update tests and verify compatibility with `template.docx`.


RENDER WORKER RULES
==================================================

Files:

worker/docx-worker.js
worker/pdf-worker.js

Rules:

1) Workers must remain stateless.

2) Workers poll the database queue.

3) Workers must update render statuses in DB.


DOCX GENERATION RULES
==================================================

Files:

lib/docx-render.js
lib/template-data.js
template.docx

DOCX generation uses:

docxtemplater

Rules:

1) Template variables must match `template-data.js`.

2) Do not hardcode values in the template.

3) If placeholders or checkbox semantics change, update both code and tests.


PDF GENERATION RULES
==================================================

PDF generation uses:

Gotenberg

Rules:

1) PDF is generated from DOCX.

2) PDF worker must not generate PDF before DOCX exists.

3) Retry logic must respect:

pdf_attempts
pdf_next_attempt_at


STORAGE RULES
==================================================

Documents are stored using:

DOCX_DIR
PDF_DIR

Rules:

1) Do not hardcode paths.

2) Use environment variables.


DATABASE RULES
==================================================

Tables:

archives
archive_renders


Rules:

1) `archive_renders` controls document versions.

2) Version uniqueness:

`(archive_id, version)`

3) Do not store generated files in database.


TESTING AND VERIFICATION RULES
==================================================

Default commands:
- `npm test`
- `npm run build:js-legacy`
- `node --check public/js/form-init.js`
- `node --check public/js-legacy/form-init.js`

Rules:

1) After frontend JS changes, run at least focused syntax checks when feasible.

2) After backend, validation, archive-service, or template-data changes, run `npm test` when feasible.

3) If tests fail due to pre-existing unrelated issues, report the exact failures.

4) Do not rewrite tests merely to hide regressions.


PERFORMANCE RULES
==================================================

1) Avoid heavy synchronous operations in API.

2) Rendering must always happen in workers.

3) Archive queries must remain simple.


AI SAFE MODIFICATION STRATEGY
==================================================

When modifying the project:

Step 1:
Locate the responsible agent in `AGENTS.md`.

Step 2:
Modify only the relevant files.

Step 3:
Verify that the render pipeline remains intact.

Step 4:
Verify whether the affected UI page loads source JS or Babel output.

Step 5:
Do not introduce new architectural components.


END OF RULES
