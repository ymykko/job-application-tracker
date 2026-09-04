import type { ApplicationStatus, Priority } from '../types'

const statusClasses: Record<ApplicationStatus, string> = {
  Saved: 'badge badge-slate',
  Preparing: 'badge badge-stone',
  Applied: 'badge badge-blue',
  'Online Assessment': 'badge badge-violet',
  'HR Screening': 'badge badge-cyan',
  Interview: 'badge badge-amber',
  'Second Interview': 'badge badge-amber',
  'Final Interview': 'badge badge-orange',
  Offer: 'badge badge-green',
  Rejected: 'badge badge-red',
  Withdrawn: 'badge badge-slate',
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={statusClasses[status]}>{status}</span>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority priority-${priority.toLowerCase()}`}>
      <span aria-hidden="true" />
      {priority}
    </span>
  )
}
