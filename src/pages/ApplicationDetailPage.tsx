import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  Contact,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/StatusBadge'
import { useApplications } from '../context/ApplicationsContext'
import { formatDate, sortUpdates } from '../lib/applications'
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
  type ApplicationUpdate,
  type ApplicationUpdateInput,
} from '../types'

function TimelineComposer({ application }: { application: Application }) {
  const { addUpdate, editUpdate, deleteUpdate } = useApplications()
  const [editing, setEditing] = useState<ApplicationUpdate | null>(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<ApplicationStatus>(application.status)
  const [notes, setNotes] = useState('')
  const [syncStatus, setSyncStatus] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setEditing(null)
    setDate(new Date().toISOString().slice(0, 10))
    setStatus(application.status)
    setNotes('')
    setSyncStatus(true)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const input: ApplicationUpdateInput = { date, status, notes: notes.trim() }
    try {
      if (editing) {
        await editUpdate(editing.id, application.id, input, syncStatus)
      } else {
        await addUpdate(application.id, input, syncStatus)
      }
      reset()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save update.')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (update: ApplicationUpdate) => {
    setEditing(update)
    setDate(update.date)
    setStatus(update.status)
    setNotes(update.notes)
    setSyncStatus(false)
  }

  const removeUpdate = async (update: ApplicationUpdate) => {
    if (!window.confirm('Delete this progress update?')) return
    setError('')
    try {
      await deleteUpdate(update.id)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete update.')
    }
  }

  return (
    <div className="timeline-layout">
      <div className="timeline-list">
        {sortUpdates(application).length ? (
          sortUpdates(application).map((update, index) => (
            <article className="timeline-item" key={update.id}>
              <div className="timeline-rail">
                <span>{index === 0 ? <Check size={13} /> : null}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-topline">
                  <div>
                    <time>{formatDate(update.date)}</time>
                    <StatusBadge status={update.status} />
                  </div>
                  <div className="row-actions">
                    <button className="icon-button" onClick={() => startEditing(update)} title="Edit update">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-button danger" onClick={() => void removeUpdate(update)} title="Delete update">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p>{update.notes || 'No notes added.'}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="timeline-empty">
            <CalendarClock size={20} />
            <div>
              <strong>No progress updates yet</strong>
              <p>Add the submission, email or interview that moved this application forward.</p>
            </div>
          </div>
        )}
      </div>

      <form className="update-form" onSubmit={submit}>
        <div className="update-form-title">
          <div>
            <p className="eyebrow">{editing ? 'Editing record' : 'New progress'}</p>
            <h3>{editing ? 'Update this milestone' : 'Add to the timeline'}</h3>
          </div>
          {editing && (
            <button type="button" className="icon-button" onClick={reset} title="Cancel editing">
              <X size={15} />
            </button>
          )}
        </div>
        <label>
          Date
          <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label>
          Stage / status
          <select value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)}>
            {APPLICATION_STATUSES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Notes
          <textarea
            rows={5}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What happened? Add useful details or the next step."
          />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={syncStatus} onChange={(event) => setSyncStatus(event.target.checked)} />
          Also set current status to {status}
        </label>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="button button-primary button-wide" disabled={saving}>
          {editing ? <Save size={15} /> : <Plus size={15} />}
          {saving ? 'Saving…' : editing ? 'Save update' : 'Add progress update'}
        </button>
      </form>
    </div>
  )
}

function TextSection({ title, value, empty }: { title: string; value: string; empty: string }) {
  return (
    <section className="detail-section prose-section">
      <div className="section-heading"><h2>{title}</h2></div>
      <div className={value ? 'preserve-lines' : 'empty-copy'}>{value || empty}</div>
    </section>
  )
}

export function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { applications, loading, deleteApplication } = useApplications()
  const [error, setError] = useState('')
  const application = applications.find((item) => item.id === id)

  if (loading) return <div className="page"><div className="loading-panel" /></div>
  if (!application || !id) return <Navigate to="/applications" replace />

  const removeApplication = async () => {
    if (!window.confirm(`Delete ${application.position} at ${application.company} and its full timeline?`)) return
    try {
      await deleteApplication(application.id)
      navigate('/applications')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete application.')
    }
  }

  return (
    <div className="page detail-page">
      <Link to="/applications" className="back-link"><ArrowLeft size={15} /> Applications</Link>
      <header className="detail-hero">
        <div className="detail-title">
          <div className="company-monogram">{application.company.charAt(0).toUpperCase()}</div>
          <div>
            <div className="detail-eyebrow">
              <span>{application.company}</span>
              {application.is_demo && <span className="demo-label">Demo</span>}
            </div>
            <h1>{application.position}</h1>
            <p><MapPin size={15} /> {application.location}</p>
          </div>
        </div>
        <div className="detail-actions">
          <StatusBadge status={application.status} />
          {application.job_url && (
            <a href={application.job_url} target="_blank" rel="noreferrer" className="button button-secondary">
              Original job <ArrowUpRight size={15} />
            </a>
          )}
          <Link to={`/applications/${id}/edit`} className="button button-primary"><Pencil size={15} /> Edit</Link>
          <button className="icon-button danger" onClick={() => void removeApplication()} title="Delete application">
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="detail-section overview-section">
        <div className="section-heading"><h2>Overview</h2></div>
        <dl className="overview-grid">
          <div><dt>Application date</dt><dd>{formatDate(application.application_date)}</dd></div>
          <div><dt>Source</dt><dd>{application.source}</dd></div>
          <div><dt>Type</dt><dd>{application.application_type}</dd></div>
          <div><dt>Priority</dt><dd>{application.priority}</dd></div>
          <div><dt>Salary</dt><dd>{application.salary || '—'}</dd></div>
          <div><dt>Last updated</dt><dd>{formatDate(application.updated_at)}</dd></div>
        </dl>
        {(application.next_action || application.next_action_date) && (
          <div className="next-action-card">
            <CalendarClock size={18} />
            <div><span>Next action</span><strong>{application.next_action || 'Follow up'}</strong></div>
            <time>{formatDate(application.next_action_date)}</time>
          </div>
        )}
        {(application.contact_person || application.contact_information) && (
          <div className="contact-line">
            <Contact size={17} />
            <span>{application.contact_person || 'Contact'}</span>
            <strong>{application.contact_information || 'No contact details'}</strong>
          </div>
        )}
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <div><p className="eyebrow">Application progress</p><h2>Timeline</h2></div>
        </div>
        <TimelineComposer application={application} />
      </section>

      <div className="detail-copy-grid">
        <TextSection title="Job description" value={application.job_description} empty="No job description saved." />
        <TextSection title="Key requirements" value={application.requirements} empty="No key requirements saved." />
      </div>

      <section className="detail-section prose-section notes-section">
        <div className="section-heading"><h2>Notes</h2><FileText size={18} /></div>
        <div className={application.notes ? 'preserve-lines' : 'empty-copy'}>{application.notes || 'No private notes yet.'}</div>
      </section>
    </div>
  )
}
