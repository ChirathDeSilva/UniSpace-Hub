import { Link, Outlet } from 'react-router-dom'

export default function PublicLayout() {
  const year = new Date().getFullYear()

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="container app-navbar-inner">
          <Link to="/" className="brand">
            Uni Space Hub
          </Link>
          <nav className="app-nav" aria-label="Primary">
            <Link to="/">Home</Link>
            <Link to="/ticketing">Ticketing</Link>
            <Link to="/booking">Booking</Link>
            <Link to="/contact-us">Contact Us</Link>
            <Link to="/about-us">About Us</Link>
          </nav>
          <div className="app-nav-actions" aria-label="User actions">
            <button type="button" className="icon-button" aria-label="Notifications">
              N
            </button>
            <button type="button" className="icon-button" aria-label="User profile">
              U
            </button>
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
          <p>Uni Space Hub</p>
          <p>Copyright {year}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}