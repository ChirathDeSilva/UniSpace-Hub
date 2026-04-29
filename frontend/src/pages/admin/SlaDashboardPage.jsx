import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { getProfile } from '../../services/authService'
import { getSlaDashboardTickets } from '../../services/ticketService'

const SLA_STATUS_META = {
  SLA_OK: { label: 'On Track', className: 'sla-status-ok' },
  SLA_AT_RISK: { label: 'At Risk', className: 'sla-status-risk' },
  SLA_BREACHED: { label: 'Breached', className: 'sla-status-breached' },
}

function formatDateTime(value) {
  if (!value) {
    return '—'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString()
}

function getRoleName(profile) {
  const rawRole = profile?.role?.name || profile?.role || profile?.roleName
  return typeof rawRole === 'string' ? rawRole.toUpperCase() : ''
}

function resolveTicketBase(roleName) {
  if (roleName.includes('TECH')) {
    return '/technician/tickets'
  }

  if (roleName.includes('ADMIN')) {
    return '/admin/tickets'
  }

  return '/user/tickets'
}

function parseErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (typeof error?.message === 'string') {
    return error.message
  }

  return 'Unable to load SLA dashboard data. Please try again.'
}

export default function SlaDashboardPage() {
  const [tickets, setTickets] = useState([])
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [slaFilter, setSlaFilter] = useState('SLA_AT_RISK')

  const ticketBase = useMemo(() => resolveTicketBase(getRoleName(profile)), [profile])

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const userProfile = await getProfile()
      const userId = userProfile?.id || userProfile?.userId

      if (!userId) {
        throw new Error('User profile is missing an id')
      }

      const data = await getSlaDashboardTickets(userId)
      setTickets(Array.isArray(data) ? data : [])
      setProfile(userProfile)
    } catch (err) {
      setError(parseErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const atRiskTickets = useMemo(
    () => tickets.filter((ticket) => ticket?.slaStatus === 'SLA_AT_RISK'),
    [tickets],
  )

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return atRiskTickets.filter((ticket) => {
      const matchesQuery = normalizedQuery
        ? [
            ticket?.title,
            ticket?.id,
            ticket?.location,
            ticket?.assignedTo?.fullName,
            ticket?.assignedTo?.name,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery))
        : true

      const matchesSla = ticket?.slaStatus === slaFilter

      return matchesQuery && matchesSla
    })
  }, [atRiskTickets, query, slaFilter])

  const summary = useMemo(() => {
    const total = atRiskTickets.length
    return { total, breached: 0, atRisk: total, onTrack: 0 }
  }, [atRiskTickets])

  return (
    <section className="sla-dashboard stack reveal-stagger" aria-labelledby="sla-dashboard-title">
      <Card className="sla-hero">
        <div className="sla-hero-content">
          <div>
            <p className="ticket-kicker">Service Level Compliance</p>
            <h1 id="sla-dashboard-title">SLA Dashboard</h1>
            <p>
              Monitor tickets that are nearing their SLA deadline or have already breached it.
            </p>
          </div>
          <Button onClick={loadDashboard} variant="secondary" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </Card>

      <div className="sla-metrics">
        <Card className="sla-metric-card sla-total">
          <p className="text-muted">Tickets in SLA scope</p>
          <h2>{summary.total}</h2>
          <p>Tracked by SLA monitor</p>
        </Card>
        <Card className="sla-metric-card sla-risk">
          <p className="text-muted">At risk</p>
          <h2>{summary.atRisk}</h2>
          <p>Within 75% of deadline</p>
        </Card>
        <Card className="sla-metric-card sla-breached">
          <p className="text-muted">Breached</p>
          <h2>{summary.breached}</h2>
          <p>Past SLA deadline</p>
        </Card>
        <Card className="sla-metric-card sla-ok">
          <p className="text-muted">On track</p>
          <h2>{summary.onTrack}</h2>
          <p>Safe SLA window</p>
        </Card>
      </div>

      <Card className="sla-filters">
        <div className="sla-filter-grid">
          <div className="field">
            <label htmlFor="sla-search">Search tickets</label>
            <input
              id="sla-search"
              placeholder="Search by title, id, location, technician"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="sla-status">SLA status</label>
            <select
              id="sla-status"
              value={slaFilter}
              onChange={(event) => setSlaFilter(event.target.value)}
            >
              <option value="SLA_AT_RISK">At Risk</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="sla-table-card">
        <div className="sla-table-header">
          <div>
            <h2>SLA Tickets</h2>
            <p className="text-muted">{filteredTickets.length} record(s) found</p>
          </div>
          {error ? <p className="field-error">{error}</p> : null}
        </div>

        {isLoading ? (
          <div className="sla-empty-state">Loading SLA tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="sla-empty-state">No SLA alerts right now.</div>
        ) : (
          <div className="sla-table" role="table" aria-label="SLA tickets">
            <div className="sla-row sla-row-head" role="row">
              <span>Ticket</span>
              <span>Priority</span>
              <span>Status</span>
              <span>SLA Status</span>
              <span>Deadline</span>
              <span>Assigned</span>
              <span>Actions</span>
            </div>

            {filteredTickets.map((ticket) => {
              const statusMeta = SLA_STATUS_META[ticket?.slaStatus] || {
                label: ticket?.slaStatus || 'Unknown',
                className: 'sla-status-ok',
              }

              return (
                <div className="sla-row" role="row" key={ticket?.id}>
                  <span className="sla-ticket-title">
                    <strong>#{ticket?.id}</strong>
                    <span>{ticket?.title || 'Untitled ticket'}</span>
                    <span className="text-muted">{ticket?.location || 'No location'}</span>
                  </span>
                  <span>{ticket?.priority || '—'}</span>
                  <span>{ticket?.status || '—'}</span>
                  <span>
                    <span className={`sla-status-badge ${statusMeta.className}`}>
                      {statusMeta.label}
                    </span>
                  </span>
                  <span>{formatDateTime(ticket?.slaDeadline)}</span>
                  <span>
                    {ticket?.assignedTo?.fullName || ticket?.assignedTo?.name || 'Unassigned'}
                  </span>
                  <span>
                    <Link to={`${ticketBase}/${ticket?.id}`} className="sla-link">
                      View
                    </Link>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </section>
  )
}
