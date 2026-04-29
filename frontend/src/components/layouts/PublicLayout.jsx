import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { fetchUnreadCount } from '../../services/notificationService'

const primaryNavItems = [
  { to: '/home', label: 'Home' },
  { to: '/facility-portal', label: 'Facility Portal' },
  { to: '/ticketing', label: 'Tickets' },
  { to: '/booking', label: 'Facility Booking' },
  { to: '/contact-us', label: 'Contact Us' },
  { to: '/about-us', label: 'About Us' },
]

function decodeUserId(token) {
  try { return JSON.parse(atob(token.split('.')[1])).sub } catch { return null }
}

export default function PublicLayout() {
  const year = new Date().getFullYear()
  const { isAuthenticated, accessToken, signOut } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  // Poll unread count every 60s while logged in
  useEffect(() => {
    if (!isAuthenticated || !accessToken) { setUnreadCount(0); return }
    const userId = decodeUserId(accessToken)
    if (!userId) return

    let cancelled = false
    const load = () =>
      fetchUnreadCount(userId)
        .then(n => { if (!cancelled) setUnreadCount(Number(n) || 0) })
        .catch(() => {})

    load()
    const timer = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [isAuthenticated, accessToken])

  const handleSignOut = () => {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-navbar app-navbar-public">
        <div className="container app-navbar-inner">
          <NavLink to="/home" className="brand">
            <span className="brand-mark" aria-hidden="true">U</span>
            <span>Uni Space Hub</span>
          </NavLink>

          <nav className="app-nav" aria-label="Primary">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-nav-actions" aria-label="Quick actions">
            {/* Bell icon — links to /notifications with live unread badge */}
            <NavLink
              to="/notifications"
              className={({ isActive }) => `icon-link${isActive ? ' is-active' : ''}`}
              aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
              style={{ position: 'relative' }}
            >
              <span aria-hidden="true">🔔</span>
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'linear-gradient(130deg, #e53e3e, #fc8181)',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    minWidth: '1.1rem',
                    height: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '1.5px solid #fff',
                    lineHeight: 1,
                    boxShadow: '0 2px 6px rgba(220,38,38,0.4)',
                    animation: 'badgePop 0.3s var(--ease-standard)',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) => `icon-link${isActive ? ' is-active' : ''}`}
              aria-label="Profile"
            >
              <span aria-hidden="true">👤</span>
            </NavLink>

            {/* Sign out (only when logged in) */}
            {isAuthenticated && (
              <button
                onClick={handleSignOut}
                className="icon-button"
                aria-label="Sign out"
                title="Sign out"
                style={{ fontSize: '1rem', cursor: 'pointer' }}
              >
                ↩
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="layout-body">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="app-footer">
        <div className="container app-footer-inner">
          <div className="app-footer-brand stack">
            <p className="footer-logo">Uni Space Hub</p>
            <p className="footer-copy">One place for portal access, ticketing, and booking.</p>
          </div>

          <nav className="app-footer-links" aria-label="Footer quick links">
            {primaryNavItems.map((item) => (
              <NavLink key={`footer-${item.to}`} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <p className="footer-copyright">Copyright {year} Uni Space Hub</p>
        </div>
      </footer>
    </div>
  )
}