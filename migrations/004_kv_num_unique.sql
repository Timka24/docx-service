create unique index if not exists archives_kv_num_uniq
  on archives(kv_num)
  where kv_num is not null;

create index if not exists archives_kv_num_idx
  on archives(kv_num);