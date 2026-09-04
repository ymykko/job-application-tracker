import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleCheck,
  MessageSquareText,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplicationTable } from '../components/ApplicationTable'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useApplications } from '../context/ApplicationsContext'
import { getApplicationStats } from '../lib/applications'
import type { Application } from '../types'

export function DashboardPage() {
  const { applications, loading, error, deleteApplication, loadDemoData, clearDemoData } =
    useApplications()
  const [actionError, setActionError] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)
  const stats = getApplicationStats(applications)
  const recentApplications = applications.slice(0, 6)
  const hasDemoData = applications.some((application) => application.is_demo)

  const remove = async (application: Application) => {
    if (!window.confirm(`Delete ${application.position} at ${application.company}?`)) return
    try {
      await deleteApplication(application.id)
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : 'Could not delete application.')
    }
  }

  const runDemoAction = async (action: () => Promise<void>) => {
    setDemoLoading(true)
    setActionError('')
    try {
      await action()
    } catch (demoError) {
      setActionError(demoError instanceof Error ? demoError.message : 'The demo action failed.')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Overview"
        title="Your application desk"
        description="A quiet view of what is moving, what needs attention and what comes next."
        actions={
          <Link to="/applications/new" className="button button-primary">
            <Plus size={16} /> New application
          </Link>
        }
      />

      {(error || actionError) && <div className="alert alert-error">{error || actionError}</div>}

      <section className="stats-grid" aria-label="Application statistics">
        <article className="stat-card stat-card-featured">
          <div className="stat-icon"><BriefcaseBusiness size={18} /></div>
          <span>Total applications</span>
          <strong>{stats.total}</strong>
          <small>{stats.thisWeek} added in the last 7 days</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon"><CircleCheck size={18} /></div>
          <span>Applied</span>
          <strong>{stats.applied}</strong>
          <small>Waiting for a response</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon"><MessageSquareText size={18} /></div>
          <span>Interviewing</span>
          <strong>{stats.interview}</strong>
          <small>{stats.interviewRate}% interview rate</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon"><Sparkles size={18} /></div>
          <span>Offers</span>
          <strong>{stats.offers}</strong>
          <small>{stats.responseRate}% response rate</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon"><Target size={18} /></div>
          <span>Rejected</span>
          <strong>{stats.rejected}</strong>
          <small>Closed applications</small>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recently updated</p>
            <h2>Applications</h2>
          </div>
          {applications.length > 0 && (
            <Link to="/applications" className="text-link">
              View all <ArrowRight size={15} />
            </Link>
          )}
        </div>
        {loading ? (
          <div className="loading-panel"><span className="loading-line" /><span className="loading-line" /><span className="loading-line" /></div>
        ) : recentApplications.length ? (
          <ApplicationTable applications={recentApplications} onDelete={(app) => void remove(app)} />
        ) : (
          <EmptyState />
        )}
      </section>

      {!loading && (
        <aside className="demo-callout">
          <div className="demo-icon"><CalendarDays size={18} /></div>
          <div>
            <strong>{hasDemoData ? 'Demo records are visible' : 'Want to preview the full workflow?'}</strong>
            <p>
              {hasDemoData
                ? 'They are stored in Supabase and clearly marked. Remove them whenever you are ready.'
                : 'Load four removable demo applications into your database.'}
            </p>
          </div>
          <button
            className="button button-secondary"
            disabled={demoLoading}
            onClick={() => void runDemoAction(hasDemoData ? clearDemoData : loadDemoData)}
          >
            {demoLoading ? 'Working…' : hasDemoData ? 'Remove demo data' : 'Load demo data'}
          </button>
        </aside>
      )}
    </div>
  )
}
