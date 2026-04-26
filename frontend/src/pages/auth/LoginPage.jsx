import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function LoginPage() {
  return (
    <section className="card stack reveal" aria-labelledby="login-title">
      <h1 id="login-title">Login</h1>
      <p>This is a blank Login page for testing.</p>
      <div className="cluster">
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
        <Link to="/admin">
          <Button>Go to Admin</Button>
        </Link>
      </div>
    </section>
  )
}
