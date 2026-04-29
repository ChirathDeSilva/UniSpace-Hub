import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { studentLogin, lecturerLogin } from '../../services/authService'

// ─── Shared field component ────────────────────────────────────────────────────

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

// ─── OAuth button ──────────────────────────────────────────────────────────────

function OAuthButton({ provider, label, iconSrc, disabled, onClick }) {
  return (
    <button
      type="button"
      className="login-oauth-btn"
      disabled={disabled}
      onClick={onClick}
      aria-label={`Sign in with ${label}`}
    >
      <img src={iconSrc} alt="" aria-hidden="true" width={18} height={18} />
      <span>Continue with {label}</span>
    </button>
  )
}

// ─── Main Login Page ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()

  const [tab,      setTab]      = useState('student')   // 'student' | 'lecturer'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // Already logged in → redirect to home
  if (isAuthenticated) return <Navigate to="/home" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fn = tab === 'student' ? studentLogin : lecturerLogin
      const data = await fn({ email, password })
      if (data?.token) {
        signIn({ accessToken: data.token })
        navigate('/home', { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data
      setError(typeof msg === 'string' ? msg : 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = (provider) => {
    setLoading(true)
    window.location.href = `http://localhost:8081/api/auth/${provider}/login`
  }

  return (
    <div className="login-page">
      {/* ── Brand panel ── */}
      <div className="login-brand-panel">
        <div className="login-brand-inner">
          <div className="login-logo-mark" aria-hidden="true">U</div>
          <h1 className="login-brand-name">UniSpace Hub</h1>
          <p className="login-brand-tagline">
            Your all-in-one portal for facility booking,<br />
            ticketing, and campus resources.
          </p>

          <div className="login-brand-features">
            <div className="login-feature">
              <span>📅</span>
              <span>Book labs &amp; lecture rooms instantly</span>
            </div>
            <div className="login-feature">
              <span>🎫</span>
              <span>Submit and track support tickets</span>
            </div>
            <div className="login-feature">
              <span>🔔</span>
              <span>Real-time notifications &amp; alerts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="login-form-panel">
        <div className="login-form-inner">
          {/* Logo placeholder (mobile + form panel) */}
          <div className="login-form-logo" aria-hidden="true">U</div>
          <h2 className="login-form-title">Welcome back</h2>
          <p className="login-form-subtitle">Sign in to your UniSpace Hub account</p>

          {/* ── Role tabs ── */}
          <div className="login-tabs" role="tablist" aria-label="Account type">
            <button
              role="tab"
              aria-selected={tab === 'student'}
              className={`login-tab ${tab === 'student' ? 'login-tab--active' : ''}`}
              onClick={() => { setTab('student'); setError('') }}
              type="button"
            >
              🎓 Student
            </button>
            <button
              role="tab"
              aria-selected={tab === 'lecturer'}
              className={`login-tab ${tab === 'lecturer' ? 'login-tab--active' : ''}`}
              onClick={() => { setTab('lecturer'); setError('') }}
              type="button"
            >
              🏫 Lecturer
            </button>
          </div>

          {/* ── OAuth buttons ── */}
          <div className="login-oauth-group">
            <OAuthButton
              provider="google"
              label="Google"
              iconSrc="https://www.google.com/favicon.ico"
              disabled={loading}
              onClick={() => handleOAuth('google')}
            />
            <OAuthButton
              provider="microsoft"
              label="Microsoft"
              iconSrc="https://c.s-microsoft.com/favicon.ico?v2"
              disabled={loading}
              onClick={() => handleOAuth('microsoft')}
            />
          </div>

          {/* ── Divider ── */}
          <div className="login-divider" aria-hidden="true">
            <span>or sign in with email</span>
          </div>

          {/* ── Credential form ── */}
          {error && (
            <div className="login-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <Field
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={tab === 'student' ? 'student@university.edu' : 'lecturer@university.edu'}
              autoComplete="email"
            />
            <Field
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading
                ? <><span className="login-spinner" aria-hidden="true" /> Signing in…</>
                : `Sign in as ${tab === 'student' ? 'Student' : 'Lecturer'}`
              }
            </button>
          </form>

          {/* ── Staff login footer link ── */}
          <div className="login-staff-link">
            <span>University staff?</span>
            <Link to="/staff-login">Staff Login →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
