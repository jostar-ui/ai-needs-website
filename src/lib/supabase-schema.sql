-- 모두의 인수인계 — Supabase 스키마
-- Supabase SQL Editor에서 실행하거나 apply_migration으로 적용

create table handovers (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  task_name text not null,
  description text not null default '',
  priority text not null default '보통' check (priority in ('높음', '보통', '낮음')),
  schedules jsonb not null default '[]',
  checklist jsonb not null default '[]',
  systems jsonb not null default '[]',
  laws text not null default '',
  cautions text not null default '',
  knowhow text not null default '',
  attachments jsonb not null default '[]',
  status text not null default 'active' check (status in ('active', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table handover_reports (
  id uuid primary key default gen_random_uuid(),
  handover_id uuid not null references handovers(id) on delete cascade,
  reporter_name text not null default '익명',
  reason text not null check (reason in ('오류정보', '중복업무', '오래된정보', '부적절한내용', '기타')),
  detail text not null default '',
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table handover_histories (
  id uuid primary key default gen_random_uuid(),
  handover_id uuid not null references handovers(id) on delete cascade,
  editor_name text not null default '익명',
  change_type text not null check (change_type in ('create', 'update', 'delete', 'restore')),
  before_data jsonb,
  after_data jsonb,
  changed_fields jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handovers_updated_at
before update on handovers
for each row execute function update_updated_at();

create index idx_handovers_status on handovers(status);
create index idx_handovers_department on handovers(department);
create index idx_handover_reports_handover_id on handover_reports(handover_id);
create index idx_handover_histories_handover_id on handover_histories(handover_id);

-- RLS (인증 도입 시 아래 활성화 후 정책 추가)
-- ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE handover_reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE handover_histories ENABLE ROW LEVEL SECURITY;
