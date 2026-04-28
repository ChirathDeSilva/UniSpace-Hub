export const FACILITY_TYPE_OPTIONS = [
  { value: 'LAB', label: 'Lab' },
  { value: 'HALL', label: 'Lecture Hall' },
  { value: 'CONFERENCE', label: 'Conference Room' },
  { value: 'SPORTAREA', label: 'Sport Area' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'AUDITORIUM', label: 'Auditorium' },
  { value: 'MAINHALL', label: 'Main Hall' },
]

export const FACILITY_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'NOT_IN_SERVICE', label: 'Not in Service' },
]

const FACILITY_TYPE_FIELDS = {
  LAB: [
    { key: 'labType', label: 'Lab Type', inputType: 'text', required: true },
    { key: 'capacity', label: 'Capacity', inputType: 'number', required: true, min: 1 },
    { key: 'availableTime', label: 'Available Time', inputType: 'text', required: true },
  ],
  HALL: [
    { key: 'totalSeats', label: 'Total Seats', inputType: 'number', required: true, min: 1 },
    { key: 'availableSeats', label: 'Available Seats', inputType: 'number', required: true, min: 0 },
    { key: 'availableTime', label: 'Available Time', inputType: 'text', required: true },
  ],
  CONFERENCE: [
    { key: 'capacity', label: 'Capacity', inputType: 'number', required: true, min: 1 },
    {
      key: 'projectorAvailable',
      label: 'Projector Available',
      inputType: 'checkbox',
      required: false,
    },
    { key: 'availableTime', label: 'Available Time', inputType: 'text', required: true },
  ],
  SPORTAREA: [
    { key: 'sportType', label: 'Sport Type', inputType: 'text', required: true },
    { key: 'capacity', label: 'Capacity', inputType: 'number', required: true, min: 1 },
    { key: 'availableTime', label: 'Available Time', inputType: 'text', required: true },
    { key: 'bookingStatus', label: 'Booking Status', inputType: 'text', required: true },
  ],
  EQUIPMENT: [
    { key: 'equipmentType', label: 'Equipment Type', inputType: 'text', required: true },
    { key: 'totalQuantity', label: 'Total Quantity', inputType: 'number', required: true, min: 1 },
    {
      key: 'availableQuantity',
      label: 'Available Quantity',
      inputType: 'number',
      required: true,
      min: 0,
    },
  ],
  AUDITORIUM: [
    {
      key: 'seatingCapacity',
      label: 'Seating Capacity',
      inputType: 'number',
      required: true,
      min: 1,
    },
    { key: 'availableTime', label: 'Available Time', inputType: 'text', required: true },
  ],
  MAINHALL: [
    { key: 'totalSeats', label: 'Total Seats', inputType: 'number', required: true, min: 1 },
    { key: 'availableTime', label: 'Available Time', inputType: 'text', required: true },
  ],
}

export function getFacilityTypeFields(type) {
  return FACILITY_TYPE_FIELDS[type] ?? []
}

export function createDetailStateForType(type, previousDetails = {}) {
  const fields = getFacilityTypeFields(type)
  const detailState = {}

  fields.forEach((field) => {
    if (field.inputType === 'checkbox') {
      detailState[field.key] = Boolean(previousDetails[field.key])
      return
    }

    detailState[field.key] = previousDetails[field.key] ?? ''
  })

  return detailState
}

function toNumberOrZero(value) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

export function deriveCapacityFromDetails(details = {}) {
  const candidates = [
    details.capacity,
    details.seatingCapacity,
    details.totalSeats,
    details.totalQuantity,
    details.availableQuantity,
    details.availableSeats,
  ]

  for (const candidate of candidates) {
    const value = toNumberOrZero(candidate)
    if (value > 0) {
      return value
    }
  }

  return 0
}

export function formatFacilityTypeLabel(type) {
  return FACILITY_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type
}

export function formatFacilityStatusLabel(status) {
  return FACILITY_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status
}

export function getFacilityDetailEntries(facility) {
  const fields = getFacilityTypeFields(facility.type)
  return fields
    .map((field) => {
      let raw = facility.details?.[field.key]

      if (field.inputType === 'checkbox') {
        raw = raw ? 'Yes' : 'No'
      }

      if (raw === undefined || raw === null || raw === '') {
        return null
      }

      return { key: field.key, label: field.label, value: String(raw) }
    })
    .filter(Boolean)
}
