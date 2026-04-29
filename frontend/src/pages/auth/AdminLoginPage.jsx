import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { adminLogin } from '../../services/authService'

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

export default function AdminLoginPage() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [loginDone,   setLoginDone]   = useState(false)

  // Navigate only AFTER React has committed the new auth state.
  // Calling navigate() immediately after signIn() is a race — isAuthenticated
  // is still false on the first AdminRoute render and bounces back.
  useEffect(() => {
    if (loginDone && isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [loginDone, isAuthenticated, navigate])

  // Already authenticated admin → skip to dashboard
  if (isAuthenticated) return <Navigate to="/admin" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await adminLogin({ email, password })
      if (data?.token) {
        signIn({ accessToken: data.token })
        setLoginDone(true)   // useEffect will navigate once isAuthenticated flips to true
      }
    } catch (err) {
      const msg = err.response?.data
      setError(typeof msg === 'string' ? msg : 'Authentication failed. Verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        {/* ── Secure header ── */}
        <div className="admin-login-header">
          <div className="admin-login-shield" aria-hidden="true">🛡️</div>
          <div>
            <h1 className="admin-login-title">Administration</h1>
            <p className="admin-login-subtitle">UniSpace Hub — Secure Access</p>
          </div>
        </div>

        {/* ── Security notice ── */}
        <div className="admin-login-notice">
          <span>🔒</span>
          <span>This area is restricted to authorized administrators only. Unauthorized access attempts are logged.</span>
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
            id="admin-email"
            label="Administrator Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="admin@university.edu"
            autoComplete="email"
          />
          <Field
            id="admin-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="login-submit-btn login-submit-btn--admin"
            disabled={loading}
          >
            {loading
              ? <><span className="login-spinner" aria-hidden="true" /> Authenticating…</>
              : '🛡️ Secure Sign In'
            }
          </button>
        </form>

        {/* ── Footer — no back link (this page is intentionally hidden) ── */}
        <p className="admin-login-footer">
          Access to this system is monitored. All actions are logged for security purposes.
        </p>

      </div>
    </div>
  )
}
