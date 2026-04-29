import httpClient from '../api/httpClient'

/**
 * Student credential login → POST /api/auth/studentlogin
 */
export async function studentLogin(credentials) {
  const res = await httpClient.post('/api/auth/studentlogin', credentials)
  return res.data
}

/**
 * Lecturer credential login → POST /api/auth/lecturerlogin
 */
export async function lecturerLogin(credentials) {
  const res = await httpClient.post('/api/auth/lecturerlogin', credentials)
  return res.data
}

/**
 * Admin credential login → POST /api/auth/adminlogin
 */
export async function adminLogin(credentials) {
  const res = await httpClient.post('/api/auth/adminlogin', credentials)
  return res.data
}

/**
 * Technician credential login → POST /api/auth/technicianlogin
 */
export async function technicianLogin(credentials) {
  const res = await httpClient.post('/api/auth/technicianlogin', credentials)
  return res.data
}

/**
 * Legacy unified login kept for compatibility.
 */
export async function login(credentials, role) {
  const map = {
    Student:    studentLogin,
    Lecturer:   lecturerLogin,
    Admin:      adminLogin,
    Technician: technicianLogin,
  }
  return (map[role] || studentLogin)(credentials)
}

export async function getProfile() {
  const res = await httpClient.get('/api/user/me')
  return res.data
}