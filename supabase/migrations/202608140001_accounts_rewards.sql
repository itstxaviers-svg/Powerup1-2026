create extension if not exists pgcrypto;

create table if not exists public.teachers (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  display_name text not null,
  join_code text not null,
  join_code_normalized text generated always as (upper(trim(join_code))) stored,
  created_at timestamptz not null default now(),
  unique (teacher_id, join_code_normalized)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  wordcode_id text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 40),
  group_id uuid not null references public.groups(id),
  avatar text not null default 'spark',
  created_at timestamptz not null default now(),
  last_activity timestamptz
);

-- PIN verification must happen in a trusted Edge Function. Never select this table in a student client.
create table if not exists public.student_accounts (
  student_id uuid primary key references public.students(id) on delete cascade,
  pin_hash text not null,
  must_change_pin boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.student_settings (
  student_id uuid primary key references public.students(id) on delete cascade,
  sound_enabled boolean not null default true,
  music_enabled boolean not null default true,
  reduced_motion boolean not null default false,
  large_text boolean not null default false,
  vibration_enabled boolean not null default true,
  british_voice text,
  updated_at timestamptz not null default now()
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  unit_id text not null,
  challenge_count integer not null check (challenge_count >= 0),
  correct_count integer not null check (correct_count >= 0),
  energy_earned integer not null default 0 check (energy_earned >= 0),
  started_at timestamptz,
  completed_at timestamptz not null default now(),
  client_session_id text,
  unique (student_id, client_session_id)
);

create table if not exists public.target_progress (
  student_id uuid not null references public.students(id) on delete cascade,
  target_id text not null,
  unit_id text not null,
  part_id text,
  attempts integer not null default 0,
  correct integer not null default 0,
  last_result boolean,
  mastery numeric(5,4) not null default 0 check (mastery between 0 and 1),
  state text not null default 'unseen' check (state in ('unseen','learning','practising','unstable','stable','mastered')),
  last_practised_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, target_id)
);

create table if not exists public.unit_progress (
  student_id uuid not null references public.students(id) on delete cascade,
  unit_id text not null,
  completed_parts text[] not null default '{}',
  crystal_percent integer not null default 0 check (crystal_percent between 0 and 100),
  restored boolean not null default false,
  mastered boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, unit_id)
);

