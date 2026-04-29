import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { technicianLogin } from '../../services/authService'

function Field({ id, label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div className="login-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </div>
  )
}

export default function TechnicianLoginPage() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [loginDone, setLoginDone] = useState(false)

  // Wait for isAuthenticated to be committed before navigating
  useEffect(() => {
    if (loginDone && isAuthenticated) {
      navigate('/technician/tickets', { replace: true })
    }
  }, [loginDone, isAuthenticated, navigate])

  if (isAuthenticated) return <Navigate to="/technician/tickets" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await technicianLogin({ email, password })
      if (data?.token) {
        signIn({ accessToken: data.token })
        setLoginDone(true)   // useEffect will navigate once isAuthenticated flips to true
      }
    } catch (err) {
      const msg = err.response?.data
      setError(typeof msg === 'string' ? msg : 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="staff-login-page">
      <div className="staff-login-card">

        {/* ── Header ── */}
        <div className="staff-login-header">
          <div className="staff-login-icon" aria-hidden="true">🔧</div>
          <div>
            <h1 className="staff-login-title">Technician Portal</h1>
            <p className="staff-login-subtitle">UniSpace Hub — Staff Access</p>
          </div>
        </div>

        {/* ── Badge ── */}
        <div className="staff-login-badge">
          <span>🏫</span>
          <span>Restricted — Authorized Technicians Only</span>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="login-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <Field
            id="tech-email"
            label="Staff Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="technician@university.edu"
            autoComplete="email"
          />
          <Field
            id="tech-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="login-submit-btn login-submit-btn--staff"
            disabled={loading}
          >
            {loading
              ? <><span className="login-spinner" aria-hidden="true" /> Signing in…</>
              : '🔧 Sign in to Technician Portal'
            }
          </button>
        </form>

        {/* ── Back link ── */}
        <div className="staff-login-back">
          <Link to="/">← Back to Student / Lecturer Login</Link>
        </div>

      </div>
    </div>
  )
}
