import { useState, useEffect, useCallback } from 'react'
import useAuth from '../../hooks/useAuth'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService'

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ['ALL', 'TICKET', 'BOOKING', 'AUTHENTICATION', 'FACILITY', 'SYSTEM']
const PAGE_SIZE = 15

const TYPE_META = {
  TICKET:         { icon: '🎫', label: 'Ticket',         color: '#7c3aed' },
  BOOKING:        { icon: '📅', label: 'Booking',        color: '#0056d2' },
  AUTHENTICATION: { icon: '🔐', label: 'Security',       color: '#dc2626' },
  FACILITY:       { icon: '🏛️', label: 'Facility',       color: '#059669' },
  SYSTEM:         { icon: '⚙️', label: 'System',         color: '#d97706' },
}

const SEVERITY_DOT = {
  INFO:    '#0056d2',
  SUCCESS: '#16a34a',
  WARNING: '#d97706',
  ERROR:   '#dc2626',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr) {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  return then.toLocaleDateString()
}

function decodeUserId(token) {
  try {
    return JSON.parse(atob(token.split('.')[1])).sub
  } catch {
    return null
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotificationCard({ notification, onRead }) {
  const meta = TYPE_META[notification.type] || TYPE_META.SYSTEM
  const severityColor = SEVERITY_DOT[notification.severity] || SEVERITY_DOT.INFO
  const isUnread = !notification.read

  const handleClick = () => {
    if (isUnread) onRead(notification.id)
  }

  return (
    <article
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`${isUnread ? 'Unread: ' : ''}${notification.message}`}
      className={`notif-card ${isUnread ? 'notif-card--unread' : ''}`}
    >
      <div className="notif-icon" style={{ background: `${meta.color}18`, color: meta.color }}>
        <span role="img" aria-label={meta.label}>{meta.icon}</span>
      </div>

      <div className="notif-body">
        <div className="notif-header">
          <span className="notif-type-pill" style={{ background: `${meta.color}15`, color: meta.color }}>
            {meta.label}
          </span>
          <time className="notif-time" dateTime={notification.createdAt}>
            {relativeTime(notification.createdAt)}
          </time>
        </div>
        <p className="notif-message">{notification.message}</p>
      </div>

      {isUnread && (
        <span className="notif-dot" aria-hidden="true" style={{ background: severityColor }} />
      )}
    </article>
  )
}

function EmptyState({ filtered }) {
  return (
    <div className="notif-empty">
      <div className="notif-empty-icon" role="img" aria-label="All caught up">
        {filtered ? '🔍' : '✅'}
      </div>
      <h3>{filtered ? 'No notifications in this category' : "You're all caught up!"}</h3>
      <p>{filtered ? 'Try another category above.' : 'All your alerts will appear here when they arrive.'}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { accessToken } = useAuth()
  const userId = accessToken ? decodeUserId(accessToken) : null

  // All notifications fetched once from backend (plain LIFO list)
  const [allNotifications, setAllNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    setIsLoading(true)
    fetchNotifications(userId)
      .then(data => {
        setAllNotifications(Array.isArray(data) ? data : [])
        setError('')
      })
      .catch(() => setError('Could not load notifications. Please try again.'))
      .finally(() => setIsLoading(false))
  }, [userId])

  const handleMarkRead = useCallback(async (id) => {
    setAllNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    try { await markNotificationRead(id) } catch { /* optimistic */ }
  }, [])

  const handleMarkAllRead = async () => {
    if (!userId) return
    setIsMarkingAll(true)
    setAllNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await markAllNotificationsRead(userId)
    } catch {
      setError('Failed to mark all as read.')
    } finally {
      setIsMarkingAll(false)
    }
  }

  const filtered = activeTab === 'ALL'
    ? allNotifications
    : allNotifications.filter(n => n.type === activeTab)

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const unreadCount = allNotifications.filter(n => !n.read).length

  return (
    <section className="notif-page" aria-labelledby="notif-title">
      {/* Header */}
      <div className="notif-page-header">
        <div>
          <h1 id="notif-title">
            Notification Center
            {unreadCount > 0 && (
              <span className="notif-badge" aria-label={`${unreadCount} unread`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </h1>
          <p className="notif-subtitle">Stay on top of everything happening in UniSpace Hub.</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleMarkAllRead}
          disabled={isMarkingAll || unreadCount === 0}
          aria-label="Mark all notifications as read"
        >
          {isMarkingAll ? 'Marking…' : '✓ Mark all as read'}
        </button>
      </div>

      {/* Tab bar */}
      <div className="notif-tabs" role="tablist" aria-label="Notification categories">
        {TABS.map(tab => {
          const meta = tab !== 'ALL' ? TYPE_META[tab] : null
          const count = tab === 'ALL'
            ? allNotifications.length
            : allNotifications.filter(n => n.type === tab).length
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`notif-tab ${activeTab === tab ? 'notif-tab--active' : ''}`}
              onClick={() => { setActiveTab(tab); setVisibleCount(PAGE_SIZE) }}
              style={activeTab === tab && meta ? { color: meta.color, borderColor: meta.color } : {}}
            >
              {meta ? `${meta.icon} ` : ''}{tab.charAt(0) + tab.slice(1).toLowerCase()}
              {count > 0 && <span className="notif-tab-count">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="notif-error" role="alert">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss error">×</button>
        </div>
      )}

      {/* List */}
      <div className="notif-list" role="feed" aria-busy={isLoading}>
        {filtered.length === 0 && !isLoading
          ? <EmptyState filtered={activeTab !== 'ALL'} />
          : visible.map(n => (
              <NotificationCard
                key={n.id}
                notification={n}
                onRead={handleMarkRead}
              />
            ))
        }

        {/* Spinner */}
        {isLoading && (
          <div className="notif-loading" aria-label="Loading notifications">
            <div className="notif-spinner" />
            <span>Loading notifications…</span>
          </div>
        )}

        {/* Load More button (client-side chunking) */}
        {!isLoading && hasMore && filtered.length > 0 && (
          <div className="notif-load-more">
            <button
              className="btn btn-secondary"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            >
              Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more notifications
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
