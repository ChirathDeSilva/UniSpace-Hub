import { useState, useEffect } from 'react'
import httpClient from '../../api/httpClient'
import Button from '../../components/ui/Button'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
        <div>
          <input 
            type="text" 
            placeholder="Search by email or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', width: '250px' }}
          />
        </div>
      </div>

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
              <th style={{ padding: 'var(--space-2)' }}>Provider</th>
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
                    {user.fullName || 'Unknown'}
                  </div>
                </td>
                <td style={{ padding: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <span style={{ fontSize: '0.85rem', color: '#757575', border: '1px solid #e0e0e0', padding: '2px 6px', borderRadius: '4px' }}>
                    {user.providerId ? 'OAuth' : 'Credentials'}
                  </span>
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
