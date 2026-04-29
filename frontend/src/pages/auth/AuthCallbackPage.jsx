import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (token) {
      signIn({ accessToken: token })
      navigate('/home', { replace: true })
    } else if (error) {
      navigate('/?error=access_denied', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [searchParams, navigate, signIn])

  return (
    <section className="card stack reveal" style={{ maxWidth: '400px', margin: '0 auto', marginTop: 'var(--space-12)', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto var(--space-4)', width: '40px', height: '40px', border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <h2>Processing your login...</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>Please wait a moment while we securely authenticate you.</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}
