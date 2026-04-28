import { NavLink, Outlet } from 'react-router-dom'

const primaryNavItems = [
  { to: '/', label: 'Home' },
  { to: '/facility-portal', label: 'Facility Portal' },
  { to: '/user/tickets', label: 'Tickets' },
  { to: '/booking', label: 'Facility Booking' },
  { to: '/contact-us', label: 'Contact Us' },
  { to: '/about-us', label: 'About Us' },
]

export default function PublicLayout() {
  const year = new Date().getFullYear()

  return (
    <div className="app-shell">
      <header className="app-navbar app-navbar-public">
        <div className="container app-navbar-inner">
          <NavLink to="/" className="brand" end>
            <span className="brand-mark" aria-hidden="true">
              U
            </span>
            <span>Uni Space Hub</span>
          </NavLink>

          <nav className="app-nav" aria-label="Primary">
            {primaryNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-nav-actions" aria-label="Quick actions">
            <NavLink
              to="/notifications"
              className={({ isActive }) => `icon-link${isActive ? ' is-active' : ''}`}
              aria-label="Notifications"
            >
              <span aria-hidden="true">🔔</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `icon-link${isActive ? ' is-active' : ''}`}
              aria-label="Profile"
            >
              <span aria-hidden="true">👤</span>
            </NavLink>
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
              <NavLink key={`footer-${item.to}`} to={item.to} end={item.to === '/'}>
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