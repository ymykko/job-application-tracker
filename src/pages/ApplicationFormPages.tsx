import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApplicationForm } from '../components/ApplicationForm'
import { PageHeader } from '../components/PageHeader'
import { useApplications } from '../context/ApplicationsContext'
import type { Application, ApplicationInput } from '../types'

const toInput = (application: Application): ApplicationInput => ({
  company: application.company,
  position: application.position,
  location: application.location,
  job_url: application.job_url,
  application_date: application.application_date,
  source: application.source,
  job_description: application.job_description,
  requirements: application.requirements,
  status: application.status,
  priority: application.priority,
  application_type: application.application_type,
  salary: application.salary,
  contact_person: application.contact_person,
  contact_information: application.contact_information,
  next_action: application.next_action,
  next_action_date: application.next_action_date,
  notes: application.notes,
})

export function NewApplicationPage() {
  const { createApplication } = useApplications()
  const navigate = useNavigate()

  return (
    <div className="page page-narrow">
      <PageHeader eyebrow="New record" title="Add an application" description="Capture the role now; refine the details as the process moves." />
      <ApplicationForm
        submitLabel="Create application"
        onSubmit={async (input) => {
          const id = await createApplication(input)
          navigate(`/applications/${id}`)
        }}
      />
    </div>
  )
}

export function EditApplicationPage() {
  const { id } = useParams()
  const { applications, loading, updateApplication } = useApplications()
  const navigate = useNavigate()
  const application = useMemo(
    () => applications.find((item) => item.id === id),
    [applications, id],
  )

  if (loading) return <div className="page"><div className="loading-panel" /></div>
  if (!application || !id) return <Navigate to="/applications" replace />

  return (
    <div className="page page-narrow">
      <PageHeader eyebrow={application.company} title="Edit application" description="Update the role details, status and next action." />
      <ApplicationForm
        initialValue={toInput(application)}
        submitLabel="Save changes"
        cancelTo={`/applications/${id}`}
        onSubmit={async (input) => {
          await updateApplication(id, input)
          navigate(`/applications/${id}`)
        }}
      />
    </div>
  )
}
