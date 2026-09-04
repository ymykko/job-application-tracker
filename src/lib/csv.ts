import type { ParseResult } from 'papaparse'
import Papa from 'papaparse'
import {
  APPLICATION_STATUSES,
  type ApplicationInput,
  type ApplicationStatus,
  type ApplicationType,
  type Priority,
} from '../types'

type CsvRow = Record<string, string>

const get = (row: CsvRow, ...keys: string[]) => {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value?.trim() ?? '']),
  )
  for (const key of keys) {
    const value = normalized[key.toLowerCase()]
    if (value) return value
  }
  return ''
}

const normalizeDate = (value: string) => {
  if (!value) return new Date().toISOString().slice(0, 10)
  const direct = value.match(/\d{4}-\d{2}-\d{2}/)?.[0]
  if (direct) return direct
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString().slice(0, 10)
    : parsed.toISOString().slice(0, 10)
}

const normalizeStatus = (value: string): ApplicationStatus => {
  const exact = APPLICATION_STATUSES.find(
    (status) => status.toLowerCase() === value.toLowerCase(),
  )
  if (exact) return exact
  if (/offer/i.test(value)) return 'Offer'
  if (/reject|拒/i.test(value)) return 'Rejected'
  if (/interview|面试/i.test(value)) return 'Interview'
  if (/assessment|oa|笔试/i.test(value)) return 'Online Assessment'
  if (/prepare|准备/i.test(value)) return 'Preparing'
  if (/appl|投递|submitted/i.test(value)) return 'Applied'
  return 'Saved'
}

const normalizePriority = (value: string): Priority => {
  if (/high|高|top/i.test(value)) return 'High'
  if (/low|低/i.test(value)) return 'Low'
  return 'Medium'
}

const normalizeType = (value: string): ApplicationType => {
  if (/graduate|campus|校招|管培/i.test(value)) return 'Graduate Program'
  if (/intern/i.test(value)) return 'Internship'
  if (/contract/i.test(value)) return 'Contract'
  if (/\bra\b|research assistant/i.test(value)) return 'RA'
  if (/full.?time|全职/i.test(value)) return 'Full-time'
  return 'Other'
}

export function mapCsvRow(row: CsvRow): ApplicationInput | null {
  const company = get(row, 'company', '公司', '公司名称')
  const position = get(row, 'position', 'job_title', 'job title', '岗位', '岗位名称')
  if (!company || !position) return null

  const notes = [
    get(row, 'notes', '备注'),
    get(row, 'match_reason', '匹配原因'),
    get(row, 'risk', '风险'),
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    company,
    position,
    location: get(row, 'location', 'city', '地点', '岗位地点', 'base地') || 'Not specified',
    job_url: get(row, 'job_url', 'job link', 'apply_url', 'source_url', '岗位链接', '链接') || null,
    application_date: normalizeDate(
      get(row, 'application_date', 'application date', '投递日期', 'recommendation_date'),
    ),
    source: get(row, 'source', '来源') || 'Other',
    job_description: get(row, 'job_description', 'jd', 'job description', '职位描述'),
    requirements: get(row, 'requirements', 'key requirements', '要求'),
    status: normalizeStatus(get(row, 'status', 'current status', '投递状态', '投递进度')),
    priority: normalizePriority(get(row, 'priority', 'tier', '优先级')),
    application_type: normalizeType(
      get(row, 'application_type', 'employment_type', 'application type', '岗位类型'),
    ),
    salary: get(row, 'salary', '薪资'),
    contact_person: get(row, 'contact_person', 'contact person', '联系人'),
    contact_information: get(row, 'contact_information', 'contact information', '联系方式'),
    next_action: get(row, 'next_action', 'next action', '下一步'),
    next_action_date: get(row, 'next_action_date', 'next action date', '下一步日期') || null,
    notes,
  }
}

export function parseApplicationCsv(file: File): Promise<ApplicationInput[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: ParseResult<CsvRow>) => {
        if (result.errors.length) {
          reject(new Error(result.errors[0].message))
          return
        }
        resolve(result.data.map(mapCsvRow).filter(Boolean) as ApplicationInput[])
      },
      error: reject,
    })
  })
}
