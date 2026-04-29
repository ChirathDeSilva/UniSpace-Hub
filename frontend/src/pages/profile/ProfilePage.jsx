import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getProfile, updateProfile, getRecentBookings } from '../../services/profileService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function decodeRole(token) {
  try { return JSON.parse(atob(token.split('.')[1])).role || '' } catch { return '' }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }) {
  const map = {
    APPROVED:  { bg: '#dcfce7', color: '#166534', label: 'Approved' },
    PENDING:   { bg: '#fef9c3', color: '#713f12', label: 'Pending'  },
    REJECTED:  { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    CANCELLED: { bg: '#f3f4f6', color: '#374151', label: 'Cancelled'},
  }
  const s = map[status] || { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: 700,
    }}>{s.label}</span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ src, name, size = 96 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return src ? (
    <img
      src={src} alt={name}
      className="profile-avatar"
      style={{ width: size, height: size }}
    />
  ) : (
    <div className="profile-avatar profile-avatar--initials" style={{ width: size, height: size, fontSize: size * 0.33 }}>
      {initials}
    </div>
  )
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="profile-info-row">
      <span className="profile-info-icon" aria-hidden="true">{icon}</span>
      <div>
        <span className="profile-info-label">{label}</span>
        <span className="profile-info-value">{value}</span>
      </div>
    </div>
  )
}

// ─── Edit Form Field ──────────────────────────────────────────────────────────

function FormField({ id, label, type = 'text', value, onChange, placeholder, min, max }) {
  return (
    <div className="profile-field">
      <label htmlFor={id}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={id} value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
        />
      ) : (
        <input
          id={id} type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} min={min} max={max}
        />
      )}
    </div>
  )
}

// ─── Student Profile ──────────────────────────────────────────────────────────

