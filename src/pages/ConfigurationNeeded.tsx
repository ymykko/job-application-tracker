import { CheckCircle2, Database, GitBranch, KeyRound } from 'lucide-react'

export function ConfigurationNeeded() {
  return (
    <main className="setup-page">
      <div className="setup-card">
        <div className="setup-brand">
          <div className="brand-mark">J</div>
          <span>Jobfolio</span>
        </div>
        <p className="eyebrow">One-time setup</p>
        <h1>Your tracker is ready for its database.</h1>
        <p className="setup-lead">
          The application has built successfully. Connect a Supabase project to enable your
          private login, records and timeline.
        </p>
        <ol className="setup-steps">
          <li>
            <Database size={18} />
            <div>
              <strong>Create a Supabase project</strong>
              <span>Any region is fine; choose one close to where you usually work.</span>
            </div>
          </li>
          <li>
            <CheckCircle2 size={18} />
            <div>
              <strong>Run the included migration</strong>
              <span>Open supabase/migrations/20260904000000_initial_schema.sql in the SQL editor.</span>
            </div>
          </li>
          <li>
            <KeyRound size={18} />
            <div>
              <strong>Add two environment variables</strong>
              <span>VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</span>
            </div>
          </li>
          <li>
            <GitBranch size={18} />
            <div>
              <strong>Add the same values as GitHub Actions secrets</strong>
              <span>The next deployment will activate the live tracker automatically.</span>
            </div>
          </li>
        </ol>
        <p className="setup-note">Full copy-and-paste instructions are in the repository README.</p>
      </div>
    </main>
  )
}
