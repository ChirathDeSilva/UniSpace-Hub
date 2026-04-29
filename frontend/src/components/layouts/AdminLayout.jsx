import { NavLink, Outlet } from 'react-router-dom'
import Button from '../ui/Button'
import useAuth from '../../hooks/useAuth'

const adminNavItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/sla-dashboard', label: 'SLA Dashboard' },
  { to: '/admin/add-facility', label: 'Add Facility' },
  { to: '/admin/facility-list', label: 'Facility List' },
  { to: '/admin/ticket-handling', label: 'Ticket Handling' },
  { to: '/admin/booking-handling', label: 'Booking Handling' },
  { to: '/admin/logging-handling', label: 'Logging Handling' },
]

export default function AdminLayout() {
  const { signOut } = useAuth()

  return (
    <div className="admin-shell">
      <div className="container admin-layout">
        <aside className="admin-sidebar card" aria-label="Admin navigation">
          <div className="stack" style={{ gap: '0.35rem' }}>
            <p className="admin-kicker">Admin Console</p>
            <h2>Uni Space Hub</h2>
          </div>

          <nav className="admin-menu" aria-label="Admin pages">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) => `admin-menu-link${isActive ? ' is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Button variant="secondary" onClick={signOut}>
            Logout
          </Button>
        </aside>

        <main className="admin-main" aria-live="polite">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
