create table if not exists archives (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),

  -- на будущее (шара)
  stored      boolean not null default false,
  docx_key    text null,

  -- готовый объект для doc.setData(...)
  data        jsonb not null
);

create index if not exists archives_created_at_idx
  on archives (created_at desc);
