import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaCheck, FaClock, FaDoorOpen, FaExclamationTriangle, FaHistory, FaIdCard, FaInfoCircle, FaMapMarkerAlt, FaShieldAlt, FaUsers, FaUserGraduate } from 'react-icons/fa';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Toast from '../../../components/booking/Toast';
import { createBooking, getAdminIdFromToken } from '../../../services/bookingService';
import { getFacilities, subscribeFacilities } from '../../../services/facilityStorage';
import { bookingCache } from '../../../utils/bookingCache';
import './CreateBooking.css';


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

export default function CreateBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFacilityId = location.state?.facilityId || searchParams.get('facilityId');
  const errorTopRef = useRef(null);

  const [formData, setFormData] = useState({ ...INITIAL_FORM, facilityId: urlFacilityId || '' });
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isFacilityLocked, setIsFacilityLocked] = useState(!!urlFacilityId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hh, mm] = timeStr.split(':').map(Number);
    return (hh * 60) + mm;
  };

  const getFacilityAvailableTime = (facility) => facility?.details?.availableTime || facility?.availableTime || '00:00-23:59';

  const getFacilityImageSrc = (facility) => {
    const imageUrl = facility?.imageUrl || facility?.imageName || '';
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
      return imageUrl;
    }
    return `http://localhost:8082/uploads/${imageUrl}`;
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
    if (!selectedFacility || !formData.startTime || !formData.endTime) return false;

    const start = timeToMinutes(formData.startTime);
    const end = timeToMinutes(formData.endTime);

    let open = 0;
    let close = 1439;
    const availableTime = getFacilityAvailableTime(selectedFacility);
    if (availableTime) {
      const parts = availableTime.split('-');
      if (parts.length === 2) {
        open = timeToMinutes(parts[0].trim());
        close = timeToMinutes(parts[1].trim());
      }
    }

    return start < open || end > close;
  };

  const isCapacityOverflow = () => {
    if (!selectedFacility || !formData.expectedAttendees) return false;
    const capacity = selectedFacility.capacity || 0;
    return parseInt(formData.expectedAttendees, 10) > capacity;
  };

  useEffect(() => {
    if (formData.facilityId && facilities.length > 0) {
      const facility = facilities.find((item) => String(item.id) === String(formData.facilityId));
      setSelectedFacility(facility || null);
    } else {
      setSelectedFacility(null);
    }
  }, [formData.facilityId, facilities]);

  useEffect(() => {
    const syncFacilities = async () => {
      try {
        const cached = bookingCache.getResources();
        if (cached && cached.length > 0) {
          setFacilities(cached);
        }

        const liveFacilities = await getFacilities();
        if (liveFacilities.length > 0) {
          setFacilities(liveFacilities);
          bookingCache.setResources(liveFacilities);
          setFormError('');
        } else if (!cached || cached.length === 0) {
          setFacilities([]);
          setFormError('No facilities were returned from the facility table.');
        }
      } catch (error) {
        if (!bookingCache.getResources()) {
          setFacilities([]);
        }
        setFormError(`Failed to load facilities from the facility table: ${error?.message || 'Unknown error'}`);
      }
    };

    syncFacilities();
    const unsubscribe = subscribeFacilities(syncFacilities);
    return unsubscribe;
  }, []);

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
      const capacity = selectedFacility?.capacity || 0;
      return `Capacity overflow. This venue only accommodates ${capacity} people.`;
    }
    if (!formData.startTime || !formData.endTime) return 'Start and End times are mandatory.';
    if (isTimeInvalid) return 'Operational time conflict detected. Start time must be before end time.';
    if (isOutsideOperationalWindow()) {
      const timeRange = getFacilityAvailableTime(selectedFacility);
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
    const userId = getAdminIdFromToken();
    if (!userId || userId === 'SYSTEM') {
      setFormError('Unable to determine authenticated user. Please sign in and try again.');
      setIsSubmitting(false);
      return;
    }

    const finalPayload = {
      ...formData,
      expectedAttendees: parseInt(formData.expectedAttendees, 10),
      userId: String(userId),
    };

    const { data: newBooking, error: bookingErr } = await createBooking(finalPayload);
    if (bookingErr) {
      setFormError(bookingErr);
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
            {selectedFacility ? (
              <>
                <div className="cb-preview-box">
                  {getFacilityImageSrc(selectedFacility) ? (
                    <img src={getFacilityImageSrc(selectedFacility)} alt={selectedFacility.name} />
                  ) : (
                    <div className="cb-preview-empty"><FaMapMarkerAlt /></div>
                  )}
                </div>
                <h2>{selectedFacility.name}</h2>
                <p className="cb-muted">Selected facility</p>
                <div className="cb-info-list">
                  <div><FaDoorOpen /> <span>{selectedFacility.type || 'General'}</span></div>
                  <div><FaMapMarkerAlt /> <span>{selectedFacility.location || 'N/A'}</span></div>
                  <div><FaUsers /> <span>{selectedFacility.capacity || 'N/A'} people</span></div>
                  <div><FaClock /> <span>{getFacilityAvailableTime(selectedFacility)}</span></div>
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
                    {isFacilityLocked ? (
                      <div className="cb-locked-box">{selectedFacility?.name || 'Loading facility...'}</div>
                    ) : (
                      <select name="facilityId" value={formData.facilityId} onChange={handleChange} className="cb-select">
                        <option value="">Select a facility</option>
                        {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
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
