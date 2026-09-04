import { BriefcaseBusiness, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EmptyState({
  title = 'No applications yet.',
  description = 'Start tracking your job applications here.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <BriefcaseBusiness size={24} strokeWidth={1.6} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to="/applications/new" className="button button-primary">
        <Plus size={16} /> Create your first application
      </Link>
    </div>
  )
}