function StudentProfile({ profile, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      contactNumber: profile.contactNumber || '',
      bio:           profile.bio           || '',
      department:    profile.department    || '',
      studentId:     profile.studentId     || '',
      degreeProgram: profile.degreeProgram || '',
      currentSemester: profile.currentSemester || '',
    })
    getRecentBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setBookingsLoading(false))
  }, [profile])

  const field = (key) => ({
    value: form[key],
    onChange: v => setForm(p => ({ ...p, [key]: v })),
  })

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await updateProfile({
        ...form,
        currentSemester: form.currentSemester ? Number(form.currentSemester) : null,
      })
      setEditing(false)
      onSaved()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-page" aria-labelledby="profile-title">
      {/* ── Header card ── */}
      <div className="profile-header card">
        <Avatar src={profile.pictureUrl} name={profile.fullName} size={96} />
        <div className="profile-header-info">
          <div className="profile-header-top">
            <h1 id="profile-title">{profile.fullName || 'Student'}</h1>
            <span className="profile-role-badge profile-role-badge--student">🎓 Student</span>
          </div>
          {profile.studentId && <p className="profile-id">ID: {profile.studentId}</p>}
          {profile.degreeProgram && <p className="profile-degree">{profile.degreeProgram}</p>}
          {profile.department && <p className="profile-dept">📍 {profile.department}</p>}
        </div>
        <button
          className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setEditing(e => !e)}
          style={{ alignSelf: 'flex-start', marginLeft: 'auto' }}
        >
          {editing ? '✕ Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      {/* ── Edit form ── */}
      {editing && (
        <div className="card profile-edit-card">
          <h2>Edit Profile</h2>
          {error && <div className="profile-error">{error}</div>}
          <div className="profile-form-grid">
            <FormField id="studentId"     label="Student ID"        {...field('studentId')}     placeholder="IT21234567" />
            <FormField id="degreeProgram" label="Degree Programme"  {...field('degreeProgram')} placeholder="BSc Computer Science" />
            <FormField id="department"    label="Department"        {...field('department')}    placeholder="Faculty of Computing" />
            <FormField id="semester"      label="Current Semester"  type="number" {...field('currentSemester')} placeholder="1–8" min={1} max={8} />
            <FormField id="contact"       label="Contact Number"    type="tel"    {...field('contactNumber')} placeholder="+94 77 123 4567" />
          </div>
          <FormField id="bio" label="Bio" type="textarea" {...field('bio')} placeholder="Tell others a bit about yourself…" />
          <div className="profile-form-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div className="profile-two-col">
        {/* ── Academic Info ── */}
        <div className="card profile-card">
          <h2 className="profile-card-title">🎓 Academic Info</h2>
          <div className="profile-info-list">
            <InfoRow icon="🪪" label="Student ID"       value={profile.studentId} />
            <InfoRow icon="📚" label="Programme"        value={profile.degreeProgram} />
            <InfoRow icon="🏛️" label="Department"       value={profile.department} />
            <InfoRow icon="📅" label="Current Semester" value={profile.currentSemester ? `Semester ${profile.currentSemester}` : null} />
            <InfoRow icon="📞" label="Contact"          value={profile.contactNumber} />
            <InfoRow icon="✉️" label="Primary Email"    value={profile.email} />
            <InfoRow icon="🪟" label="Microsoft Account" value={profile.microsoftEmail} />
            <InfoRow icon="🗓️" label="Member Since"     value={formatDate(profile.createdAt)} />
          </div>
          {profile.bio && (
            <div className="profile-bio">
              <span className="profile-info-label">About</span>
              <p>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* ── Quick Links ── */}
        <div className="card profile-card">
          <h2 className="profile-card-title">⚡ Quick Links</h2>
          <div className="profile-quick-links">
            <Link to="/booking" className="btn btn-primary profile-quick-btn">
              📅 Make a Booking
            </Link>
            <Link to="/notifications" className="btn btn-secondary profile-quick-btn">
              🔔 Notifications
            </Link>
            <Link to="/ticketing" className="btn btn-secondary profile-quick-btn">
              🎫 My Tickets
            </Link>
          </div>
        </div>
      </div>

      {/* ── Space Usage Summary ── */}
      <div className="card">
        <h2 className="profile-card-title">📊 Space Usage Summary</h2>
        <p className="profile-subtitle">Your 5 most recent room bookings</p>

        {bookingsLoading ? (
          <div className="profile-loading"><div className="notif-spinner" /> Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="profile-empty-state">
            <span>📭</span>
            <p>No bookings yet. <Link to="/booking">Make your first booking →</Link></p>
          </div>
        ) : (
          <div className="profile-bookings-list">
            {bookings.map(b => (
              <div key={b.id} className="profile-booking-row">
                <div className="profile-booking-icon">🏛️</div>
                <div className="profile-booking-info">
                  <p className="profile-booking-facility">{b.facilityName}</p>
                  <p className="profile-booking-meta">
                    {formatDate(b.bookingDate)} · {b.startTime?.slice(0,5)}–{b.endTime?.slice(0,5)}
                  </p>
                  {b.purpose && <p className="profile-booking-purpose">{b.purpose}</p>}
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Lecturer Profile ─────────────────────────────────────────────────────────

function LecturerProfile({ profile, onSaved }) {
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({})
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    setForm({
      title:             profile.title             || '',
      contactNumber:     profile.contactNumber     || '',
      bio:               profile.bio               || '',
      department:        profile.department        || '',
      researchInterests: profile.researchInterests || '',
      officeRoomNumber:  profile.officeRoomNumber  || '',
      modules:           profile.modules           || '',
    })
  }, [profile])

  const field = (key) => ({
    value: form[key],
    onChange: v => setForm(p => ({ ...p, [key]: v })),
  })

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await updateProfile(form)
      setEditing(false)
      onSaved()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const moduleList = (profile.modules || '').split(',').map(m => m.trim()).filter(Boolean)

  const displayName = [profile.title, profile.fullName].filter(Boolean).join(' ') || 'Lecturer'

  return (
    <div className="profile-page" aria-labelledby="profile-title">
      {/* ── Header card ── */}
      <div className="profile-header card profile-header--lecturer">
        <Avatar src={profile.pictureUrl} name={profile.fullName} size={96} />
        <div className="profile-header-info">
          <div className="profile-header-top">
            <h1 id="profile-title">{displayName}</h1>
            <span className="profile-role-badge profile-role-badge--lecturer">🏫 Lecturer</span>
          </div>
          {profile.department && <p className="profile-dept">📍 {profile.department}</p>}
          {profile.officeRoomNumber && <p className="profile-office">🚪 {profile.officeRoomNumber}</p>}

          {/* Verified Faculty Badge */}
          <div className="profile-verified-badge" aria-label="Verified Faculty Member">
            <span>✅</span>
            <span>Verified Faculty Member</span>
          </div>
        </div>
        <button
          className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setEditing(e => !e)}
          style={{ alignSelf: 'flex-start', marginLeft: 'auto' }}
        >
          {editing ? '✕ Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      {/* ── Edit form ── */}
      {editing && (
        <div className="card profile-edit-card">
          <h2>Edit Profile</h2>
          {error && <div className="profile-error">{error}</div>}
          <div className="profile-form-grid">
            <FormField id="title"      label="Title"           {...field('title')}      placeholder="Dr. / Prof. / Mr. / Ms." />
            <FormField id="department" label="Department"      {...field('department')} placeholder="Faculty of Computing" />
            <FormField id="office"     label="Office Room"     {...field('officeRoomNumber')} placeholder="Block A – Room 204" />
            <FormField id="contact"    label="Contact Number"  type="tel" {...field('contactNumber')} placeholder="+94 77 123 4567" />
          </div>
          <FormField id="modules" label="Modules Taught (comma-separated)" type="textarea"
            {...field('modules')} placeholder="Software Engineering, Database Systems, Algorithms" />
          <FormField id="research" label="Research Interests" type="textarea"
            {...field('researchInterests')} placeholder="Machine Learning, Distributed Systems…" />
          <FormField id="bio" label="Professional Bio" type="textarea"
            {...field('bio')} placeholder="Brief professional summary…" />
          <div className="profile-form-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div className="profile-two-col">
        {/* ── Credentials card ── */}
        <div className="card profile-card">
          <h2 className="profile-card-title">🎓 Credentials</h2>
          <div className="profile-info-list">
            <InfoRow icon="👤" label="Full Name"          value={displayName} />
            <InfoRow icon="🏛️" label="Department"         value={profile.department} />
            <InfoRow icon="🚪" label="Office Room"        value={profile.officeRoomNumber} />
            <InfoRow icon="📞" label="Contact"            value={profile.contactNumber} />
            <InfoRow icon="✉️" label="Primary Email"      value={profile.email} />
            <InfoRow icon="🪟" label="Microsoft Account"  value={profile.microsoftEmail} />
            <InfoRow icon="🗓️" label="Member Since"       value={formatDate(profile.createdAt)} />
          </div>
          {profile.bio && (
            <div className="profile-bio">
              <span className="profile-info-label">Professional Bio</span>
              <p>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* ── Research interests ── */}
        {profile.researchInterests && (
          <div className="card profile-card">
            <h2 className="profile-card-title">🔬 Research Interests</h2>
            <div className="profile-tags">
              {profile.researchInterests.split(',').map(r => r.trim()).filter(Boolean).map(r => (
                <span key={r} className="profile-tag">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Teaching Load ── */}
      <div className="card">
        <h2 className="profile-card-title">📖 Teaching Load</h2>
        <p className="profile-subtitle">Modules currently being taught</p>
        {moduleList.length === 0 ? (
          <div className="profile-empty-state">
            <span>📋</span>
            <p>No modules added yet. Edit your profile to add them.</p>
          </div>
        ) : (
          <div className="profile-module-list">
            {moduleList.map((mod, i) => (
              <div key={i} className="profile-module-row">
                <div className="profile-module-icon">📗</div>
                <div>
                  <p className="profile-module-name">{mod}</p>
                  <p className="profile-module-meta">Module {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Loading / Error states ───────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="profile-page">
      <div className="card profile-header">
        <div className="profile-skeleton profile-skeleton--avatar" />
        <div style={{ flex: 1, display: 'grid', gap: '0.5rem' }}>
          <div className="profile-skeleton" style={{ width: '60%', height: '1.5rem' }} />
          <div className="profile-skeleton" style={{ width: '40%', height: '1rem' }} />
          <div className="profile-skeleton" style={{ width: '30%', height: '1rem' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { accessToken } = useAuth()
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const role = accessToken ? decodeRole(accessToken) : ''

  const load = () => {
    setLoading(true)
    getProfile()
      .then(setProfile)
      .catch(() => setError('Could not load your profile. Please try again.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [accessToken])

  if (loading) return <ProfileSkeleton />
  if (error)   return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <p style={{ color: 'var(--color-error)' }}>⚠️ {error}</p>
      <button className="btn btn-secondary" onClick={load} style={{ marginTop: '1rem' }}>Retry</button>
    </div>
  )
  if (!profile) return null

  if (role === 'ROLE_LECTURER') return <LecturerProfile profile={profile} onSaved={load} />
  if (role === 'ROLE_STUDENT')  return <StudentProfile  profile={profile} onSaved={load} />

  // Fallback for Admin / Technician — simple card
  return (
    <div className="profile-page">
      <div className="profile-header card">
        <Avatar src={profile.pictureUrl} name={profile.fullName} size={80} />
        <div className="profile-header-info">
          <h1 id="profile-title">{profile.fullName}</h1>
          <p className="profile-dept">{profile.role?.replace('ROLE_', '') || 'User'}</p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{profile.email}</p>
        </div>
      </div>
    </div>
  )
}
