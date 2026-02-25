alter table if exists archives
  add column if not exists raw_data jsonb not null default '{}'::jsonb,
  add column if not exists kv_num text null,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists archive_renders (
  id bigserial primary key,
  archive_id bigint not null references archives(id) on delete cascade,
  version int not null,
  created_at timestamptz not null default now(),

  docx_status text not null default 'pending',
  docx_key text null,
  docx_error text null,

  pdf_status text not null default 'pending',
  pdf_key text null,
  pdf_error text null,

  constraint archive_renders_archive_version_uniq unique (archive_id, version),
  constraint archive_renders_docx_status_chk check (docx_status in ('pending', 'ready', 'failed')),
  constraint archive_renders_pdf_status_chk check (pdf_status in ('pending', 'ready', 'failed'))
);

create index if not exists archive_renders_pdf_status_idx on archive_renders (pdf_status);
create index if not exists archive_renders_docx_status_idx on archive_renders (docx_status);