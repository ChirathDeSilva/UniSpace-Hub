import { Link } from 'react-router-dom'
import { useState } from 'react'
import Button from '../../components/ui/Button'
import InputField from '../../components/ui/InputField'
import { addFacility } from '../../services/facilityStorage'
import {
  createDetailStateForType,
  FACILITY_STATUS_OPTIONS,
  FACILITY_TYPE_OPTIONS,
  getFacilityTypeFields,
} from '../../services/facilityTypeConfig'

const initialForm = {
  name: '',
  type: FACILITY_TYPE_OPTIONS[0].value,
  status: FACILITY_STATUS_OPTIONS[0].value,
  location: '',
  description: '',
}

const initialDetails = createDetailStateForType(initialForm.type)

function validate(formData, detailData) {
  const nextErrors = {}

  if (!formData.name.trim()) {
    nextErrors.name = 'Facility name is required.'
  }

  if (!formData.location.trim()) {
    nextErrors.location = 'Location is required.'
  }

  if (!formData.status.trim()) {
    nextErrors.status = 'Facility status is required.'
  }

  const detailFields = getFacilityTypeFields(formData.type)
  detailFields.forEach((field) => {
    const fieldValue = detailData[field.key]
    const errorKey = `detail.${field.key}`

    if (field.inputType !== 'checkbox' && field.required && !String(fieldValue ?? '').trim()) {
      nextErrors[errorKey] = `${field.label} is required.`
      return
    }

    if (field.inputType === 'number' && String(fieldValue ?? '').trim()) {
      const parsed = Number.parseInt(fieldValue, 10)
      const min = field.min ?? 0
      if (!Number.isFinite(parsed) || parsed < min) {
        nextErrors[errorKey] = `${field.label} must be at least ${min}.`
      }
    }
  })

  const totalSeats = Number.parseInt(detailData.totalSeats, 10)
  const availableSeats = Number.parseInt(detailData.availableSeats, 10)
  if (formData.type === 'HALL' && Number.isFinite(totalSeats) && Number.isFinite(availableSeats)) {
    if (availableSeats > totalSeats) {
      nextErrors['detail.availableSeats'] = 'Available seats cannot exceed total seats.'
    }
    if (totalSeats > 250) {
      nextErrors['detail.totalSeats'] = 'Total seats cannot exceed 250.'
    }
    if (availableSeats > 250) {
      nextErrors['detail.availableSeats'] = 'Available seats cannot exceed 250.'
    }
  }

  const totalQuantity = Number.parseInt(detailData.totalQuantity, 10)
  const availableQuantity = Number.parseInt(detailData.availableQuantity, 10)
  if (
    formData.type === 'EQUIPMENT' &&
    Number.isFinite(totalQuantity) &&
    Number.isFinite(availableQuantity)
  ) {
    if (availableQuantity > totalQuantity) {
      nextErrors['detail.availableQuantity'] =
        'Available quantity cannot exceed total quantity.'
    }
  }

  // Lab capacity maximum
  if (formData.type === 'LAB') {
    const labCapacity = Number.parseInt(detailData.capacity, 10)
    if (Number.isFinite(labCapacity) && labCapacity > 60) {
      nextErrors['detail.capacity'] = 'Lab capacity cannot exceed 60.'
    }
  }

  return nextErrors
}

export default function AdminAddFacilityPage() {
  const [formData, setFormData] = useState(initialForm)
  const [detailData, setDetailData] = useState(initialDetails)
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'type') {
      setFormData((previous) => ({ ...previous, type: value }))
      setDetailData((previous) => createDetailStateForType(value, previous))
      return
    }

    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleDetailChange = (event) => {
    const { name, value, type, checked } = event.target
    setDetailData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(formData, detailData)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage('')
      return
    }

    try {
      await addFacility({
        name: formData.name,
        type: formData.type,
        status: formData.status,
        location: formData.location,
        details: detailData,
        description: formData.description,
      })

      setFormData(initialForm)
      setDetailData(initialDetails)
      setErrors({})
      setStatusMessage('Facility added successfully.')
    } catch {
      setStatusMessage('Failed to add facility. Please check backend connection.')
    }
  }

  const detailFields = getFacilityTypeFields(formData.type)

  return (
    <section className="card stack reveal" aria-labelledby="admin-add-facility-title">
      <div className="stack" style={{ gap: '0.35rem' }}>
        <h1 id="admin-add-facility-title">Add Facility</h1>
        <p>Select a Facility Type and fill its unique details.</p>
      </div>

      <form className="facility-form" onSubmit={handleSubmit} noValidate>
        <div className="facility-form-grid">
          <InputField
            id="facility-name"
            name="name"
            label="Facility Name"
            placeholder="Main Auditorium"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <div className="field">
            <label htmlFor="facility-type">Facility Type</label>
            <select id="facility-type" name="type" value={formData.type} onChange={handleChange}>
              {FACILITY_TYPE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="facility-status">Facility Status</label>
            <select
              id="facility-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? 'facility-status-error' : undefined}
            >
              {FACILITY_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.status ? (
              <p className="field-error" id="facility-status-error" role="alert">
                {errors.status}
              </p>
            ) : null}
          </div>

          <InputField
            id="facility-location"
            name="location"
            label="Location"
            placeholder="Block A - Ground Floor"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
          />

        </div>

        <div className="facility-dynamic-wrapper stack">
          <h2>Type Specific Details</h2>
          <div className="facility-form-grid">
            {detailFields.map((field) => {
              const errorKey = `detail.${field.key}`
              const fieldError = errors[errorKey]

              if (field.inputType === 'checkbox') {
                return (
                  <label key={field.key} className="facility-checkbox-field" htmlFor={`detail-${field.key}`}>
                    <input
                      id={`detail-${field.key}`}
                      name={field.key}
                      type="checkbox"
                      checked={Boolean(detailData[field.key])}
                      onChange={handleDetailChange}
                    />
                    <span>{field.label}</span>
                  </label>
                )
              }

              return (
                <InputField
                  key={field.key}
                  id={`detail-${field.key}`}
                  name={field.key}
                  label={field.label}
                  type={field.inputType === 'number' ? 'number' : 'text'}
                  min={field.inputType === 'number' ? field.min ?? 0 : undefined}
                  value={detailData[field.key]}
                  onChange={handleDetailChange}
                  error={fieldError}
                />
              )
            })}
          </div>
        </div>

        <div className="field">
          <label htmlFor="facility-description">Description (Optional)</label>
          <textarea
            id="facility-description"
            name="description"
            rows="4"
            placeholder="Any notes about usage, equipment, or availability."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {statusMessage ? <p className="facility-status-success">{statusMessage}</p> : null}

        <div className="cluster">
          <Button type="submit">Add Facility</Button>
          <Link to="/admin/facility-list">
            <Button type="button" variant="secondary">
              View Facility List
            </Button>
          </Link>
          <Link to="/facility-portal">
            <Button type="button" variant="ghost">
              View Facility Portal
            </Button>
          </Link>
        </div>
      </form>
    </section>
  )
}
