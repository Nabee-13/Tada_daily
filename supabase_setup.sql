-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 Run 을 누르세요 (한 번만).
-- 사용자마다 자기 데이터만 읽고 쓸 수 있게 막는 설정(RLS)까지 들어 있어요.
create table if not exists planner_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  part text not null,                         -- 'main' = 일정·가계부 등 / 'img' = 이미지
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, part)
);
alter table planner_data enable row level security;
create policy "own rows" on planner_data for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
