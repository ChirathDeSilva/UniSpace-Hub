import { Link, Outlet } from 'react-router-dom'
import Button from '../ui/Button'
import useAuth from '../../hooks/useAuth'

export default function DashboardLayout() {
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

      <main className="layout-body">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}