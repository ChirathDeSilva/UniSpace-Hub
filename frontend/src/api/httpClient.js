import axios from 'axios'
import { getAccessToken, clearTokens } from '../services/authStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const httpClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearTokens()
    }

    return Promise.reject(error)
  },
)

export default httpClient