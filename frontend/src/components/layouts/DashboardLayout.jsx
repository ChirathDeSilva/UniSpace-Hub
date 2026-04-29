import { Link, Outlet } from 'react-router-dom'
import Button from '../ui/Button'
import useAuth from '../../hooks/useAuth'

export default function DashboardLayout({ title, noPadding = false, children }) {
  const { signOut } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="container app-navbar-inner">
          <Link to="/dashboard" className="brand">
            Uni Space Hub
          </Link>
          <div className="cluster">
            <Link to="/dashboard">Dashboard</Link>
            <Button variant="secondary" onClick={signOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className={`layout-body ${noPadding ? 'no-padding' : ''}`}>
        {title && <h1 className="page-title">{title}</h1>}
        <div className={noPadding ? '' : 'container'}>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  )
}