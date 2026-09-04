import { ArrowRight, CheckCircle2, FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { useApplications } from '../context/ApplicationsContext'
import { parseApplicationCsv } from '../lib/csv'
import type { ApplicationInput } from '../types'

export function ImportPage() {
  const { importApplications } = useApplications()
  const [rows, setRows] = useState<ApplicationInput[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(0)

  const selectFile = async (file?: File) => {
    if (!file) return
    setError('')
    setImported(0)
    setFileName(file.name)
    try {
      const parsed = await parseApplicationCsv(file)
      if (!parsed.length) throw new Error('No rows with both a company and position were found.')
      setRows(parsed)
    } catch (parseError) {
      setRows([])
      setError(parseError instanceof Error ? parseError.message : 'Could not read this CSV file.')
    }
  }

  const runImport = async () => {
    setLoading(true)
    setError('')
    try {
      const count = await importApplications(rows)
      setImported(count)
      setRows([])
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Import failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <PageHeader
        eyebrow="Bring your records"
        title="Import applications"
        description="Export your Google Sheet as CSV, then bring every row into your private database."
      />

      <section className="import-guide">
        <div><span>1</span><p><strong>In Google Sheets</strong>Choose File → Download → Comma Separated Values (.csv).</p></div>
        <ArrowRight size={18} />
        <div><span>2</span><p><strong>Choose the file below</strong>Review the detected company, role and status.</p></div>
        <ArrowRight size={18} />
        <div><span>3</span><p><strong>Import once</strong>Rows are saved to Supabase and immediately searchable.</p></div>
      </section>

      <label className="upload-zone">
        <input type="file" accept=".csv,text/csv" onChange={(event) => void selectFile(event.target.files?.[0])} />
        <div className="upload-icon"><UploadCloud size={22} /></div>
        <strong>{fileName || 'Choose a CSV file'}</strong>
        <span>Company and Position are the only required columns.</span>
        <span className="button button-secondary">Browse files</span>
      </label>

      {error && <div className="alert alert-error">{error}</div>}
      {imported > 0 && (
        <div className="import-success">
          <CheckCircle2 size={20} />
          <div><strong>{imported} applications imported</strong><span>Your records are now available in the application list.</span></div>
          <Link to="/applications" className="button button-secondary">View applications</Link>
        </div>
      )}

      {rows.length > 0 && (
        <section className="import-preview">
          <div className="section-heading">
            <div><p className="eyebrow">Preview</p><h2>{rows.length} rows ready</h2></div>
            <button className="button button-primary" onClick={() => void runImport()} disabled={loading}>
              <FileSpreadsheet size={16} /> {loading ? 'Importing…' : `Import ${rows.length} rows`}
            </button>
          </div>
          <div className="preview-list">
            {rows.slice(0, 5).map((row, index) => (
              <div key={`${row.company}-${row.position}-${index}`}>
                <div><strong>{row.company}</strong><span>{row.position}</span></div>
                <span>{row.location}</span>
                <StatusBadge status={row.status} />
              </div>
            ))}
          </div>
          {rows.length > 5 && <p className="preview-more">And {rows.length - 5} more rows.</p>}
          <p className="import-warning">Import the file only once. This first version does not automatically merge duplicates.</p>
        </section>
      )}

      <section className="field-map">
        <h2>Recognised columns</h2>
        <p>English and common Chinese headings are supported, including:</p>
        <div>
          {['Company / 公司', 'Position / 岗位', 'Location / 地点', 'Application Date / 投递日期', 'Status / 投递状态', 'Job Link / 岗位链接', 'Priority / 优先级', 'Notes / 备注'].map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>
    </div>
  )
}
