export const APPLICATION_STATUSES = [
  'Saved',
  'Preparing',
  'Applied',
  'Online Assessment',
  'HR Screening',
  'Interview',
  'Second Interview',
  'Final Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const PRIORITIES = ['High', 'Medium', 'Low'] as const
export type Priority = (typeof PRIORITIES)[number]

export const APPLICATION_TYPES = [
  'Graduate Program',
  'Full-time',
  'Internship',
  'Contract',
  'RA',
  'Other',
] as const
export type ApplicationType = (typeof APPLICATION_TYPES)[number]

export const SOURCES = [
  'LinkedIn',
  'JobsDB',
  'CTgoodjobs',
  'Company Website',
  'Boss',
  'Liepin',
  'Referral',
  'Other',
] as const

export interface ApplicationUpdate {
  id: string
  application_id: string
  date: string
  status: ApplicationStatus
  notes: string
  created_at: string
}

export interface Application {
  id: string
  user_id: string
  company: string
  position: string
  location: string
  job_url: string | null
  application_date: string
  source: string
  job_description: string
  requirements: string
  status: ApplicationStatus
  priority: Priority
  application_type: ApplicationType
  salary: string
  contact_person: string
  contact_information: string
  next_action: string
  next_action_date: string | null
  notes: string
  is_demo: boolean
  created_at: string
  updated_at: string
  application_updates: ApplicationUpdate[]
}

export type ApplicationInput = Omit<
  Application,
  | 'id'
  | 'user_id'
  | 'created_at'
  | 'updated_at'
  | 'is_demo'
  | 'application_updates'
>

export type ApplicationUpdateInput = Pick<
  ApplicationUpdate,
  'date' | 'status' | 'notes'
>

export interface ApplicationStats {
  total: number
  applied: number
  interview: number
  offers: number
  rejected: number
  thisWeek: number
  responseRate: number
  interviewRate: number
}
