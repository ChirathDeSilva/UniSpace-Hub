import { useState, useEffect } from 'react'
import httpClient from '../../../api/httpClient'
import { getProfile } from '../../../services/authService'
import InputField from '../../../components/ui/InputField'
import Button from '../../../components/ui/Button'
import Spinner from '../../../components/ui/Spinner'
import './BookingPage.css'

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState('create')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [userId, setUserId] = useState(null)
  const [facilities, setFacilities] = useState([])
  const [userBookings, setUserBookings] = useState([])
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrCode, setQrCode] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    facilityId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '1',
  })

  const [editingBooking, setEditingBooking] = useState(null)

  // Load user profile and initial data on mount
  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const profile = await getProfile()
        setUserId(profile.id)
      } catch (err) {
        console.error('Failed to load user profile:', err)
        setError('Could not load user profile. Please log in.')
      }
    }
    loadUserAndData()
    loadFacilities() // Load facilities immediately, not dependent on userId
  }, [])

  // Load user bookings when userId is available
  useEffect(() => {
    if (!userId) return
    loadUserBookings()
  }, [userId])

  const loadFacilities = async () => {
    try {
      const response = await httpClient.get('/api/facilities')
      console.log('Facilities loaded:', response.data)
      setFacilities(response.data || [])
    } catch (err) {
      console.error('Failed to load facilities:', err)
      console.error('Error details:', err.response?.data || err.message)
      setError('Could not load facilities: ' + (err.response?.data?.message || err.message))
    }
  }

  const loadUserBookings = async () => {
    try {
      setLoading(true)
      const response = await httpClient.get(`/api/bookings`, {
        params: { userId: userId },
      })
      setUserBookings(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setError('Could not load your bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      facilityId: '',
      date: '',
      startTime: '',
      endTime: '',
      purpose: '',
      attendees: '1',
    })
    setEditingBooking(null)
    setError('')
    setSuccessMessage('')
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Validation
    if (!formData.facilityId || !formData.date || !formData.startTime || !formData.endTime || !formData.purpose) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.startTime >= formData.endTime) {
      setError('End time must be after start time')
      return
    }

    try {
      setLoading(true)
      const payload = {
        facilityId: formData.facilityId,
        bookingDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        numberOfAttendees: parseInt(formData.attendees),
      }

      const response = await httpClient.post('/api/bookings', payload)
      setSuccessMessage(`Booking created successfully! Booking Code: ${response.data.bookingCode}`)
      resetForm()
      loadUserBookings()
      setActiveTab('list')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create booking'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBooking = async (e) => {
    e.preventDefault()
    if (!editingBooking) return

    setError('')
    setSuccessMessage('')

    try {
      setLoading(true)
      const payload = {
        facilityId: formData.facilityId,
        bookingDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        numberOfAttendees: parseInt(formData.attendees),
      }

      await httpClient.put(`/api/bookings/${editingBooking.bookingCode}`, payload)
      setSuccessMessage('Booking updated successfully!')
      resetForm()
      loadUserBookings()
      setActiveTab('list')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update booking'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingCode) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    try {
      setLoading(true)
      await httpClient.patch(`/api/bookings/${bookingCode}/cancel`)
      setSuccessMessage('Booking cancelled successfully!')
      loadUserBookings()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel booking'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleViewQr = async (bookingCode) => {
    try {
      setLoading(true)
      const response = await httpClient.get(`/api/bookings/${bookingCode}/qr`)
      setQrCode(response.data.qrCode || response.data)
      setShowQrModal(true)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load QR code'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleEditBooking = (booking) => {
    if (booking.status !== 'PENDING') {
      setError('Only pending bookings can be edited')
      return
    }
    setEditingBooking(booking)
    setFormData({
      facilityId: booking.facilityId,
      date: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      attendees: booking.numberOfAttendees.toString(),
    })
    setActiveTab('create')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#22c55e'
      case 'PENDING':
        return '#f59e0b'
      case 'REJECTED':
        return '#ef4444'
      case 'CANCELLED':
        return '#6b7280'
      default:
        return '#3b82f6'
    }
  }

  return (
    <section className="booking-page reveal">
      <div className="booking-container">
        <h1 className="booking-title">Facility Bookings</h1>

        {/* Tab Navigation */}
        <div className="booking-tabs">
          <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
            {editingBooking ? 'Edit Booking' : 'Create New Booking'}
          </button>
          <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
            My Bookings
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="message-alert error" role="alert">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="message-alert success" role="alert">
            {successMessage}
          </div>
        )}

        {loading && <Spinner />}

        {/* Create Booking Tab */}
        {activeTab === 'create' && !loading && (
          <div className="booking-form-section card stack">
            <form onSubmit={editingBooking ? handleUpdateBooking : handleCreateBooking} className="booking-form">
              <div className="form-group">
                <label htmlFor="facility">Select Facility *</label>
                <select
                  id="facility"
                  name="facilityId"
                  value={formData.facilityId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Choose a facility --</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <InputField
                  id="date"
                  label="Booking Date *"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  id="startTime"
                  label="Start Time *"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  id="endTime"
                  label="End Time *"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <InputField
                  id="purpose"
                  label="Purpose of Booking *"
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="e.g., Study session, Project meeting"
                  required
                />
                <InputField
                  id="attendees"
                  label="Number of Attendees *"
                  type="number"
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-actions">
                <Button type="submit" className="btn-primary">
                  {editingBooking ? 'Update Booking' : 'Create Booking'}
                </Button>
                {editingBooking && (
                  <Button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'list' && !loading && (
          <div className="bookings-list-section">
            {userBookings.length === 0 ? (
              <div className="empty-state card">
                <p>No bookings yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="bookings-grid">
                {userBookings.map((booking) => (
                  <div key={booking.id} className="booking-card card">
                    <div className="booking-header">
                      <h3>Booking Code: {booking.bookingCode}</h3>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-details">
                      <p>
                        <strong>Facility:</strong> {booking.facilityName || 'N/A'}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                      </p>
                      <p>
                        <strong>Purpose:</strong> {booking.purpose}
                      </p>
                      <p>
                        <strong>Attendees:</strong> {booking.numberOfAttendees}
                      </p>
                    </div>

                    <div className="booking-actions">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button className="btn-secondary" onClick={() => handleEditBooking(booking)}>
                            Edit
                          </Button>
                          <Button className="btn-danger" onClick={() => handleCancelBooking(booking.bookingCode)}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'APPROVED' && (
                        <>
                          <Button className="btn-primary" onClick={() => handleViewQr(booking.bookingCode)}>
                            View QR Code
                          </Button>
                          <Button className="btn-danger" onClick={() => handleCancelBooking(booking.bookingCode)}>
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status !== 'PENDING' && booking.status !== 'APPROVED' && (
                        <span className="disabled-notice">No actions available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QR Code Modal */}
        {showQrModal && (
          <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowQrModal(false)}>
                ✕
              </button>
              <h2>Booking QR Code</h2>
              {qrCode && (
                <div className="qr-container">
                  <img src={`data:image/png;base64,${qrCode}`} alt="Booking QR Code" className="qr-image" />
                </div>
              )}
              <p className="qr-instruction">Show this QR code at the facility for check-in</p>
              <Button className="btn-primary" onClick={() => setShowQrModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}