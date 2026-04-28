import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { login } from '../../services/authService'
import useAuth from '../../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Student')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isAuthenticated } = useAuth()

  // If already logged in, skip the login page entirely
  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  const from = location.state?.from || '/home'

  const handleRoleChange = (event) => {
    const nextRole = event.target.value
    setRole(nextRole)
    localStorage.setItem('ush_active_role', nextRole)
  }

  const handleLocalLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    localStorage.setItem('ush_active_role', role)
    try {
      const response = await login({ email, password }, role)
      if (response && response.jwtToken) {
        signIn({ accessToken: response.jwtToken })
        // Decode role from JWT payload to choose the correct landing page
        try {
          const payload = JSON.parse(atob(response.jwtToken.split('.')[1]))
          const userRole = payload.role || ''
          if (userRole === 'ROLE_ADMIN') {
            navigate('/admin', { replace: true })
          } else {
            navigate(from === '/' ? '/home' : from, { replace: true })
          }
        } catch {
          navigate(from, { replace: true })
        }
      }
    } catch (err) {
      const errData = err.response?.data
      setError(typeof errData === 'string' ? errData : 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = (provider) => {
    setIsLoading(true)
    window.location.href = `http://localhost:8081/api/auth/${provider}/login`
  }

  return (
    <section className="card stack reveal" aria-labelledby="login-title" style={{ maxWidth: '400px', margin: '0 auto', marginTop: 'var(--space-12)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
        {/* Placeholder for Logo */}
        <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-primary-soft)', borderRadius: '50%', margin: '0 auto var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold' }}>
          USH
        </div>
        <h1 id="login-title">Welcome Back</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Sign in to UniSpace Hub</p>
      </div>

      {error && <div style={{ color: 'var(--color-error)', backgroundColor: '#ffebee', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleLocalLogin} className="stack">
        <div className="stack" style={{ gap: 'var(--space-2)' }}>
          <label htmlFor="role">I am a...</label>
          <select id="role" value={role} onChange={handleRoleChange} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
            <option value="Student">Student</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Admin">Admin</option>
            <option value="Technician">Technician</option>
          </select>
        </div>

        <div className="stack" style={{ gap: 'var(--space-2)' }}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
        </div>

        <div className="stack" style={{ gap: 'var(--space-2)' }}>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
        </div>

        <Button type="submit" disabled={isLoading} style={{ width: '100%', justifyContent: 'center' }}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-4) 0' }}>
        <hr style={{ flex: 1, borderColor: 'var(--color-border)' }} />
        <span style={{ padding: '0 var(--space-2)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>OR</span>
        <hr style={{ flex: 1, borderColor: 'var(--color-border)' }} />
      </div>

      <div className="stack">
        <Button variant="secondary" onClick={() => handleOAuthLogin('google')} disabled={isLoading} style={{ width: '100%', justifyContent: 'center', backgroundColor: '#fff', color: '#757575', border: '1px solid #d9e2ec' }}>
          <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '16px', height: '16px', marginRight: 'var(--space-2)' }} />
          Continue with Google
        </Button>
        <Button variant="secondary" onClick={() => handleOAuthLogin('microsoft')} disabled={isLoading} style={{ width: '100%', justifyContent: 'center', backgroundColor: '#fff', color: '#757575', border: '1px solid #d9e2ec' }}>
          <img src="https://c.s-microsoft.com/favicon.ico?v2" alt="Microsoft" style={{ width: '16px', height: '16px', marginRight: 'var(--space-2)' }} />
          Continue with Microsoft
        </Button>
      </div>

    </section>
  )
}
