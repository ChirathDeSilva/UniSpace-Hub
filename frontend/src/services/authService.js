import httpClient from '../api/httpClient'

export async function login(credentials) {
  const response = await httpClient.post('/api/auth/login', credentials)
  return response.data
}

export async function getProfile() {
  const response = await httpClient.get('/api/user/me')
  return response.data
}