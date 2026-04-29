import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import InputField from '../../components/ui/InputField'
import {
  createDetailStateForType,
  FACILITY_STATUS_OPTIONS,
  formatFacilityStatusLabel,
  formatFacilityTypeLabel,
  getFacilityDetailEntries,
  getFacilityTypeFields,
} from '../../services/facilityTypeConfig'
import {
  deleteFacility,
  getFacilities,
  subscribeFacilities,
  updateFacility,
} from '../../services/facilityStorage'

function toEditForm(facility) {
  return {
    name: facility.name,
    type: facility.type,
    status: facility.status ?? 'AVAILABLE',
    location: facility.location,
    details: createDetailStateForType(facility.type, facility.details ?? {}),
    imageUrl: facility.imageUrl ?? '',
    description: facility.description ?? '',
  }
}

function validate(formData) {
  const nextErrors = {}

  if (!formData.name.trim()) {
    nextErrors.name = 'Facility name is required.'
  }

  if (!formData.type.trim()) {
    nextErrors.type = 'Facility type is required.'
  }

  if (!formData.location.trim()) {
    nextErrors.location = 'Location is required.'
  }

  if (!formData.status.trim()) {
    nextErrors.status = 'Facility status is required.'
  }

  const detailFields = getFacilityTypeFields(formData.type)
  detailFields.forEach((field) => {
    const value = formData.details[field.key]
    const errorKey = `detail.${field.key}`

    if (field.inputType !== 'checkbox' && field.required && !String(value ?? '').trim()) {
      nextErrors[errorKey] = `${field.label} is required.`
      return
    }

    if (field.inputType === 'number' && String(value ?? '').trim()) {
      const parsed = Number.parseInt(value, 10)
      const min = field.min ?? 0
      if (!Number.isFinite(parsed) || parsed < min) {
        nextErrors[errorKey] = `${field.label} must be at least ${min}.`
      }
    }
  })

  const totalSeats = Number.parseInt(formData.details.totalSeats, 10)
  const availableSeats = Number.parseInt(formData.details.availableSeats, 10)
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

  const totalQuantity = Number.parseInt(formData.details.totalQuantity, 10)
  const availableQuantity = Number.parseInt(formData.details.availableQuantity, 10)
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
    const labCapacity = Number.parseInt(formData.details.capacity, 10)
    if (Number.isFinite(labCapacity) && labCapacity > 60) {
      nextErrors['detail.capacity'] = 'Lab capacity cannot exceed 60.'
    }
  }

  return nextErrors
}

