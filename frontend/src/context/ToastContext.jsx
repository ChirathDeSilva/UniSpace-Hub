import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timerRef = useRef({})

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timerRef.current[id])
    delete timerRef.current[id]
  }, [])

  const addToast = useCallback(({ message, severity = 'INFO', type = 'SYSTEM' }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [{ id, message, severity, type }, ...prev].slice(0, 5))
    timerRef.current[id] = setTimeout(() => dismiss(id), 5000)
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ addToast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const SEVERITY_STYLES = {
  INFO:    { bar: '#0056d2', icon: 'ℹ️', bg: '#f0f7ff' },
  SUCCESS: { bar: '#16a34a', icon: '✅', bg: '#f0fdf4' },
  WARNING: { bar: '#d97706', icon: '⚠️', bg: '#fffbeb' },
  ERROR:   { bar: '#dc2626', icon: '❌', bg: '#fff1f2' },
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div style={{
      position: 'fixed', top: '1.25rem', right: '1.25rem',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.6rem',
      maxWidth: '360px', width: '100%',
    }}>
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  const s = SEVERITY_STYLES[toast.severity] || SEVERITY_STYLES.INFO
  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.bar}33`,
      borderLeft: `4px solid ${s.bar}`,
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      padding: '0.85rem 1rem',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      animation: 'toastSlideIn 0.25s cubic-bezier(0.2,0.8,0.2,1)',
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>{s.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#1a2e4a', fontWeight: 600, lineHeight: 1.4, wordBreak: 'break-word' }}>
          {toast.message}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
          {toast.type.charAt(0) + toast.type.slice(1).toLowerCase()} alert
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', padding: 0, flexShrink: 0, lineHeight: 1 }}
      >×</button>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
