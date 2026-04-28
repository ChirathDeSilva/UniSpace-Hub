import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import { getFacilities, subscribeFacilities } from '../../services/facilityStorage'
import {
  FACILITY_STATUS_OPTIONS,
  FACILITY_TYPE_OPTIONS,
  formatFacilityStatusLabel,
  formatFacilityTypeLabel,
  getFacilityDetailEntries,
} from '../../services/facilityTypeConfig'

export default function FacilityPortalPage() {
  const [facilities, setFacilities] = useState(() => getFacilities())
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const sync = () => setFacilities(getFacilities())
    const unsubscribe = subscribeFacilities(sync)
    return unsubscribe
  }, [])

  const filteredFacilities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return [...facilities]
      .filter((facility) => selectedType === 'ALL' || facility.type === selectedType)
      .filter((facility) => selectedStatus === 'ALL' || facility.status === selectedStatus)
      .filter((facility) => {
        if (!query) {
          return true
        }

        const detailText = getFacilityDetailEntries(facility)
          .map((item) => `${item.label} ${item.value}`)
          .join(' ')
          .toLowerCase()

        const searchIndex = [
          facility.name,
          facility.location,
          facility.description,
          facility.type,
          formatFacilityTypeLabel(facility.type),
          facility.status,
          formatFacilityStatusLabel(facility.status),
          detailText,
        ]
          .join(' ')
          .toLowerCase()

        return searchIndex.includes(query)
      })
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
  }, [facilities, searchTerm, selectedStatus, selectedType])

  return (
    <section className="stack reveal" aria-labelledby="facility-portal-title">
      <div className="card stack" style={{ gap: '0.35rem' }}>
        <h1 id="facility-portal-title">Facility Portal</h1>
        <p>Browse all facilities with type/status filters and quick search.</p>
      </div>

      <div className="card facility-filter-bar" aria-label="Facility filters">
        <label className="facility-filter-field" htmlFor="facility-search">
          Search
          <input
            id="facility-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, location, status, type, or details"
          />
        </label>

        <label className="facility-filter-field" htmlFor="facility-filter-type">
          Facility Type
          <select
            id="facility-filter-type"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            <option value="ALL">All types</option>
            {FACILITY_TYPE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="facility-filter-field" htmlFor="facility-filter-status">
          Facility Status
          <select
            id="facility-filter-status"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            {FACILITY_STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredFacilities.length === 0 ? (
        <Card>
          <p className="facility-empty">No facilities match your current filters or search.</p>
        </Card>
      ) : (
        <div className="facility-card-grid" aria-label="Facilities card view">
          {filteredFacilities.map((facility) => (
            <Card key={facility.id} className="facility-card">
              <div className="stack" style={{ gap: '0.5rem' }}>
                <h2>{facility.name}</h2>
                <p className="facility-chip">{formatFacilityTypeLabel(facility.type)}</p>
                <p className="facility-chip facility-chip-secondary">
                  {formatFacilityStatusLabel(facility.status)}
                </p>
                <p className="facility-meta">Location: {facility.location}</p>
                <ul className="facility-detail-list" aria-label="Facility details">
                  {getFacilityDetailEntries(facility).map((item) => (
                    <li key={item.key}>
                      <span>{item.label}:</span> {item.value}
                    </li>
                  ))}
                </ul>
                {facility.description ? <p>{facility.description}</p> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
