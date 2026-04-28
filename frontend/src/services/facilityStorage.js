import { createDetailStateForType, deriveCapacityFromDetails } from './facilityTypeConfig'

const FACILITY_STORAGE_KEY = 'ush_facilities'
const FACILITY_STORAGE_EVENT = 'ush:facilities:updated'

function toPositiveInteger(value) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

function normalizeFacility(data) {
  const normalizedType = (data.type ?? '').toUpperCase()
  const details = createDetailStateForType(normalizedType, data.details ?? {})

  return {
    id: data.id,
    name: (data.name ?? '').trim(),
    type: normalizedType,
    status: (data.status ?? 'AVAILABLE').toUpperCase(),
    location: (data.location ?? '').trim(),
    capacity: toPositiveInteger(data.capacity) || deriveCapacityFromDetails(details),
    details,
    description: (data.description ?? '').trim(),
    imageUrl: (data.imageUrl ?? '').trim(),
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function emitFacilityUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FACILITY_STORAGE_EVENT))
  }
}

function saveFacilities(facilities) {
  localStorage.setItem(FACILITY_STORAGE_KEY, JSON.stringify(facilities))
  emitFacilityUpdate()
}

function generateFacilityId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `facility-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getFacilities() {
  const raw = localStorage.getItem(FACILITY_STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item) => normalizeFacility(item))
      .filter((item) => item.id && item.name && item.location && item.type)
  } catch {
    return []
  }
}

export function addFacility(data) {
  const facilities = getFacilities()
  const nextFacility = normalizeFacility({
    ...data,
    id: generateFacilityId(),
    createdAt: new Date().toISOString(),
  })

  const nextFacilities = [nextFacility, ...facilities]
  saveFacilities(nextFacilities)

  return nextFacility
}

export function updateFacility(id, data) {
  const facilities = getFacilities()
  const nextFacilities = facilities.map((facility) => {
    if (facility.id !== id) {
      return facility
    }

    return normalizeFacility({
      ...facility,
      ...data,
      id: facility.id,
      createdAt: facility.createdAt,
    })
  })

  saveFacilities(nextFacilities)
}

export function deleteFacility(id) {
  const facilities = getFacilities()
  const nextFacilities = facilities.filter((facility) => facility.id !== id)
  saveFacilities(nextFacilities)
}

export function subscribeFacilities(onChange) {
  const handleStorage = (event) => {
    if (event.type === FACILITY_STORAGE_EVENT || event.key === FACILITY_STORAGE_KEY) {
      onChange()
    }
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(FACILITY_STORAGE_EVENT, handleStorage)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(FACILITY_STORAGE_EVENT, handleStorage)
  }
}
