PROJECT: CPR PROTOCOL DOCX SERVICE
PURPOSE: Web system for filling CPR protocol forms, storing cases, and generating DOCX/PDF documents.

SYSTEM ARCHITECTURE OVERVIEW
--------------------------------------------------

The system consists of the following major components:

1) WEB FORM UI
2) ARCHIVE LIST UI
3) ARCHIVE CARD UI
4) API SERVER (Express)
5) DATABASE (PostgreSQL)
6) RENDER QUEUE (database based)
7) DOCX RENDER WORKER
8) PDF RENDER WORKER
9) FILE STORAGE
10) DOCUMENT TEMPLATE SYSTEM
11) FRONTEND BUILD PIPELINE (Babel)
12) TEST SUITE (node --test)


MAIN DATA FLOW
--------------------------------------------------

User -> Form UI -> API -> Database
                         |
                         v
                    Render Queue
                         |
                         v
                  DOCX Worker
                         |
                         v
                   PDF Worker
                         |
                         v
                    File Storage
                         |
                         v
                      Archive UI


FRONTEND BUILD PIPELINE
==================================================

The source frontend modules live in:

public/js/

The browser-facing compiled modules live in:

public/js-legacy/

Important current behavior:
- public/form.html currently loads /js-legacy/form-init.js with type="module".
- public/archive.html currently loads /js/archive-list.js with type="module".
- public/archive-card.html currently loads /js/archive-card.js with type="module".
- The build is Babel based.
- package.json scripts:
  - npm run build:js-legacy
  - npm run build
- build:js-legacy runs:
  babel public/js --out-dir public/js-legacy --extensions .js --source-maps

Rules:
- Prefer editing source files in public/js/.
- After changing a source file, verify which page loads it.
- If the page loads a public/js-legacy file (currently form flow), run npm run build:js-legacy or manually keep the matching legacy file synchronized when a full Babel rebuild would create unrelated formatting churn.
- Do not treat public/js-legacy as independent source of truth.
- If form.html changes which bundle it loads, update this section.


SYSTEM AGENTS
==================================================


FORM_AGENT
--------------------------------------------------
Responsibility:
Handles the CPR form UI and user input.

Primary source files:
public/form.html
public/css/form.css
public/js/form-init.js
public/js/form-config.js
public/js/form-payload.js
public/js/grid-*.js

Compiled browser files:
public/js-legacy/form-init.js
public/js-legacy/form-config.js
public/js-legacy/form-payload.js
public/js-legacy/grid-*.js

Responsibilities:
- initialize form
- handle user input
- manage chronometry grids and accordion state
- assemble payload
- send data to backend
- display backend validation_error details near mapped fields and in the generate status panel
- restore draft from localStorage
- keep UI state compatible with saved archive data

Rules:
- do not change payload structure without updating the relevant backend mapping/validation modules (primarily lib/template-data.js, lib/validation.js) and related tests
- kv_num format must remain compatible with backend validation and archive lookup
- validation_error field mapping currently lives in public/js/form-init.js; keep mappings for kv_num, pr_date/pr_date_iso_raw, and end_date/end_date_iso_raw synchronized with real form ids/names
- if a UI field controls visibility, ensure behavior works on first load, manual change, clear/reset, and archive/draft restore
- keep source and loaded browser bundles synchronized for the affected page


ARCHIVE_AGENT
--------------------------------------------------
Responsibility:
Displays saved records and allows search.

Files:
public/archive.html
public/js/archive-list.js
public/js-legacy/archive-list.js

Responsibilities:
- fetch archive list
- search by kv_num
- filter by date
- open archive card
- download documents

Rules:
- archive API contract must not be broken
- keep source and legacy build files synchronized


ARCHIVE_CARD_AGENT
--------------------------------------------------
Responsibility:
Display a single saved CPR protocol.

Files:
public/archive-card.html
public/js/archive-card.js
public/js-legacy/archive-card.js

Responsibilities:
- show saved data
- display render history
- allow downloading DOCX/PDF
- show debug raw_data when needed


API_AGENT
--------------------------------------------------
Responsibility:
Backend HTTP API.

Files:
index.js
routes/form.js
routes/archive.js
routes/generate.js

Responsibilities:
- accept form payload
- validate data
- normalize input
- store record
- trigger document rendering
- return archive data

Rules:
- POST /generate must validate payload and require a renderable call date before saveArchive/createRenderVersion/queue creation
- valid renderable call date means pr_date_iso_raw or pr_date passes the strict date helper
- POST /api/archive/save may remain draft-friendly and should not require the call date unless product behavior changes


VALIDATION_AGENT
--------------------------------------------------
Responsibility:
Validate incoming CPR form data.

