import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function UnauthorizedPage() {
  return (
    <section className="stack reveal" style={{ justifyItems: 'start' }}>
      <h1>Unauthorized</h1>
      <p>You do not have permission to view this page.</p>
      <Link to="/login">
        <Button>Go to login</Button>
      </Link>
    </section>
  )
}