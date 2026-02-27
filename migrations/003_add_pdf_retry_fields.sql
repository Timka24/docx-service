alter table if exists archive_renders
  add column if not exists pdf_attempts integer not null default 0,
  add column if not exists pdf_next_attempt_at timestamptz null;

create index if not exists archive_renders_pdf_next_attempt_at_idx
  on archive_renders (pdf_next_attempt_at)
  where pdf_status = 'pending';