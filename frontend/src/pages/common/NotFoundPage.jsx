import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="stack reveal" style={{ justifyItems: 'start' }}>
      <h1>Page not found</h1>
      <p>The page you are trying to open does not exist.</p>
      <Link to="/">
        <Button>Go to home</Button>
      </Link>
    </section>
  )
}