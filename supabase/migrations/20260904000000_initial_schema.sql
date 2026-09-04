-- Jobfolio: private single-user job application tracker
-- Run this file in Supabase SQL Editor, or with `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company text not null check (char_length(company) between 1 and 200),
  position text not null check (char_length(position) between 1 and 300),
  location text not null default 'Not specified',
  job_url text,
  application_date date not null default current_date,
  source text not null default 'Other',
  job_description text not null default '',
  requirements text not null default '',
  status text not null default 'Applied' check (
    status in (
      'Saved', 'Preparing', 'Applied', 'Online Assessment', 'HR Screening',
      'Interview', 'Second Interview', 'Final Interview', 'Offer', 'Rejected', 'Withdrawn'
    )
  ),
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  application_type text not null default 'Full-time' check (
    application_type in ('Graduate Program', 'Full-time', 'Internship', 'Contract', 'RA', 'Other')
  ),
  salary text not null default '',
  contact_person text not null default '',
  contact_information text not null default '',
  next_action text not null default '',
  next_action_date date,
  notes text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.application_updates (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  date date not null default current_date,
  status text not null check (
    status in (
      'Saved', 'Preparing', 'Applied', 'Online Assessment', 'HR Screening',
      'Interview', 'Second Interview', 'Final Interview', 'Offer', 'Rejected', 'Withdrawn'
    )
  ),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_application_date_idx on public.applications(application_date desc);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists application_updates_application_id_idx on public.application_updates(application_id);
create index if not exists application_updates_date_idx on public.application_updates(date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

alter table public.applications enable row level security;
alter table public.application_updates enable row level security;

drop policy if exists "Users read their own applications" on public.applications;
create policy "Users read their own applications"
on public.applications for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users create their own applications" on public.applications;
create policy "Users create their own applications"
on public.applications for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own applications" on public.applications;
create policy "Users update their own applications"
on public.applications for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own applications" on public.applications;
create policy "Users delete their own applications"
on public.applications for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users read updates for their applications" on public.application_updates;
create policy "Users read updates for their applications"
on public.application_updates for select
to authenticated
using (
  exists (
    select 1 from public.applications
    where applications.id = application_updates.application_id
      and applications.user_id = (select auth.uid())
  )
);

drop policy if exists "Users create updates for their applications" on public.application_updates;
create policy "Users create updates for their applications"
on public.application_updates for insert
to authenticated
with check (
  exists (
    select 1 from public.applications
    where applications.id = application_updates.application_id
      and applications.user_id = (select auth.uid())
  )
);

drop policy if exists "Users update progress for their applications" on public.application_updates;
create policy "Users update progress for their applications"
on public.application_updates for update
to authenticated
using (
  exists (
    select 1 from public.applications
    where applications.id = application_updates.application_id
      and applications.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.applications
    where applications.id = application_updates.application_id
      and applications.user_id = (select auth.uid())
  )
);

drop policy if exists "Users delete progress for their applications" on public.application_updates;
create policy "Users delete progress for their applications"
on public.application_updates for delete
to authenticated
using (
  exists (
    select 1 from public.applications
    where applications.id = application_updates.application_id
      and applications.user_id = (select auth.uid())
  )
);

-- Demo rows live in the database (never hard-coded in the React app) and can be removed together.
create or replace function public.seed_demo_applications()
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  demo_user uuid := auth.uid();
  applied_id uuid;
  interview_id uuid;
  assessment_id uuid;
  offer_id uuid;
begin
  if demo_user is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.applications where user_id = demo_user and is_demo) then
    return 0;
  end if;

  insert into public.applications (
    user_id, company, position, location, job_url, application_date, source,
    job_description, requirements, status, priority, application_type,
    next_action, next_action_date, notes, is_demo
  ) values (
    demo_user, 'Northstar Studio', 'Growth Strategy Associate', 'Hong Kong',
    'https://example.com/jobs/growth-strategy', current_date - 12, 'Company Website',
    'Demo job description for checking long-form text layout.\n\nOwn growth experiments, analyse customer behaviour and work across product and marketing.',
    'Structured problem solving\nSQL or spreadsheet analysis\nClear written communication',
    'Applied', 'High', 'Graduate Program', 'Follow up with recruiter', current_date + 2,
    'DEMO — remove from the Dashboard when you are ready to use real data.', true
  ) returning id into applied_id;

  insert into public.applications (
    user_id, company, position, location, application_date, source, status,
    priority, application_type, next_action, next_action_date, notes, is_demo
  ) values (
    demo_user, 'Paper Kite', 'Product Operations Analyst', 'Remote', current_date - 18,
    'LinkedIn', 'Interview', 'Medium', 'Full-time', 'Prepare product case', current_date + 1,
    'DEMO — interview preparation and hiring manager notes go here.', true
  ) returning id into interview_id;

  insert into public.applications (
    user_id, company, position, location, application_date, source, status,
    priority, application_type, next_action, next_action_date, notes, is_demo
  ) values (
    demo_user, 'Common Ground', 'Research Executive', 'Shanghai', current_date - 8,
    'Referral', 'Online Assessment', 'Medium', 'Full-time', 'Complete assessment', current_date + 3,
    'DEMO — sample online assessment workflow.', true
  ) returning id into assessment_id;

  insert into public.applications (
    user_id, company, position, location, application_date, source, status,
    priority, application_type, salary, notes, is_demo
  ) values (
    demo_user, 'Field Notes Labs', 'Customer Insights Associate', 'Hangzhou', current_date - 31,
    'JobsDB', 'Offer', 'High', 'Full-time', 'HKD 28,000 / month',
    'DEMO — sample offer record.', true
  ) returning id into offer_id;

  insert into public.application_updates (application_id, date, status, notes) values
    (applied_id, current_date - 12, 'Applied', 'Application submitted through the company website.'),
    (interview_id, current_date - 18, 'Applied', 'Application submitted.'),
    (interview_id, current_date - 5, 'HR Screening', 'Thirty-minute recruiter conversation.'),
    (interview_id, current_date - 1, 'Interview', 'First-round interview invitation received.'),
    (assessment_id, current_date - 8, 'Applied', 'Application submitted through referral.'),
    (assessment_id, current_date - 2, 'Online Assessment', 'Assessment link received; due this week.'),
    (offer_id, current_date - 31, 'Applied', 'Application submitted.'),
    (offer_id, current_date - 14, 'Interview', 'Panel interview completed.'),
    (offer_id, current_date - 2, 'Offer', 'Written offer received.');

  return 4;
end;
$$;

create or replace function public.clear_demo_applications()
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.applications
  where user_id = auth.uid() and is_demo;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.seed_demo_applications() from public;
revoke all on function public.clear_demo_applications() from public;
grant execute on function public.seed_demo_applications() to authenticated;
grant execute on function public.clear_demo_applications() to authenticated;
