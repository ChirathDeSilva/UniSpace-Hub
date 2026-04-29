import httpClient from '../api/httpClient'
import { createDetailStateForType, deriveCapacityFromDetails } from './facilityTypeConfig'

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

function mapUiTypeToApiType(type) {
  if (type === 'MAINHALL') {
    return 'HALL'
  }
  return type
}

function toApiPayload(data) {
  const apiType = mapUiTypeToApiType((data.type ?? '').toUpperCase())
  const details = data.details ?? {}
  const payload = {
    name: (data.name ?? '').trim(),
    location: (data.location ?? '').trim(),
    type: apiType,
    status: (data.status ?? 'AVAILABLE').toUpperCase(),
  }

  switch (apiType) {
    case 'LAB':
      payload.labType = details.labType ?? ''
      payload.capacity = toPositiveInteger(details.capacity)
      payload.availableTime = details.availableTime ?? ''
      break
    case 'HALL':
      payload.totalSeats = toPositiveInteger(details.totalSeats)
      payload.availableSeats = toPositiveInteger(details.availableSeats)
      payload.availableTime = details.availableTime ?? ''
      break
    case 'CONFERENCE':
      payload.capacity = toPositiveInteger(details.capacity)
      payload.projectorAvailable = Boolean(details.projectorAvailable)
      payload.availableTime = details.availableTime ?? ''
      break
    case 'SPORTAREA':
      payload.sportType = details.sportType ?? ''
      payload.capacity = toPositiveInteger(details.capacity)
      payload.availableTime = details.availableTime ?? ''
      payload.bookingStatus = details.bookingStatus ?? ''
      break
    case 'EQUIPMENT':
      payload.equipmentType = details.equipmentType ?? ''
      payload.totalQuantity = toPositiveInteger(details.totalQuantity)
      payload.availableQuantity = toPositiveInteger(details.availableQuantity)
      break
    case 'AUDITORIUM':
      payload.seatingCapacity = toPositiveInteger(details.seatingCapacity)
      payload.availableTime = details.availableTime ?? ''
      break
    default:
      break
  }

  return payload
}

function fromApiFacility(data) {
  const type = (data.type ?? '').toUpperCase()
  let details = {}

  switch (type) {
    case 'LAB':
      details = {
        labType: data.labType ?? '',
        capacity: String(data.capacity ?? ''),
        availableTime: data.availableTime ?? '',
      }
      break
    case 'HALL':
      details = {
        totalSeats: String(data.totalSeats ?? ''),
        availableSeats: String(data.availableSeats ?? ''),
        availableTime: data.availableTime ?? '',
      }
      break
    case 'CONFERENCE':
      details = {
        capacity: String(data.capacity ?? ''),
        projectorAvailable: Boolean(data.projectorAvailable),
        availableTime: data.availableTime ?? '',
      }
      break
    case 'SPORTAREA':
      details = {
        sportType: data.sportType ?? '',
        capacity: String(data.capacity ?? ''),
        availableTime: data.availableTime ?? '',
        bookingStatus: data.bookingStatus ?? '',
      }
      break
    case 'EQUIPMENT':
      details = {
        equipmentType: data.equipmentType ?? '',
        totalQuantity: String(data.totalQuantity ?? ''),
        availableQuantity: String(data.availableQuantity ?? ''),
      }
      break
    case 'AUDITORIUM':
      details = {
        seatingCapacity: String(data.seatingCapacity ?? ''),
        availableTime: data.availableTime ?? '',
      }
      break
    default:
      break
  }

  return normalizeFacility({
    ...data,
    type,
    details: createDetailStateForType(type, details),
  })
}

function emitFacilityUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(FACILITY_STORAGE_EVENT))
  }
}

export async function getFacilities() {
  const response = await httpClient.get('/api/facilities')
  if (!Array.isArray(response.data)) {
    return []
  }

  return response.data
    .map((item) => fromApiFacility(item))
    .filter((item) => item.id && item.name && item.location && item.type)
}

export async function addFacility(data) {
  const response = await httpClient.post('/api/facilities', toApiPayload(data))
  emitFacilityUpdate()
  return fromApiFacility(response.data)
}

export async function updateFacility(id, data) {
  const response = await httpClient.put(`/api/facilities/${id}`, toApiPayload(data))
  emitFacilityUpdate()
  return fromApiFacility(response.data)
}

export async function deleteFacility(id) {
  await httpClient.delete(`/api/facilities/${id}`)
  emitFacilityUpdate()
}

export function subscribeFacilities(onChange) {
  const handleStorage = (event) => {
    if (event.type === FACILITY_STORAGE_EVENT) {
      onChange()
    }
  }

  window.addEventListener(FACILITY_STORAGE_EVENT, handleStorage)

  return () => {
    window.removeEventListener(FACILITY_STORAGE_EVENT, handleStorage)
  }
}
