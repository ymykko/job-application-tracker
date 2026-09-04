import { ArrowLeft, LoaderCircle, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
  PRIORITIES,
  SOURCES,
  type ApplicationInput,
} from '../types'

export const emptyApplication: ApplicationInput = {
  company: '',
  position: '',
  location: '',
  job_url: null,
  application_date: new Date().toISOString().slice(0, 10),
  source: 'Company Website',
  job_description: '',
  requirements: '',
  status: 'Applied',
  priority: 'Medium',
  application_type: 'Full-time',
  salary: '',
  contact_person: '',
  contact_information: '',
  next_action: '',
  next_action_date: null,
  notes: '',
}

export function ApplicationForm({
  initialValue = emptyApplication,
  submitLabel,
  onSubmit,
  cancelTo = '/applications',
}: {
  initialValue?: ApplicationInput
  submitLabel: string
  onSubmit: (input: ApplicationInput) => Promise<void>
  cancelTo?: string
}) {
  const [form, setForm] = useState<ApplicationInput>(initialValue)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        ...form,
        company: form.company.trim(),
        position: form.position.trim(),
        location: form.location.trim(),
        job_url: form.job_url?.trim() || null,
        next_action_date: form.next_action_date || null,
      })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save application.')
      setSaving(false)
    }
  }

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <section className="form-section">
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <h2>Basic information</h2>
            <p>The essentials you need to find this role later.</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Company <em>Required</em>
            <input
              required
              value={form.company}
              onChange={(event) => set('company', event.target.value)}
              placeholder="e.g. BlackRock"
            />
          </label>
          <label>
            Position <em>Required</em>
            <input
              required
              value={form.position}
              onChange={(event) => set('position', event.target.value)}
              placeholder="e.g. Graduate Analyst"
            />
          </label>
          <label>
            Location <em>Required</em>
            <input
              required
              value={form.location}
              onChange={(event) => set('location', event.target.value)}
              placeholder="Hong Kong, Hangzhou, Remote…"
            />
          </label>
          <label>
            Job link
            <input
              type="url"
              value={form.job_url ?? ''}
              onChange={(event) => set('job_url', event.target.value)}
              placeholder="https://…"
            />
          </label>
          <label>
            Application date <em>Required</em>
            <input
              required
              type="date"
              value={form.application_date}
              onChange={(event) => set('application_date', event.target.value)}
            />
          </label>
          <label>
            Source
            <select value={form.source} onChange={(event) => set('source', event.target.value)}>
              {SOURCES.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <span>02</span>
          <div>
            <h2>Application</h2>
            <p>Keep the stage, importance and practical details current.</p>
          </div>
        </div>
        <div className="form-grid form-grid-three">
          <label>
            Current status
            <select
              value={form.status}
              onChange={(event) => set('status', event.target.value as ApplicationInput['status'])}
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(event) => set('priority', event.target.value as ApplicationInput['priority'])}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </label>
          <label>
            Application type
            <select
              value={form.application_type}
              onChange={(event) =>
                set('application_type', event.target.value as ApplicationInput['application_type'])
              }
            >
              {APPLICATION_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Salary
            <input
              value={form.salary}
              onChange={(event) => set('salary', event.target.value)}
              placeholder="Optional"
            />
          </label>
          <label>
            Contact person
            <input
              value={form.contact_person}
              onChange={(event) => set('contact_person', event.target.value)}
              placeholder="Recruiter or hiring manager"
            />
          </label>
          <label>
            Contact information
            <input
              value={form.contact_information}
              onChange={(event) => set('contact_information', event.target.value)}
              placeholder="Email or LinkedIn"
            />
          </label>
          <label className="span-two">
            Next action
            <input
              value={form.next_action}
              onChange={(event) => set('next_action', event.target.value)}
              placeholder="Prepare interview, follow up with HR…"
            />
          </label>
          <label>
            Next action date
            <input
              type="date"
              value={form.next_action_date ?? ''}
              onChange={(event) => set('next_action_date', event.target.value || null)}
            />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <span>03</span>
          <div>
            <h2>Role context</h2>
            <p>Paste the original description and keep your working notes together.</p>
          </div>
        </div>
        <div className="form-stack">
          <label>
            Job description
            <textarea
              rows={10}
              value={form.job_description}
              onChange={(event) => set('job_description', event.target.value)}
              placeholder="Paste the full JD here. Line breaks will be preserved."
            />
          </label>
          <label>
            Key requirements
            <textarea
              rows={6}
              value={form.requirements}
              onChange={(event) => set('requirements', event.target.value)}
              placeholder="Summarise the must-haves, nice-to-haves and gaps."
            />
          </label>
          <label>
            Notes
            <textarea
              rows={6}
              value={form.notes}
              onChange={(event) => set('notes', event.target.value)}
              placeholder="Why this role, interview prep, salary, follow-up items…"
            />
          </label>
        </div>
      </section>

      <div className="form-footer">
        <Link to={cancelTo} className="button button-ghost">
          <ArrowLeft size={16} /> Cancel
        </Link>
        <button className="button button-primary" type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
