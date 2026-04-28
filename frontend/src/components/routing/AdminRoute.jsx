import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const ADMIN_DEMO_MODE = false

function decodeJwtPayload(token) {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) {
      return null
    }

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )

    return JSON.parse(json)
  } catch {
    return null
  }
}

function extractTokenRoles(payload) {
  if (!payload || typeof payload !== 'object') {
    return []
  }

  const roleBag = new Set()

  const maybeAdd = (value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string' && item.trim()) {
          roleBag.add(item.trim().toUpperCase())
        }
      })
      return
    }

    if (typeof value === 'string' && value.trim()) {
      value
        .trim()
        .split(/\s+/)
        .forEach((item) => roleBag.add(item.toUpperCase()))
    }
  }

  maybeAdd(payload.roles)
  maybeAdd(payload.authorities)
  maybeAdd(payload.scp)
  maybeAdd(payload.scope)
  maybeAdd(payload.role)

  maybeAdd(payload?.realm_access?.roles)

  if (payload.resource_access && typeof payload.resource_access === 'object') {
    Object.values(payload.resource_access).forEach((resource) => {
      maybeAdd(resource?.roles)
    })
  }

  return Array.from(roleBag)
}

function hasAdminRole(accessToken) {
  if (!accessToken) {
    return false
  }

  const payload = decodeJwtPayload(accessToken)
  const roles = extractTokenRoles(payload)

  return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')
}

export default function AdminRoute() {
  const { isAuthenticated, accessToken } = useAuth()
  const location = useLocation()

  if (ADMIN_DEMO_MODE) {
    return <Outlet />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!hasAdminRole(accessToken)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
