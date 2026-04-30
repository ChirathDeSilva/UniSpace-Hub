import { useState, useEffect } from 'react'
import httpClient from '../../api/httpClient'
import Button from '../../components/ui/Button'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'ROLE_STUDENT',
    contactNumber: '',
    bio: '',
    department: '',
    studentId: '',
    degreeProgram: '',
    currentSemester: 1,
    title: '',
    researchInterests: '',
    officeRoomNumber: '',
    modules: '',
  })

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await httpClient.get('/api/v1/admin/users')
      setUsers(res.data)
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to load users. Ensure you have admin privileges.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleRoleChange = async (userId, newRole) => {
    try {
      await httpClient.put(`/api/v1/admin/users/${userId}/role`, { newRole })
      fetchUsers() // Refresh the list
    } catch (err) {
      console.error(err)
      alert('Failed to change user role.')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to completely remove this user? This action cannot be undone.')) return
    try {
      await httpClient.delete(`/api/v1/admin/users/${userId}`)
      fetchUsers() // Refresh the list
    } catch (err) {
      console.error(err)
      alert('Failed to delete user.')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateError('')

    if (!newUserForm.email || !newUserForm.fullName || !newUserForm.role) {
      setCreateError('Email, Full Name, and Role are required.')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUserForm.email)) {
      setCreateError('Please enter a valid email address.')
      return
    }

    // Password validation for Admin/Technician
    if ((newUserForm.role === 'ROLE_ADMIN' || newUserForm.role === 'ROLE_TECHNICIAN') && !newUserForm.password) {
      setCreateError('Password is required for Admin and Technician roles.')
      return
    }

    try {
      setIsCreating(true)
      await httpClient.post('/api/v1/admin/users', newUserForm)
      
      // Reset form and refresh
      setNewUserForm({
        email: '',
        fullName: '',
        password: '',
        role: 'ROLE_STUDENT',
        contactNumber: '',
        bio: '',
        department: '',
        studentId: '',
        degreeProgram: '',
        currentSemester: 1,
        title: '',
        researchInterests: '',
        officeRoomNumber: '',
        modules: '',
      })
      setShowCreateForm(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      const errorMsg = err?.response?.data || 'Failed to create user.'
      setCreateError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg))
    } finally {
      setIsCreating(false)
    }
  }

  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'ROLE_ADMIN': return { backgroundColor: '#e8eaf6', color: '#3f51b5', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' } 
      case 'ROLE_STUDENT': return { backgroundColor: '#e3f2fd', color: '#0056d2', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' } 
      case 'ROLE_LECTURER': return { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' } 
      case 'ROLE_TECHNICIAN': return { backgroundColor: '#fff3e0', color: '#e65100', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' } 
      default: return { backgroundColor: '#f5f5f5', color: '#616161', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }
    }
  }

  const roleOptions = ['ROLE_STUDENT', 'ROLE_LECTURER', 'ROLE_TECHNICIAN', 'ROLE_ADMIN']

  return (
    <section className="card stack reveal" aria-labelledby="admin-users-title" style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <div className="cluster" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 id="admin-users-title">User Management Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>View and manage platform users, assign roles, and handle access.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search by email or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', width: '250px' }}
          />
          <Button onClick={() => setShowCreateForm(true)} style={{ whiteSpace: 'nowrap' }}>
            + Add User
          </Button>
        </div>
      </div>

      {/* Create User Form Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '2rem 0'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-6)',
            maxWidth: '700px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginBottom: 'var(--space-4)', marginTop: 0 }}>Add New User</h2>
            
            {createError && (
              <div style={{
                color: 'var(--color-error)',
                backgroundColor: '#ffebee',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
                fontSize: '0.9rem',
              }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="user@example.com"
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    placeholder="John Doe"
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                    Password {(newUserForm.role === 'ROLE_ADMIN' || newUserForm.role === 'ROLE_TECHNICIAN') ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="password"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                    Role *
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                  >
                    {roleOptions.map(r => (
                      <option key={r} value={r}>{r.replace('ROLE_', '')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={newUserForm.contactNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, contactNumber: e.target.value })}
                    placeholder="+94 77 123 4567"
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    placeholder="Computing / Engineering"
                    style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                  Bio
                </label>
                <textarea
                  value={newUserForm.bio}
                  onChange={(e) => setNewUserForm({ ...newUserForm, bio: e.target.value })}
                  placeholder="Short personal/professional bio..."
                  style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box', minHeight: '80px' }}
                />
              </div>

              {/* Role Specific Fields */}
              {newUserForm.role === 'ROLE_STUDENT' && (
                <div style={{ border: '1px solid var(--color-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)' }}>
                  <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: 'var(--space-3)' }}>Student Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.9rem' }}>Student ID</label>
                      <input
                        type="text"
                        value={newUserForm.studentId}
                        onChange={(e) => setNewUserForm({ ...newUserForm, studentId: e.target.value })}
                        placeholder="IT21234567"
                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.9rem' }}>Degree Program</label>
                      <input
                        type="text"
                        value={newUserForm.degreeProgram}
                        onChange={(e) => setNewUserForm({ ...newUserForm, degreeProgram: e.target.value })}
                        placeholder="BSc (Hons) Computer Science"
                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.9rem' }}>Current Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={newUserForm.currentSemester}
                      onChange={(e) => setNewUserForm({ ...newUserForm, currentSemester: parseInt(e.target.value) })}
                      style={{ width: '100px', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {newUserForm.role === 'ROLE_LECTURER' && (
                <div style={{ border: '1px solid var(--color-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)' }}>
                  <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: 'var(--space-3)' }}>Lecturer Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.9rem' }}>Title</label>
                      <input
                        type="text"
                        value={newUserForm.title}
                        onChange={(e) => setNewUserForm({ ...newUserForm, title: e.target.value })}
                        placeholder="Dr. / Prof. / Mr."
                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.9rem' }}>Office Room</label>
                      <input
                        type="text"
                        value={newUserForm.officeRoomNumber}
                        onChange={(e) => setNewUserForm({ ...newUserForm, officeRoomNumber: e.target.value })}
                        placeholder="Block A - 204"
                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.9rem' }}>Research Interests</label>
                    <input
                      type="text"
                      value={newUserForm.researchInterests}
                      onChange={(e) => setNewUserForm({ ...newUserForm, researchInterests: e.target.value })}
                      placeholder="AI, Machine Learning, Cloud Computing"
                      style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.9rem' }}>Modules (comma separated)</label>
                    <input
                      type="text"
                      value={newUserForm.modules}
                      onChange={(e) => setNewUserForm({ ...newUserForm, modules: e.target.value })}
                      placeholder="SE, DBMS, DSA"
                      style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-4)', paddingBottom: 'var(--space-2)' }}>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div style={{ color: 'var(--color-error)', backgroundColor: '#ffebee', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)' }}>{error}</div>}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div className="spinner" style={{ margin: '0 auto var(--space-4)', width: '40px', height: '40px', border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>👥</div>
          <h3>No users found</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>{searchQuery ? 'Try adjusting your search criteria.' : 'No users have registered yet.'}</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--space-2)' }}>Name</th>
              <th style={{ padding: 'var(--space-2)' }}>Email</th>
              <th style={{ padding: 'var(--space-2)' }}>Details</th>
              <th style={{ padding: 'var(--space-2)' }}>Role</th>
              <th style={{ padding: 'var(--space-2)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {user.pictureUrl ? (
                      <img src={user.pictureUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div>{user.fullName || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#757575' }}>
                        {user.providerId ? 'OAuth Account' : 'Internal Account'}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                <td style={{ padding: 'var(--space-2)' }}>
                   <div style={{ fontSize: '0.85rem' }}>
                      {user.department && <div><span style={{ fontWeight: 500 }}>Dept:</span> {user.department}</div>}
                      {user.studentId && <div><span style={{ fontWeight: 500 }}>ID:</span> {user.studentId}</div>}
                   </div>
                </td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <span style={getRoleBadgeStyle(user.role)}>
                    {user.role.replace('ROLE_', '')}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-2)', textAlign: 'right' }}>
                  <div className="cluster" style={{ justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}
                    >
                      {roleOptions.map(r => <option key={r} value={r}>{r.replace('ROLE_', '')}</option>)}
                    </select>
                    <Button variant="secondary" onClick={() => handleDelete(user.id)} style={{ padding: '4px 8px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}
