import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplicationTable } from '../components/ApplicationTable'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { useApplications } from '../context/ApplicationsContext'
import { APPLICATION_STATUSES, APPLICATION_TYPES, PRIORITIES, SOURCES, type Application } from '../types'

type SortKey = 'application_date' | 'updated_at' | 'company'

export function ApplicationsPage() {
  const { applications, loading, error, deleteApplication } = useApplications()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState('')
  const [type, setType] = useState('')
  const [source, setSource] = useState('')
  const [sort, setSort] = useState<SortKey>('application_date')
  const [actionError, setActionError] = useState('')

  const locations = useMemo(
    () => [...new Set(applications.map((application) => application.location))].sort(),
    [applications],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return applications
      .filter((application) => {
        const matchesSearch =
          !query ||
          application.company.toLowerCase().includes(query) ||
          application.position.toLowerCase().includes(query)
        return (
          matchesSearch &&
          (!status || application.status === status) &&
          (!location || application.location === location) &&
          (!priority || application.priority === priority) &&
          (!type || application.application_type === type) &&
          (!source || application.source === source)
        )
      })
      .sort((a, b) => {
        if (sort === 'company') return a.company.localeCompare(b.company)
        return b[sort].localeCompare(a[sort])
      })
  }, [applications, location, priority, search, sort, source, status, type])

  const hasFilters = Boolean(search || status || location || priority || type || source)
  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setLocation('')
    setPriority('')
    setType('')
    setSource('')
  }

  const remove = async (application: Application) => {
    if (!window.confirm(`Delete ${application.position} at ${application.company}?`)) return
    setActionError('')
    try {
      await deleteApplication(application.id)
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : 'Could not delete application.')
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Your pipeline"
        title="Applications"
        description={`${applications.length} tracked ${applications.length === 1 ? 'role' : 'roles'} across every stage.`}
        actions={
          <Link to="/applications/new" className="button button-primary">
            <Plus size={16} /> New application
          </Link>
        }
      />

      {(error || actionError) && <div className="alert alert-error">{error || actionError}</div>}

      <section className="filter-panel">
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search applications"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company or position"
          />
        </div>
        <div className="filter-row">
          <SlidersHorizontal size={15} />
          <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Filter by location" value={location} onChange={(event) => setLocation(event.target.value)}>
            <option value="">All locations</option>
            {locations.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="">All priorities</option>
            {PRIORITIES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Filter by type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">All types</option>
            {APPLICATION_TYPES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Filter by source" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="">All sources</option>
            {SOURCES.map((item) => <option key={item}>{item}</option>)}
          </select>
          {hasFilters && (
            <button className="filter-clear" onClick={clearFilters}>
              <X size={14} /> Clear
            </button>
          )}
          <label className="sort-control">
            Sort
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
              <option value="application_date">Application date</option>
              <option value="updated_at">Last updated</option>
              <option value="company">Company</option>
            </select>
          </label>
        </div>
      </section>

      <div className="results-line">
        <span>{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</span>
        {hasFilters && <span>Filters applied</span>}
      </div>

      {loading ? (
        <div className="loading-panel"><span className="loading-line" /><span className="loading-line" /><span className="loading-line" /></div>
      ) : filtered.length ? (
        <ApplicationTable applications={filtered} onDelete={(app) => void remove(app)} />
      ) : applications.length ? (
        <EmptyState title="No matching applications." description="Try removing a filter or searching for a different company." />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