export default function AdminFacilityListPage() {
  const [facilities, setFacilities] = useState([])
  const [editingFacilityId, setEditingFacilityId] = useState(null)
  const [editFormData, setEditFormData] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const sync = async () => {
      try {
        const nextFacilities = await getFacilities()
        setFacilities(nextFacilities)
      } catch {
        setFacilities([])
      }
    }

    // Keep the effect itself synchronous so React receives a cleanup function.
    sync()
    const unsubscribe = subscribeFacilities(sync)
    return unsubscribe
  }, [])

  const sortedFacilities = useMemo(
    () =>
      [...facilities].sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
          new Date(a.updatedAt ?? a.createdAt ?? 0).getTime(),
      ),
    [facilities],
  )

  const startEdit = (facility) => {
    setEditingFacilityId(facility.id)
    setEditFormData(toEditForm(facility))
    setErrors({})
  }

  const cancelEdit = () => {
    setEditingFacilityId(null)
    setEditFormData(null)
    setErrors({})
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleEditDetailChange = (event) => {
    const { name, value, type, checked } = event.target
    setEditFormData((previous) => ({
      ...previous,
      details: {
        ...previous.details,
        [name]: type === 'checkbox' ? checked : value,
      },
    }))
  }

  const handleSave = async (facilityId) => {
    const nextErrors = validate(editFormData)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      await updateFacility(facilityId, editFormData)
      const nextFacilities = await getFacilities()
      setFacilities(nextFacilities)
      cancelEdit()
    } catch {
      // Keep form open so user can retry.
    }
  }

  const handleDelete = async (facilityId, facilityName) => {
    const isConfirmed = window.confirm(`Delete facility "${facilityName}"?`)
    if (!isConfirmed) {
      return
    }

    try {
      await deleteFacility(facilityId)
      const nextFacilities = await getFacilities()
      setFacilities(nextFacilities)
    } catch {
      return
    }

    if (editingFacilityId === facilityId) {
      cancelEdit()
    }
  }

  return (
    <section className="card stack reveal" aria-labelledby="admin-facility-list-title">
      <div className="stack" style={{ gap: '0.35rem' }}>
        <h1 id="admin-facility-list-title">List Added Facilities</h1>
        <p>Manage facilities in list view. Admin can edit or delete each item.</p>
      </div>

      <div className="cluster">
        <Link to="/admin/add-facility">
          <Button type="button">Add New Facility</Button>
        </Link>
        <Link to="/facility-portal">
          <Button type="button" variant="secondary">
            View Facility Portal
          </Button>
        </Link>
      </div>

      {sortedFacilities.length === 0 ? (
        <p className="facility-empty">No facilities added yet. Use Add Facility to create one.</p>
      ) : (
        <ul className="facility-list-view" aria-label="Added facilities list">
          {sortedFacilities.map((facility) => {
            const isEditing = editingFacilityId === facility.id

            return (
              <li key={facility.id} className="facility-list-item">
                {!isEditing ? (
                  <>
                    <div className="facility-list-main">
                      <h2>{facility.name}</h2>
                      <p className="facility-list-meta">
                        {formatFacilityTypeLabel(facility.type)} | {facility.location} |{' '}
                        {formatFacilityStatusLabel(facility.status)}
                      </p>
                      <ul className="facility-detail-list" aria-label="Facility details">
                        {getFacilityDetailEntries(facility).map((item) => (
                          <li key={item.key}>
                            <span>{item.label}:</span> {item.value}
                          </li>
                        ))}
                      </ul>
                      {facility.description ? <p>{facility.description}</p> : null}
                    </div>

                    <div className="facility-list-actions">
                      <Button type="button" variant="secondary" onClick={() => startEdit(facility)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDelete(facility.id, facility.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="facility-edit-panel stack">
                    <div className="facility-form-grid">
                      <InputField
                        id="edit-name"
                        name="name"
                        label="Facility Name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        error={errors.name}
                      />
                      <InputField
                        id="edit-type"
                        name="type"
                        label="Facility Type"
                        value={formatFacilityTypeLabel(editFormData.type)}
                        readOnly
                      />
                      <InputField
                        id="edit-location"
                        name="location"
                        label="Location"
                        value={editFormData.location}
                        onChange={handleEditChange}
                        error={errors.location}
                      />
                      <div className="field">
                        <label htmlFor="edit-status">Facility Status</label>
                        <select
                          id="edit-status"
                          name="status"
                          value={editFormData.status}
                          onChange={handleEditChange}
                        >
                          {FACILITY_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <InputField
                        id="edit-image"
                        name="imageUrl"
                        label="Image URL"
                        value={editFormData.imageUrl}
                        onChange={handleEditChange}
                      />

                      {getFacilityTypeFields(editFormData.type).map((field) => {
                        const errorKey = `detail.${field.key}`
                        if (field.inputType === 'checkbox') {
                          return (
                            <label
                              key={field.key}
                              className="facility-checkbox-field"
                              htmlFor={`edit-detail-${field.key}`}
                            >
                              <input
                                id={`edit-detail-${field.key}`}
                                name={field.key}
                                type="checkbox"
                                checked={Boolean(editFormData.details[field.key])}
                                onChange={handleEditDetailChange}
                              />
                              <span>{field.label}</span>
                            </label>
                          )
                        }

                        return (
                          <InputField
                            key={field.key}
                            id={`edit-detail-${field.key}`}
                            name={field.key}
                            label={field.label}
                            type={field.inputType === 'number' ? 'number' : 'text'}
                            min={field.inputType === 'number' ? field.min ?? 0 : undefined}
                            value={editFormData.details[field.key]}
                            onChange={handleEditDetailChange}
                            error={errors[errorKey]}
                          />
                        )
                      })}
                    </div>

                    <div className="field">
                      <label htmlFor="edit-description">Description</label>
                      <textarea
                        id="edit-description"
                        name="description"
                        rows="3"
                        value={editFormData.description}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="cluster">
                      <Button type="button" onClick={() => handleSave(facility.id)}>
                        Save
                      </Button>
                      <Button type="button" variant="secondary" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