create table if not exists public.spirit_state (
  student_id uuid primary key references public.students(id) on delete cascade,
  lifetime_energy integer not null default 0 check (lifetime_energy >= 0),
  bonus_energy integer not null default 0 check (bonus_energy >= 0),
  level integer not null default 1 check (level >= 1),
  stage text not null default 'spark' check (stage in ('spark','sprite','spirit','guardian','master')),
  stability integer not null default 100 check (stability between 20 and 100),
  last_activity timestamptz,
  active_days date[] not null default '{}',
  mode_counts jsonb not null default '{}',
  unlocked_accessories text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.rewards (
  id text primary key,
  reward_type text not null check (reward_type in ('artifact','accessory','world','crystal')),
  title text not null,
  permanent boolean not null default true,
  metadata jsonb not null default '{}'
);

create table if not exists public.student_rewards (
  student_id uuid not null references public.students(id) on delete cascade,
  reward_id text not null references public.rewards(id),
  state text not null default 'unlocked' check (state in ('unlocked','equipped','mastered')),
  unlocked_at timestamptz not null default now(),
  primary key (student_id, reward_id)
);

create index if not exists groups_teacher_idx on public.groups(teacher_id);
create index if not exists students_group_idx on public.students(group_id);
create index if not exists students_last_activity_idx on public.students(last_activity);
create index if not exists target_progress_unit_idx on public.target_progress(student_id, unit_id);
create index if not exists sessions_student_date_idx on public.training_sessions(student_id, completed_at desc);
create index if not exists activity_student_date_idx on public.activity_log(student_id, created_at desc);

create or replace function public.current_student_id() returns uuid language sql stable as $$
  select nullif(auth.jwt() ->> 'student_id', '')::uuid
$$;

create or replace function public.teacher_owns_group(target_group uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.groups where id = target_group and teacher_id = auth.uid())
$$;

create or replace function public.protect_student_locked_fields() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.current_student_id() = old.id then
    new.id := old.id;
    new.wordcode_id := old.wordcode_id;
    new.group_id := old.group_id;
    new.created_at := old.created_at;
  end if;
  return new;
end
$$;

drop trigger if exists protect_student_locked_fields on public.students;
create trigger protect_student_locked_fields before update on public.students for each row execute function public.protect_student_locked_fields();

alter table public.teachers enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.student_accounts enable row level security;
alter table public.student_settings enable row level security;
alter table public.training_sessions enable row level security;
alter table public.target_progress enable row level security;
alter table public.unit_progress enable row level security;
alter table public.spirit_state enable row level security;
alter table public.activity_log enable row level security;
alter table public.rewards enable row level security;
alter table public.student_rewards enable row level security;

create policy "teacher reads own profile" on public.teachers for select using (id = auth.uid());
create policy "teacher updates own profile" on public.teachers for update using (id = auth.uid()) with check (id = auth.uid());
create policy "teacher manages own groups" on public.groups for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "student reads own group" on public.groups for select using (id = (select group_id from public.students where id = public.current_student_id()));
create policy "student reads self" on public.students for select using (id = public.current_student_id());
create policy "student updates safe profile fields" on public.students for update using (id = public.current_student_id()) with check (id = public.current_student_id());
create policy "teacher reads group students" on public.students for select using (public.teacher_owns_group(group_id));
create policy "teacher updates group students" on public.students for update using (public.teacher_owns_group(group_id)) with check (public.teacher_owns_group(group_id));

-- student_accounts intentionally has no client policies. Only trusted Edge Functions/service role can read or write hashes.
create policy "student manages own settings" on public.student_settings for all using (student_id = public.current_student_id()) with check (student_id = public.current_student_id());
create policy "teacher reads student settings" on public.student_settings for select using (exists(select 1 from public.students s where s.id = student_id and public.teacher_owns_group(s.group_id)));
create policy "student manages own sessions" on public.training_sessions for all using (student_id = public.current_student_id()) with check (student_id = public.current_student_id());
create policy "teacher reads group sessions" on public.training_sessions for select using (exists(select 1 from public.students s where s.id = student_id and public.teacher_owns_group(s.group_id)));
create policy "student manages own target progress" on public.target_progress for all using (student_id = public.current_student_id()) with check (student_id = public.current_student_id());
create policy "teacher reads group target progress" on public.target_progress for select using (exists(select 1 from public.students s where s.id = student_id and public.teacher_owns_group(s.group_id)));
create policy "student manages own unit progress" on public.unit_progress for all using (student_id = public.current_student_id()) with check (student_id = public.current_student_id());
create policy "teacher reads group unit progress" on public.unit_progress for select using (exists(select 1 from public.students s where s.id = student_id and public.teacher_owns_group(s.group_id)));
create policy "student manages own spirit state" on public.spirit_state for all using (student_id = public.current_student_id()) with check (student_id = public.current_student_id());
create policy "teacher reads group spirit state" on public.spirit_state for select using (exists(select 1 from public.students s where s.id = student_id and public.teacher_owns_group(s.group_id)));
create policy "student writes and reads own activity" on public.activity_log for all using (student_id = public.current_student_id()) with check (student_id = public.current_student_id());
create policy "teacher reads group activity" on public.activity_log for select using (exists(select 1 from public.students s where s.id = student_id and public.teacher_owns_group(s.group_id)));
create policy "authenticated reads reward catalogue" on public.rewards for select to authenticated using (true);
create policy "student reads own rewards" on public.student_rewards for select using (student_id = public.current_student_id());
create policy "teacher reads group rewards" on public.student_rewards for select using (exists(select 1 from public.students s where s.id = student_id and public.teacher_owns_group(s.group_id)));

insert into public.rewards (id, reward_type, title, metadata) values
  ('memory-crystal','artifact','Memory Crystal','{"mode":"memory"}'),
  ('audio-orb','artifact','Audio Orb','{"mode":"audio"}'),
  ('repair-gear','artifact','Repair Gear','{"mode":"repair"}'),
  ('decoder-lens','artifact','Decoder Lens','{"mode":"error-hunt"}'),
  ('sentence-core','artifact','Order Core','{"mode":"unscramble"}'),
  ('master-key','artifact','Master Key','{}'),
  ('prism-fragment','artifact','Prism Fragment','{}'),
  ('ancient-code','artifact','Ancient Code','{}')
on conflict (id) do nothing;
