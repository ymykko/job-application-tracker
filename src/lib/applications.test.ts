import { describe, expect, it } from 'vitest'
import type { Application } from '../types'
import { getApplicationStats, getLatestUpdate } from './applications'

const makeApplication = (
  status: Application['status'],
  date: string,
  overrides: Partial<Application> = {},
): Application => ({
  id: crypto.randomUUID(),
  user_id: 'user-1',
  company: 'Example',
  position: 'Analyst',
  location: 'Hong Kong',
  job_url: null,
  application_date: date,
  source: 'LinkedIn',
  job_description: '',
  requirements: '',
  status,
  priority: 'Medium',
  application_type: 'Full-time',
  salary: '',
  contact_person: '',
  contact_information: '',
  next_action: '',
  next_action_date: null,
  notes: '',
  is_demo: false,
  created_at: `${date}T09:00:00Z`,
  updated_at: `${date}T09:00:00Z`,
  application_updates: [],
  ...overrides,
})

describe('application statistics', () => {
  it('calculates live pipeline metrics without counting saved roles as submissions', () => {
    const applications = [
      makeApplication('Saved', '2026-09-04'),
      makeApplication('Applied', '2026-09-03'),
      makeApplication('Interview', '2026-08-20'),
      makeApplication('Offer', '2026-08-10'),
      makeApplication('Rejected', '2026-08-01'),
    ]

    expect(getApplicationStats(applications, new Date('2026-09-04T12:00:00'))).toEqual({
      total: 5,
      applied: 1,
      interview: 1,
      offers: 1,
      rejected: 1,
      thisWeek: 2,
      responseRate: 75,
      interviewRate: 25,
    })
  })
})

describe('timeline', () => {
  it('returns the latest update by date even when rows arrive unsorted', () => {
    const application = makeApplication('Interview', '2026-09-01', {
      application_updates: [
        { id: '1', application_id: 'a', date: '2026-09-02', status: 'Applied', notes: 'Applied', created_at: '' },
        { id: '2', application_id: 'a', date: '2026-09-08', status: 'Interview', notes: 'Interview', created_at: '' },
      ],
    })
    expect(getLatestUpdate(application)?.notes).toBe('Interview')
  })
})
