# Jobfolio — Job Application Tracker

A private, responsive workspace for managing a job search from saved role to interview, offer, rejection or withdrawal. The interface is intentionally calm and editorial, with the practical depth of a full application database.

## Features

- Dashboard with live totals, weekly activity, response rate and interview rate
- Create, read, edit and delete application records
- Application timeline with add, edit and delete controls for every progress update
- Optional automatic current-status update when a timeline event is added
- Search by company or position
- Filter by status, location, priority, application type and source
- Sort by application date, last update or company
- Complete JD, requirements, notes, salary, recruiter and next-action fields
- CSV import for Google Sheets and common English/Chinese column names
- Supabase email/password authentication and per-user Row Level Security (RLS)
- Four removable demo applications stored in Supabase, not hard-coded in the UI
- Responsive table and mobile card views
- Automated lint, tests and production build before GitHub Pages deployment

## Technology

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4, with a small purpose-built design system
- React Router
- Supabase Auth and Postgres
- Vitest
- GitHub Actions and GitHub Pages

## Project structure

```text
src/
  components/              Shared shell, table, badges and forms
  context/                 Authentication and application data operations
  lib/                     Supabase client, statistics and CSV mapping
  pages/                   Dashboard, list, detail, forms, login and import
  types.ts                 Domain types and allowed field values
supabase/
  migrations/              Schema, RLS policies and database demo seed functions
.github/workflows/         Verified GitHub Pages deployment
```

## 1. Create the Supabase database

1. Create a project at [supabase.com](https://supabase.com/).
2. Open **SQL Editor → New query**.
3. Copy the entire contents of `supabase/migrations/20260904000000_initial_schema.sql` into the editor and run it.
4. Open **Project Settings → API** and copy:
   - Project URL
   - `anon` / publishable key

The migration creates:

- `applications`: one row per role
- `application_updates`: timeline events linked to an application
- indexes for owner, date, status and timeline lookups
- an automatic `updated_at` trigger
- RLS policies that only allow a signed-in user to access their own rows
- database functions for loading and removing demo data

The browser uses only the public anonymous key. Access control does not rely on hiding that key; Supabase Auth and RLS enforce ownership for every query.

## 2. Configure authentication

Email/password authentication works without additional code.

1. In Supabase, open **Authentication → Providers → Email**.
2. Keep Email enabled.
3. For the simplest first setup, temporarily turn off **Confirm email**.
4. Open the deployed site and create your owner account.
5. After the account exists, disable **Allow new users to sign up** in the Supabase authentication settings if you want this to be strictly single-user.

Even if sign-up remains enabled, RLS prevents one account from reading or changing another account's applications.

## 3. Run locally

Prerequisites: Node.js 24+ and pnpm 11+.

```bash
pnpm install
cp .env.example .env.local
```

Edit `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then run:

```bash
pnpm dev
```

Open the local URL printed by Vite. `.env` and `.env.local` are ignored by Git and must never be committed.

## 4. Import the current Google Sheet

The app includes a dedicated **Import** page.

1. Open the Google Sheet.
2. Choose **File → Download → Comma Separated Values (.csv)**.
3. In Jobfolio, open **Import** and choose the downloaded file.
4. Review the preview and import once.

Only `Company` and `Position` are required. The importer recognises common alternatives such as:

- `company`, `公司`, `公司名称`
- `position`, `job_title`, `岗位`, `岗位名称`
- `location`, `city`, `地点`, `岗位地点`
- `application_date`, `投递日期`, `recommendation_date`
- `status`, `current status`, `投递状态`
- `job_url`, `job link`, `apply_url`, `source_url`, `岗位链接`

Rows from the existing job-search recommendation export map safely to `Saved` unless their status clearly means applied, assessment, interview, offer or rejected. Match reasons and risks are preserved in Notes.

The first version does not merge duplicates automatically, so import a file only once. Individual mistakes can be edited or deleted from the application list.

## 5. Deploy with GitHub Pages

The included workflow deploys every push to `main`.

In the GitHub repository:

1. Open **Settings → Secrets and variables → Actions**.
2. Create these repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Open **Settings → Pages**.
4. Set **Source** to **GitHub Actions**.
5. Open **Actions → Deploy to GitHub Pages → Run workflow**, or push another commit.

If the two secrets are not set, the deployment still succeeds but shows a one-time setup screen instead of the login page. Adding the secrets and rerunning the workflow activates the tracker.

The workflow runs `lint`, `test` and `build` before publishing, so a broken change will not replace the working site.

## Commands

```bash
pnpm dev          # local development
pnpm lint         # static checks
pnpm typecheck    # TypeScript checks
pnpm test         # unit tests
pnpm build        # verified production build
pnpm preview      # preview the production build locally
```

## Data model

Each application belongs to `auth.uid()`. Timeline records do not store a second owner ID; their RLS policies verify ownership through the parent application. Deleting an application automatically deletes its timeline via `ON DELETE CASCADE`.

Key fields on `applications` include company, position, location, original URL, application date, source, JD, requirements, status, priority, application type, salary, recruiter details, next action, notes and timestamps.

## Demo data

After signing in, use **Load demo data** on the Dashboard. The database function adds four clearly marked roles and realistic timeline events. Use **Remove demo data** to delete all demo rows and their timelines in one action.

## Continuing development

- Add a field: update `src/types.ts`, the application form, detail view and a new Supabase migration.
- Add a status: update `APPLICATION_STATUSES` and add a migration that changes both status constraints.
- Add analytics: derive them in `src/lib/applications.ts` and render a new Dashboard card or section.
- Add reminders: use `next_action_date` as the source for email, calendar or notification integration.
- Add files: create a private Supabase Storage bucket and add owner-scoped storage policies.

Create a new timestamped SQL migration for database changes instead of editing a migration that has already run in production.

## Security notes

- No service-role key is used in the browser.
- The anonymous key is safe for a client application only because RLS is enabled and tested by policy design.
- Do not put resumes, passwords or private API keys in the repository.
- Keep the Supabase service-role key server-side if a future feature needs it.
- Review Supabase Auth logs and database backups periodically once the tracker contains important records.