Files:
lib/date-utils.js
lib/validation.js
test/*.test.js

Responsibilities:
- enforce required fields
- validate kv_num
- validate timestamps and strict calendar dates
- reject malformed requests

Rules:
- strict date parsing supports DD.MM.YYYY and YYYY-MM-DD through lib/date-utils.js
- impossible dates such as 31.02.2024, 2024-02-31, and 29.02.2023 must be rejected; 29.02.2024 must be accepted
- validated date fields include pr_date, pr_date_iso_raw, end_date, and end_date_iso_raw
- empty date strings are allowed by validatePayload for draft compatibility; POST /generate adds its own required call-date check
- unknown fields are allowed only when they are strings within the default text limit; object, array, number, boolean, and null values must be rejected with path information
- regular grid values are limited to 8 characters per element; numeric grid values are limited to 10 characters per element and still use the numeric regex for non-empty values


NORMALIZATION_AGENT
--------------------------------------------------
Responsibility:
Provide reusable normalization helpers consumed by template-data mapping.

Files:
lib/normalize.js

Responsibilities:
- normalize per-minute rows and ml values
- provide shared formatting/normalization helpers used by lib/template-data.js
- stay compatible with template-data expectations


TEMPLATE_DATA_AGENT
--------------------------------------------------
Responsibility:
Build the data object consumed by the DOCX template.

Files:
lib/template-data.js
lib/date-utils.js
test/template-data.test.js

Responsibilities:
- map normalized archive data to template variables
- keep checkbox marks and template placeholders consistent
- preserve backwards compatibility with existing archive raw_data
- normalize valid dates for template output without turning impossible dates into ISO strings

Rules:
- template variables must match template.docx placeholders
- changes here usually require updates to test/template-data.test.js


ARCHIVE_SERVICE_AGENT
--------------------------------------------------
Responsibility:
Database operations.

Files:
lib/archive-service.js
test/archive-service.test.js

Responsibilities:
- insert archive records
- fetch archive records
- manage render versions
- manage render statuses


QUEUE_AGENT
--------------------------------------------------
Responsibility:
Manage render queue stored in database.

Table:
archive_renders

Queue behavior:
Database polling by workers.

Statuses:

DOCX:
pending
ready
failed

PDF:
pending
ready
failed

Retry logic:
pdf_attempts
pdf_next_attempt_at


DOCX_RENDER_AGENT
--------------------------------------------------
Responsibility:
Generate DOCX documents.

Files:
worker/docx-worker.js
lib/docx-render.js

Responsibilities:
- poll database queue
- render DOCX using docxtemplater
- save DOCX to storage
- update render status


PDF_RENDER_AGENT
--------------------------------------------------
Responsibility:
Generate PDF documents.

Files:
worker/pdf-worker.js
lib/date-utils.js

Responsibilities:
- detect ready DOCX
- send DOCX to Gotenberg
- receive PDF
- store PDF
- update render status

Rules:
- PDF path date parsing must use the strict date helper and must not fall back to today's date
- resolvePrDateParts date precedence is data.pr_date_iso -> data.pr_date -> raw_data.pr_date_iso_raw -> raw_data.nowDate -> raw_data.pr_date
- pdf-worker.js should not start its worker loop when required from tests; normal CLI startup must still run the worker

External dependency:
Gotenberg


STORAGE_AGENT
--------------------------------------------------
Responsibility:
Manage file storage.

Environment variables:
DOCX_DIR
PDF_DIR

Responsibilities:
- store generated DOCX
- store generated PDF
- provide file paths to archive


DATABASE_AGENT
--------------------------------------------------
Responsibility:
Persistent storage.

Database:
PostgreSQL

Tables:
archives
archive_renders

Responsibilities:
- store CPR case
- store render metadata
- manage document versions


TEMPLATE_AGENT
--------------------------------------------------
Responsibility:
Provide DOCX template.

Template file:
template.docx

Related files:
lib/template-data.js

Responsibilities:
- provide placeholders
- ensure compatibility with template-data.js

Rules:
- template variables must match template-data.js


RENDER PIPELINE
==================================================

FORM SUBMIT
     |
     v
API VALIDATION
     |
     v
POST /generate REQUIRED CALL DATE CHECK
     |
     v
NORMALIZATION
     |
     v
ARCHIVE INSERT
     |
     v
QUEUE RECORD CREATED
     |
     v
DOCX WORKER
     |
     v
DOCX STORED
     |
     v
PDF WORKER
     |
     v
PDF STORED
     |
     v
ARCHIVE READY


ERROR HANDLING
==================================================

DOCX ERROR
status -> failed

PDF ERROR
increment pdf_attempts
set pdf_next_attempt_at


TESTING AND VERIFICATION
==================================================

Commands:
- npm test
- npm run build:js-legacy
- node --check public/js/form-init.js
- node --check public/js-legacy/form-init.js

Rules:
- Run focused syntax checks after frontend JS changes.
- Run npm test for backend/template/data changes when feasible.
- If npm test fails for pre-existing unrelated expectations, report the exact failing tests and do not hide the failure.
- Do not update tests just to match a regression; update tests only when the intended behavior changed.


PROJECT RULES
==================================================

1) UI must not break payload schema.

2) Backend data mapping and normalization helpers must match template variables.

3) Render workers must remain stateless.

4) Storage paths must be configurable via environment.

5) Database migrations must remain backward compatible.

6) Template variables must be synchronized with lib/template-data.js and template.docx.

7) Source frontend changes must be synchronized with the bundle actually loaded by each page (form currently uses public/js-legacy; archive pages currently use public/js).

8) Archive API contracts must remain backward compatible.

9) Do not revert unrelated local changes.
