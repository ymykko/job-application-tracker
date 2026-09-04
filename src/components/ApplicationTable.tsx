import { ArrowUpRight, Eye, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, getLatestUpdate } from '../lib/applications'
import type { Application } from '../types'
import { PriorityBadge, StatusBadge } from './StatusBadge'

export function ApplicationTable({
  applications,
  onDelete,
}: {
  applications: Application[]
  onDelete: (application: Application) => void
}) {
  return (
    <div className="table-wrap">
      <table className="applications-table">
        <thead>
          <tr>
            <th>Company & position</th>
            <th>Location</th>
            <th>Applied</th>
            <th>Status</th>
            <th>Latest progress</th>
            <th>Priority</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => {
            const latest = getLatestUpdate(application)
            return (
              <tr key={application.id}>
                <td>
                  <Link to={`/applications/${application.id}`} className="application-name">
                    <strong>{application.company}</strong>
                    <span>{application.position}</span>
                  </Link>
                </td>
                <td>{application.location}</td>
                <td className="nowrap">{formatDate(application.application_date)}</td>
                <td>
                  <StatusBadge status={application.status} />
                </td>
                <td className="progress-cell">
                  {latest ? (
                    <>
                      <span>{latest.notes || latest.status}</span>
                      <small>{formatDate(latest.date)}</small>
                    </>
                  ) : (
                    <span className="muted">No updates</span>
                  )}
                </td>
                <td>
                  <PriorityBadge priority={application.priority} />
                </td>
                <td>
                  <div className="row-actions">
                    {application.job_url && (
                      <a
                        href={application.job_url}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-button"
                        title="Open job page"
                      >
                        <ArrowUpRight size={15} />
                      </a>
                    )}
                    <Link
                      to={`/applications/${application.id}`}
                      className="icon-button"
                      title="View"
                    >
                      <Eye size={15} />
                    </Link>
                    <Link
                      to={`/applications/${application.id}/edit`}
                      className="icon-button"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      className="icon-button danger"
                      title="Delete"
                      onClick={() => onDelete(application)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="application-cards">
        {applications.map((application) => {
          const latest = getLatestUpdate(application)
          return (
            <article className="application-card" key={application.id}>
              <div className="card-topline">
                <StatusBadge status={application.status} />
                <PriorityBadge priority={application.priority} />
              </div>
              <Link to={`/applications/${application.id}`}>
                <h3>{application.position}</h3>
                <p>{application.company}</p>
              </Link>
              <dl>
                <div>
                  <dt>Location</dt>
                  <dd>{application.location}</dd>
                </div>
                <div>
                  <dt>Applied</dt>
                  <dd>{formatDate(application.application_date)}</dd>
                </div>
              </dl>
              <p className="mobile-progress">
                {latest ? latest.notes || latest.status : 'No progress updates yet'}
              </p>
              <div className="card-actions">
                <Link to={`/applications/${application.id}`} className="button button-secondary">
                  View
                </Link>
                <Link
                  to={`/applications/${application.id}/edit`}
                  className="button button-ghost"
                >
                  Edit
                </Link>
                <button className="button button-ghost danger-text" onClick={() => onDelete(application)}>
                  Delete
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
