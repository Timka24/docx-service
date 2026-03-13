PROJECT: CPR PROTOCOL DOCX SERVICE
PURPOSE: Web system for filling CPR protocol, storing cases and generating DOCX/PDF documents.

SYSTEM ARCHITECTURE OVERVIEW
--------------------------------------------------

The system consists of the following major components:

1) WEB FORM UI
2) ARCHIVE UI
3) API SERVER (Express)
4) DATABASE (PostgreSQL)
5) RENDER QUEUE (DB based)
6) DOCX RENDER WORKER
7) PDF RENDER WORKER
8) FILE STORAGE
9) DOCUMENT TEMPLATE SYSTEM


MAIN DATA FLOW
--------------------------------------------------

User → Form UI → API → Database
                         ↓
                    Render Queue
                         ↓
                  DOCX Worker
                         ↓
                   PDF Worker
                         ↓
                    File Storage
                         ↓
                      Archive UI


SYSTEM AGENTS
==================================================


FORM_AGENT
--------------------------------------------------
Responsibility:
Handles the CPR form UI and user input.

Files:
public/form.html
public/js/form-init.js
public/js/form-config.js
public/js/form-payload.js
public/js/grid-*.js

Responsibilities:
- initialize form
- handle user input
- manage chronometry grid
- assemble payload
- send data to backend
- restore draft from localStorage

Rules:
- do not change payload structure without updating normalize.js
- kv_num format must remain compatible with backend


ARCHIVE_AGENT
--------------------------------------------------
Responsibility:
Displays saved records and allows search.

Files:
public/archive.html
public/js/archive.js

Responsibilities:
- fetch archive list
- search by kv_num
- filter by date
- open archive card
- download documents

Rules:
- archive API contract must not be broken


ARCHIVE_CARD_AGENT
--------------------------------------------------
Responsibility:
Display a single saved CPR protocol.

Files:
public/archive-card.html
public/js/archive-card.js

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
routes/form.js
routes/archive.js
routes/generate.js
app.js

Responsibilities:
- accept form payload
- validate data
- normalize input
- store record
- trigger document rendering
- return archive data


VALIDATION_AGENT
--------------------------------------------------
Responsibility:
Validate incoming CPR form data.

Files:
lib/validation.js

Responsibilities:
- enforce required fields
- validate kv_num
- validate timestamps
- reject malformed requests


NORMALIZATION_AGENT
--------------------------------------------------
Responsibility:
Transform raw UI payload to structured data.

Files:
lib/normalize.js

Responsibilities:
- clean payload
- normalize timestamps
- normalize checkbox fields
- prepare data for template rendering


ARCHIVE_SERVICE_AGENT
--------------------------------------------------
Responsibility:
Database operations.

Files:
lib/archive-service.js

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
DB polling by workers.

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
- poll DB queue
- render DOCX using docxtemplater
- save DOCX to storage
- update render status


PDF_RENDER_AGENT
--------------------------------------------------
Responsibility:
Generate PDF documents.

Files:
worker/pdf-worker.js

Responsibilities:
- detect ready DOCX
- send DOCX to Gotenberg
- receive PDF
- store PDF
- update render status

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

Responsibilities:
- provide placeholders
- ensure compatibility with template-data.js

Rules:
- template variables must match template-data.js


RENDER PIPELINE
==================================================

FORM SUBMIT
     ↓
API VALIDATION
     ↓
NORMALIZATION
     ↓
ARCHIVE INSERT
     ↓
QUEUE RECORD CREATED
     ↓
DOCX WORKER
     ↓
DOCX STORED
     ↓
PDF WORKER
     ↓
PDF STORED
     ↓
ARCHIVE READY


ERROR HANDLING
==================================================

DOCX ERROR
status → failed

PDF ERROR
increment pdf_attempts

Retry after pdf_next_attempt_at


PROJECT RULES
==================================================

1) UI must not break payload schema.

2) Backend normalization must match template variables.

3) Render workers must remain stateless.

4) Storage paths must be configurable via environment.

5) Database migrations must remain backward compatible.

6) Template variables must be synchronized with template-data.js.
