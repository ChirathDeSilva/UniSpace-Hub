import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaCheck, FaClock, FaDoorOpen, FaExclamationTriangle, FaHistory, FaIdCard, FaInfoCircle, FaMapMarkerAlt, FaShieldAlt, FaUsers, FaUserGraduate } from 'react-icons/fa';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Toast from '../../../components/booking/Toast';
import httpClient from '../../../api/httpClient';
import { fetchAllResources, createBooking } from '../../../services/bookingService';
import { bookingCache } from '../../../utils/bookingCache';
import './CreateBooking.css';

// NOTE: Backend falls back to first available user if requested userId doesn't exist
// User 1 doesn't exist in database, so bookings are saved to user 2
const DEMO_USER_ID = 2;

// Fallback demo facilities - only used when API is unavailable
// These match the inherited facility table structure
const DEMO_FACILITIES = [
  { id: 1, name: 'Main Lecture Hall', type: 'HALL', location: 'Block A', totalSeats: 120, availableTime: '08:00-17:00', facilityType: 'lectureHall', status: 'AVAILABLE' },
  { id: 2, name: 'Computer Lab 01', type: 'LAB', location: 'Block B', capacity: 40, availableTime: '08:00-18:00', facilityType: 'lab', status: 'AVAILABLE' },
  { id: 3, name: 'Conference Room', type: 'CONFERENCE', location: 'Admin Building', capacity: 20, availableTime: '09:00-16:00', facilityType: 'conferenceRoom', status: 'AVAILABLE' },
];

const LIVE_FACILITY_RETRY_AFTER_MS = 5 * 60 * 1000;
const LIVE_FACILITY_COOLDOWN_KEY = 'ush_live_facilities_retry_after';

const INITIAL_FORM = {
  facilityId: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: 1,
  studentName: '',
  studentRegNumber: '',
};

const shouldSkipLiveFacilities = () => {
  const retryAt = Number(sessionStorage.getItem(LIVE_FACILITY_COOLDOWN_KEY) || 0);
  return Number.isFinite(retryAt) && Date.now() < retryAt;
};

const markLiveFacilitiesFailure = () => {
  sessionStorage.setItem(LIVE_FACILITY_COOLDOWN_KEY, String(Date.now() + LIVE_FACILITY_RETRY_AFTER_MS));
};

const clearLiveFacilitiesFailure = () => {
  sessionStorage.removeItem(LIVE_FACILITY_COOLDOWN_KEY);
};

