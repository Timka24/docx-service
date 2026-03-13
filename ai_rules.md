PROJECT: CPR PROTOCOL DOCX SERVICE
AI DEVELOPMENT RULES

This document defines rules for AI assistants (Codex, Cursor, Copilot, GPT agents)
when modifying this repository.


GENERAL PRINCIPLES
==================================================

1) Do not redesign the architecture.

The system architecture is intentionally simple:

Form UI → API → PostgreSQL → DB Queue → Workers → Storage

Do NOT introduce:
- message brokers
- new queues
- background frameworks
- additional microservices

Workers use DB polling.


2) Keep the rendering pipeline intact.

The rendering pipeline must remain:

form payload
→ normalize
→ validation
→ archive insert
→ render queue
→ docx worker
→ pdf worker


3) Do not change database schema without migration.

All database changes must be implemented via migrations
inside the /migrations directory.


4) Do not break kv_num logic.

kv_num is a key identifier for cases.

Format example:

100-26-12345

Rules:
- must stay unique
- must remain searchable
- must not be reformatted automatically


5) All new form fields must follow the full pipeline.

When adding a field:

Step 1 — add UI field
Step 2 — update form payload
Step 3 — update normalize.js
Step 4 — update template-data.js
Step 5 — update DOCX template if required


FORM UI RULES
==================================================

Files:

public/form.html
public/js/form-*.js
public/js/grid-*.js


Rules:

1) Do not remove existing field names.

They are referenced in backend normalization.

2) Avoid heavy frameworks.

The UI intentionally uses vanilla JS.

3) Do not break grid logic.

Chronometry grids use custom logic in grid-* modules.


ARCHIVE UI RULES
==================================================

Files:

public/archive.html
public/archive-card.html
public/js/archive*.js

Rules:

1) Do not change archive API format.

2) Archive must remain read-only.

Archive UI must not modify saved cases.


API RULES
==================================================

Files:

routes/*.js
app.js

Rules:

1) Keep API stateless.

2) Validate all incoming payloads.

3) Do not embed business logic inside routes.


BUSINESS LOGIC RULES
==================================================

Files:

lib/

Key modules:

validation.js
normalize.js
archive-service.js
template-data.js


Rules:

1) validation.js must only validate data.

2) normalize.js must transform UI payload
   into a consistent backend format.

3) archive-service.js handles database operations.


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
template.docx

DOCX generation uses:

docxtemplater

Rules:

1) Template variables must match template-data.js.

2) Do not hardcode values in the template.


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

1) archive_renders controls document versions.

2) Version uniqueness:

(archive_id, version)

3) Do not store generated files in database.


PERFORMANCE RULES
==================================================

1) Avoid heavy synchronous operations in API.

2) Rendering must always happen in workers.

3) Archive queries must remain simple.


AI SAFE MODIFICATION STRATEGY
==================================================

When modifying the project:

Step 1:
Locate the responsible agent in agents.md.

Step 2:
Modify only the relevant files.

Step 3:
Verify that the render pipeline remains intact.

Step 4:
Do not introduce new architectural components.


END OF RULES