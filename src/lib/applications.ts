import type { Application, ApplicationStats, ApplicationStatus } from '../types'

const INTERVIEW_STATUSES = new Set<ApplicationStatus>([
  'Interview',
  'Second Interview',
  'Final Interview',
])

const RESPONDED_STATUSES = new Set<ApplicationStatus>([
  'Online Assessment',
  'HR Screening',
  'Interview',
  'Second Interview',
  'Final Interview',
  'Offer',
  'Rejected',
])

export function getApplicationStats(
  applications: Application[],
  now = new Date(),
): ApplicationStats {
  const submitted = applications.filter((application) => application.status !== 'Saved' && application.status !== 'Preparing')
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const interviewCount = applications.filter((application) =>
    INTERVIEW_STATUSES.has(application.status),
  ).length

  return {
    total: applications.length,
    applied: applications.filter((application) => application.status === 'Applied')
      .length,
    interview: interviewCount,
    offers: applications.filter((application) => application.status === 'Offer').length,
    rejected: applications.filter((application) => application.status === 'Rejected')
      .length,
    thisWeek: applications.filter(
      (application) => new Date(`${application.application_date}T00:00:00`) >= weekStart,
    ).length,
    responseRate: submitted.length
      ? Math.round(
          (applications.filter((application) => RESPONDED_STATUSES.has(application.status))
            .length /
            submitted.length) *
            100,
        )
      : 0,
    interviewRate: submitted.length
      ? Math.round((interviewCount / submitted.length) * 100)
      : 0,
  }
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`))
}

export function getLatestUpdate(application: Application) {
  return [...application.application_updates].sort((a, b) =>
    b.date.localeCompare(a.date),
  )[0]
}

export function sortUpdates(application: Application) {
  return [...application.application_updates].sort((a, b) =>
    b.date.localeCompare(a.date),
  )
}
