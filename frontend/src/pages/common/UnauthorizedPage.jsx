import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function UnauthorizedPage() {
  return (
    <section className="card stack reveal" style={{ maxWidth: '600px', margin: '0 auto', marginTop: 'var(--space-12)', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--color-error)' }}>Access Denied (403)</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
        Oops! It looks like you don't have permission to view the Admin Dashboard. Please contact your coordinator if you think this is a mistake.
      </p>
      <Link to="/" style={{ display: 'inline-block' }}>
        <Button>Back to Home</Button>
      </Link>
    </section>
  )
}