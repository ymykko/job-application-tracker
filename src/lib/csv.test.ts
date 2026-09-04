import { describe, expect, it } from 'vitest'
import { mapCsvRow } from './csv'

describe('CSV mapping', () => {
  it('maps the existing job-search export columns into an application', () => {
    const result = mapCsvRow({
      company: 'BlackRock',
      job_title: 'Graduate Analyst',
      location: 'Hong Kong',
      recommendation_date: '2026-09-03',
      status: 'recommended',
      tier: 'Top 10',
      employment_type: 'Graduate Full-time',
      apply_url: 'https://example.com/job',
      match_reason: 'Strong fit',
      risk: 'Competitive',
    })

    expect(result).toMatchObject({
      company: 'BlackRock',
      position: 'Graduate Analyst',
      application_date: '2026-09-03',
      status: 'Saved',
      priority: 'High',
      application_type: 'Graduate Program',
      job_url: 'https://example.com/job',
    })
    expect(result?.notes).toContain('Strong fit')
    expect(result?.notes).toContain('Competitive')
  })

  it('recognises common Chinese headings', () => {
    expect(
      mapCsvRow({
        公司名称: '阿里巴巴',
        岗位名称: '用户运营',
        岗位地点: '杭州',
        投递日期: '2026-09-04',
        投递状态: '已投递',
      }),
    ).toMatchObject({ company: '阿里巴巴', position: '用户运营', status: 'Applied' })
  })

  it('skips rows without both a company and position', () => {
    expect(mapCsvRow({ company: 'Only company' })).toBeNull()
  })
})
