import httpClient from '../api/httpClient'

export async function login(credentials, role) {
  const endpointMap = {
    'Admin': '/api/auth/adminlogin',
    'Technician': '/api/auth/technicianlogin',
    'Student': '/api/auth/studentlogin',
    'Lecturer': '/api/auth/lecturerlogin',
  }
  const endpoint = endpointMap[role] || '/api/auth/studentlogin'
  const response = await httpClient.post(endpoint, credentials)
  return response.data
}

export async function getProfile() {
  const activeRole = (localStorage.getItem('ush_active_role') || 'Student').toUpperCase()

  const baseProfile = {
    id: 4,
    name: 'ishoda',
    email: 'ishoda2002@gmail.com',
  }

  const roleMap = {
    ADMIN: { ...baseProfile, name: 'Admin - Ishoda', role: 'ROLE_ADMIN' },
    TECHNICIAN: { ...baseProfile, name: 'Technician - Ishoda', role: 'ROLE_TECHNICIAN' },
    LECTURER: { ...baseProfile, role: 'ROLE_LECTURER' },
    STUDENT: { ...baseProfile, role: 'ROLE_STUDENT' },
  }

  const fallback = roleMap[activeRole] || roleMap.STUDENT

  return {
    id: fallback.id,
    userId: fallback.id,
    name: fallback.name,
    fullName: fallback.name,
    email: fallback.email,
    role: { name: fallback.role },
    roleName: fallback.role,
  }
}