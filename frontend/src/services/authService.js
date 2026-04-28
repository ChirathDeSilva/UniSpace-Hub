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
  const response = await httpClient.get('/api/users/me')
  return response.data
}