export default function CreateBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFacilityId = searchParams.get('facilityId');
  const errorTopRef = useRef(null);

  const [formData, setFormData] = useState({ ...INITIAL_FORM, facilityId: urlFacilityId || '' });
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isResourceLocked, setIsResourceLocked] = useState(!!urlFacilityId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hh, mm] = timeStr.split(':').map(Number);
    return (hh * 60) + mm;
  };

  const isNameInvalid = formData.studentName.length > 0 && /[^A-Za-z\s.]/.test(formData.studentName);
  const isRegInvalid = (() => {
    const val = formData.studentRegNumber;
    if (val.length === 0) return false;
    if (val[0] !== 'I') return true;
    if (val.length > 1 && val[1] !== 'T') return true;
    if (val.length > 2 && /[^0-9]/.test(val.slice(2))) return true;
    return false;
  })();
  const isTimeInvalid = formData.startTime && formData.endTime && formData.endTime <= formData.startTime;

  const isOutsideOperationalWindow = () => {
    if (!selectedResource || !formData.startTime || !formData.endTime) return false;

    const start = timeToMinutes(formData.startTime);
    const end = timeToMinutes(formData.endTime);

    let open = 0;
    let close = 1439;
    if (selectedResource.availableTime) {
      const parts = selectedResource.availableTime.split('-');
      if (parts.length === 2) {
        open = timeToMinutes(parts[0].trim());
        close = timeToMinutes(parts[1].trim());
      }
    }

    return start < open || end > close;
  };

  const isCapacityOverflow = () => {
    if (!selectedResource || !formData.expectedAttendees) return false;
    const capacity = selectedResource.totalSeats || selectedResource.capacity || 0;
    return parseInt(formData.expectedAttendees, 10) > capacity;
  };

  const isTimeConflict = () => {
    if (!formData.bookingDate || !formData.startTime || !formData.endTime || existingBookings.length === 0) return false;

    const start = timeToMinutes(formData.startTime);
    const end = timeToMinutes(formData.endTime);

    return existingBookings.some((b) => {
      if (b.bookingDate !== formData.bookingDate) return false;
      if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return start < bEnd && end > bStart;
    });
  };

  useEffect(() => {
    if (formData.facilityId && resources.length > 0) {
      const resource = resources.find((r) => String(r.id) === String(formData.facilityId));
      setSelectedResource(resource || null);
    } else {
      setSelectedResource(null);
    }
  }, [formData.facilityId, resources]);

  useEffect(() => {
    const cached = bookingCache.getResources();
    if (cached && cached.length > 0) {
      setResources(cached);
    }

    if (shouldSkipLiveFacilities()) {
      if (!cached || cached.length === 0) {
        setResources(DEMO_FACILITIES);
        setFormError('Live facilities are temporarily unavailable. Demo facilities are loaded.');
      }
      return;
    }

    fetchAllResources()
      .then(({ data, error }) => {
        if (data) {
          const resourceList = Array.isArray(data) ? data : (data.data || data.facilities || []);
          if (resourceList.length > 0) {
            clearLiveFacilitiesFailure();
            setResources(resourceList);
            bookingCache.setResources(resourceList);
          } else {
            markLiveFacilitiesFailure();
            setResources(DEMO_FACILITIES);
            setFormError('Live facilities are unavailable right now. Demo facilities are loaded.');
          }
        } else if (error) {
          markLiveFacilitiesFailure();
          setResources(DEMO_FACILITIES);
          setFormError(`Failed to load live facilities: ${error}. Demo facilities are loaded.`);
        }
      })
      .catch(() => {
        markLiveFacilitiesFailure();
        setResources(DEMO_FACILITIES);
        setFormError('Failed to load live facilities. Demo facilities are loaded.');
      });
  }, []);

  useEffect(() => {
    if (!formData.facilityId) return;

    // Fetch user bookings from public endpoint (no auth required)
    httpClient.get(`/api/bookings?userId=${DEMO_USER_ID}`)
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          const facilityOnly = response.data.filter((b) => String(b.facilityId) === String(formData.facilityId));
          setExistingBookings(facilityOnly);
        }
      })
      .catch(() => {
        setExistingBookings([]);
      });
  }, [formData.facilityId]);

  useEffect(() => {
    if (urlFacilityId) {
      setFormData((prev) => ({ ...prev, facilityId: urlFacilityId }));
      setIsResourceLocked(true);
    }
  }, [urlFacilityId]);

  useEffect(() => {
    if (formError) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formError]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'studentName') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/[^A-Za-z\s.]/g, '') }));
    } else if (name === 'studentRegNumber') {
      let val = value.toUpperCase();
      if (val.length > 2) {
        const prefix = val.substring(0, 2);
        const suffix = val.substring(2).replace(/[^0-9]/g, '');
        val = (prefix === 'IT' ? 'IT' : 'IT') + suffix;
      } else if (val.length > 0 && !'IT'.startsWith(val)) {
        val = 'IT';
      }
      if (val.length > 10) return;
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else if (name === 'purpose') {
      if (value.length > 150) return;
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setFormError('');
  };

  const validate = () => {
    if (!formData.studentName || formData.studentName.length < 3) return 'Identity verification mismatch. Provide full name.';
    if (formData.studentRegNumber.length !== 10 || !formData.studentRegNumber.startsWith('IT')) return 'Invalid IT-format registration number.';
    if (!formData.facilityId) return 'Please select a campus facility.';
    if (!formData.bookingDate) return 'Reservation date is required.';
    if (isCapacityOverflow()) {
      const capacity = selectedResource?.totalSeats || selectedResource?.capacity || 0;
      return `Capacity overflow. This venue only accommodates ${capacity} people.`;
    }
    if (!formData.startTime || !formData.endTime) return 'Start and End times are mandatory.';
    if (isTimeInvalid) return 'Operational time conflict detected. Start time must be before end time.';
    if (isTimeConflict()) return 'Time conflict detected. This facility is already reserved during this period.';
    if (isOutsideOperationalWindow()) {
      const timeRange = selectedResource?.availableTime || '00:00-23:59';
      return `Operational window mismatch. This facility is only available between ${timeRange}.`;
    }
    if (!formData.purpose || formData.purpose.length < 5) return 'Statement of purpose is mandatory (min 5 chars).';
    if (formData.purpose.length > 150) return 'Statement of purpose exceeds the 150-character institutional limit.';
    if (!termsAccepted) return 'Certification of terms required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    const finalPayload = {
      ...formData,
      expectedAttendees: parseInt(formData.expectedAttendees, 10),
      userId: DEMO_USER_ID,
    };

    const { data: newBooking, error: bookingErr, status, errorDetails } = await createBooking(finalPayload);
    if (bookingErr) {
      console.error('Booking submission failed - Status:', status, 'Error:', bookingErr, 'Details:', errorDetails);
      const detailMsg = errorDetails?.message || errorDetails?.error || '';
      const fullError = status ? `Error ${status}: ${bookingErr}${detailMsg ? ' - ' + detailMsg : ''}` : bookingErr;
      setFormError(fullError);
      setIsSubmitting(false);
      return;
    }

    setToast({ type: 'success', message: 'Requisition confirmed. Awaiting administrative approval.' });
    setTimeout(() => navigate('/student/booking', { state: { newBookingCode: newBooking?.bookingCode } }), 1800);
  };

  return (
    <DashboardLayout title="Create Reservation" noPadding>
      <div className="cb-page">
        <div className="cb-topbar">
          <Link to="/student/booking" className="cb-link-btn"><FaArrowLeft /> Back</Link>
          <div className="cb-topbar-meta">New Reservation</div>
        </div>

        <div className="cb-layout">
          <aside className="cb-sidebar">
            <FaShieldAlt className="cb-sidebar-icon" />
            {selectedResource ? (
              <>
                <div className="cb-preview-box">
                  {selectedResource.imageName ? (
                    <img src={`http://localhost:8082/uploads/${selectedResource.imageName}`} alt={selectedResource.name} />
                  ) : (
                    <div className="cb-preview-empty"><FaMapMarkerAlt /></div>
                  )}
                </div>
                <h2>{selectedResource.name}</h2>
                <p className="cb-muted">Selected facility</p>
                <div className="cb-info-list">
                  <div><FaDoorOpen /> <span>{selectedResource.type || 'General'}</span></div>
                  <div><FaMapMarkerAlt /> <span>{selectedResource.location || 'N/A'}</span></div>
                  <div><FaUsers /> <span>{selectedResource.totalSeats || selectedResource.capacity || 'N/A'} people</span></div>
                  <div><FaClock /> <span>{selectedResource.availableTime || '00:00-23:59'}</span></div>
                </div>
              </>
            ) : (
              <>
                <h2>Guided Space Access Portal</h2>
                <p className="cb-muted">Choose a facility and complete the form to create a booking.</p>
                <ul className="cb-checklist">
                  <li><FaCheck /> Real-time allocation check</li>
                  <li><FaCheck /> Encrypted access generation</li>
                  <li><FaCheck /> Mandatory rule adherence</li>
                </ul>
              </>
            )}
          </aside>

          <main className="cb-main">
            <h1>Resource Requisition</h1>
            {formError && (
              <div className="cb-alert">
                <FaExclamationTriangle />
                <p>{formError}</p>
              </div>
            )}

            <form className="cb-form" onSubmit={handleSubmit}>
              <section className="cb-section">
                <h3>Identity Verification</h3>
                <div className="cb-grid-two">
                  <label className="cb-field">
                    <span><FaUserGraduate /> Student Name</span>
                    <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className={isNameInvalid ? 'cb-invalid' : ''} />
                  </label>
                  <label className="cb-field">
                    <span><FaIdCard /> Registration Identifier</span>
                    <input type="text" name="studentRegNumber" value={formData.studentRegNumber} onChange={handleChange} className={isRegInvalid ? 'cb-invalid' : ''} />
                  </label>
                </div>
              </section>

              <section className="cb-section">
                <h3>Environment Details</h3>
                <div className="cb-grid-two">
                  <label className="cb-field">
                    <span><FaMapMarkerAlt /> Select Facility</span>
                    {isResourceLocked ? (
                      <div className="cb-locked-box">{selectedResource?.name || 'Loading facility...'}</div>
                    ) : (
                      <select name="facilityId" value={formData.facilityId} onChange={handleChange} className="cb-select">
                        <option value="">Select a facility</option>
                        {resources.map((res) => <option key={res.id} value={res.id}>{res.name}</option>)}
                      </select>
                    )}
                  </label>
                  <label className="cb-field">
                    <span><FaCalendarAlt /> Booking Date</span>
                    <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                  </label>
                  <label className="cb-field">
                    <span><FaUsers /> Capacity Required</span>
                    <input type="number" name="expectedAttendees" value={formData.expectedAttendees} onChange={handleChange} min="1" />
                  </label>
                </div>
              </section>

              <section className="cb-section">
                <h3>Operational Scheduling</h3>
                <div className="cb-grid-two">
                  <label className="cb-field">
                    <span><FaClock /> Check-In Time</span>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
                  </label>
                  <label className="cb-field">
                    <span><FaClock /> Check-Out Time</span>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
                  </label>
                </div>

                <label className="cb-field">
                  <span><FaInfoCircle /> Statement of Purpose</span>
                  <textarea name="purpose" rows="3" value={formData.purpose} onChange={handleChange} maxLength={150} />
                </label>

                <div className="cb-terms">
                  <div className="cb-terms-text">
                    <strong>Behavioral and facility terms</strong>
                    <p>Use the space responsibly, respect the facility rules, and accept responsibility for your booking.</p>
                  </div>
                  <label className="cb-checkbox-row">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <span>I agree to the terms and conditions.</span>
                  </label>
                </div>
              </section>

              <button type="submit" className="cb-submit" disabled={isSubmitting}>
                {isSubmitting ? <FaHistory className="cb-spin" /> : <FaCheck />}
                {isSubmitting ? 'Processing...' : 'Confirm Reservation Request'}
              </button>
            </form>
          </main>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </DashboardLayout>
  );
}
