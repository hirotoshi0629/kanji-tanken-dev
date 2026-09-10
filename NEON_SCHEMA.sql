-- かん字たんけん！ v3.8 学校分離 + 教師おためしモード
-- 既存データは school_code='main' として引き継ぎます。

create table if not exists schools (
  school_code text primary key,
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
insert into schools(school_code,display_name) values('main','現在の学校') on conflict(school_code) do nothing;

create table if not exists teachers (
  teacher_id text primary key,
  password_salt text not null,
  password_hash text not null,
  role text not null default 'teacher' check (role in ('admin','teacher')),
  grade smallint check (grade between 1 and 6),
  class_no smallint check (class_no between 1 and 99),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login timestamptz
);
alter table teachers add column if not exists school_code text not null default 'main';
alter table teachers drop constraint if exists teachers_pkey;
alter table teachers add primary key(school_code,teacher_id);
create index if not exists teachers_school_idx on teachers(school_code,active);

create table if not exists students (
  student_code text not null,
  school_year integer not null,
  grade smallint not null check (grade between 1 and 6),
  class_no smallint not null check (class_no between 1 and 99),
  seat_no smallint not null check (seat_no between 1 and 999),
  last_seen timestamptz not null default now(),
  primary key(student_code,school_year)
);
alter table students add column if not exists school_code text not null default 'main';

create table if not exists learning_events (
  id bigint generated always as identity primary key,
  student_code text not null,
  school_year integer not null,
  event_type text not null check (event_type in ('question','session')),
  question_id text,
  prompt text,
  answer text,
  correct boolean,
  retries smallint default 0,
  help boolean default false,
  manual_confirm boolean default false,
  volume text,
  total smallint,
  correct_no_help smallint,
  help_count smallint,
  retry_count smallint,
  created_at timestamptz not null default now()
);
alter table learning_events add column if not exists school_code text not null default 'main';

-- 旧外部キー/主キーを学校コード込みへ移行
alter table learning_events drop constraint if exists learning_events_student_code_school_year_fkey;
alter table students drop constraint if exists students_pkey;
alter table students add primary key(school_code,student_code,school_year);
alter table learning_events add constraint learning_events_school_student_year_fkey
  foreign key(school_code,student_code,school_year)
  references students(school_code,student_code,school_year) on delete cascade;

create index if not exists learning_events_school_year_student_created_idx
  on learning_events(school_code,school_year,student_code,created_at desc);
create index if not exists learning_events_school_year_created_idx
  on learning_events(school_code,school_year,created_at desc);

create or replace view yearly_student_summary as
select
  s.school_code,s.school_year,s.student_code,s.grade,s.class_no,s.seat_no,s.last_seen,
  count(e.id) filter (where e.event_type='question') as questions,
  count(e.id) filter (where e.event_type='question' and (coalesce(e.retries,0)>0 or coalesce(e.help,false) or coalesce(e.manual_confirm,false))) as mistakes_or_retries,
  count(e.id) filter (where e.event_type='question' and coalesce(e.manual_confirm,false)) as manual_confirms
from students s
left join learning_events e
  on e.school_code=s.school_code and e.student_code=s.student_code and e.school_year=s.school_year
group by s.school_code,s.school_year,s.student_code,s.grade,s.class_no,s.seat_no,s.last_seen;
