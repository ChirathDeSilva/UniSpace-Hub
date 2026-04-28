import React, { useCallback, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaCalendarAlt, FaCheck, FaClock, FaDownload, FaEdit, FaExclamationTriangle, FaInfoCircle, FaMapMarkerAlt, FaTrash, FaUserGraduate, FaUsers } from 'react-icons/fa';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BookingStatusBadge from '../../../components/booking/BookingStatusBadge';
import Toast from '../../../components/booking/Toast';
import { useBookingDetail } from '../../../hooks/useBookingDetail';
import { cancelBooking, updateBooking } from '../../../services/bookingService';
import { formatCode, formatDate, formatTime } from '../../../utils/formatters';
import './BookingDetails.css';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { booking, resourceDetails, qrToken, isLoading, error, refetch } = useBookingDetail(id);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState('');
  const [toast, setToast] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const qrRef = useRef(null);

  const getEditForm = (b) => (b ? {
    facilityId: b.facilityId,
    bookingDate: b.bookingDate,
    startTime: b.startTime,
    endTime: b.endTime,
    purpose: b.purpose,
    expectedAttendees: b.expectedAttendees,
  } : null);

  const currentEditForm = editForm ?? (booking ? getEditForm(booking) : null);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...(prev ?? getEditForm(booking)), [name]: value }));
  };

  const handleSaveChanges = useCallback(async () => {
    if (!currentEditForm) return;

    if (currentEditForm.startTime >= currentEditForm.endTime) {
      setActionError('End time must be after start time.');
      return;
    }

    const attendees = parseInt(currentEditForm.expectedAttendees, 10);
    if (!attendees || attendees < 1) {
      setActionError('Expected attendees must be at least 1.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (currentEditForm.bookingDate < today) {
      setActionError('Reservation date cannot be in the past.');
      return;
    }

    setIsSaving(true);
    setActionError('');
    const { error: saveErr } = await updateBooking(id, currentEditForm);
    if (saveErr) {
      setActionError(saveErr);
      setIsSaving(false);
      return;
    }

    setIsEditing(false);
    setEditForm(null);
    refetch();
    setToast({ type: 'success', message: 'Reservation updated successfully.' });
    setIsSaving(false);
  }, [currentEditForm, id, refetch]);

  const handleCancel = useCallback(async () => {
    if (!window.confirm('Cancel this booking? This action cannot be undone.')) return;

    setIsCancelling(true);
    setActionError('');
    const { error: cancelErr } = await cancelBooking(id);
    if (cancelErr) {
      setActionError(cancelErr);
      setIsCancelling(false);
      return;
    }

    setToast({ type: 'success', message: 'Booking cancelled successfully.' });
    setTimeout(() => refetch(), 400);
    setIsCancelling(false);
  }, [id, refetch]);

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const svgEl = qrRef.current.querySelector('svg');
    if (!svgEl) return;

    const bookingName = booking?.bookingCode || id;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 50, 400, 400);

      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png', 1.0);
      downloadLink.download = `QR-${bookingName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Booking Details" noPadding>
        <div className="bd-page">
          <div className="bd-card bd-center">Loading booking details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !booking) {
    return (
      <DashboardLayout title="Booking Details" noPadding>
        <div className="bd-page">
          <div className="bd-card bd-center bd-error">
            <FaExclamationTriangle />
            <p>{error || 'Booking not found.'}</p>
            <Link to="/student/booking" className="bd-link-btn">Back to My Bookings</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { status, bookingCode, facilityId, purpose, expectedAttendees, bookingDate, startTime, endTime, adminDecisionReason, studentName, studentRegNumber } = booking;
  const facilityLabel = resourceDetails?.name || facilityId || '-';

  return (
    <DashboardLayout title="Booking Details" noPadding>
      <div className="bd-page">
        <div className="bd-container">
          <div className="bd-topbar">
            <Link to="/student/booking" className="bd-link-btn">Back</Link>
            <div className="bd-topbar-meta">ID: {formatCode(bookingCode)}</div>
          </div>

          <div className="bd-layout">
            <div className="bd-main">
              <div className="bd-card bd-hero">
                <div className="bd-hero-title">
                  <div>
                    <p className="bd-kicker">Reservation</p>
                    <h1>{facilityLabel}</h1>
                    {resourceDetails?.location && <p className="bd-muted"><FaMapMarkerAlt /> {resourceDetails.location}</p>}
                  </div>
                  <BookingStatusBadge status={status} />
                </div>
              </div>

              <div className="bd-card">
                {isEditing && currentEditForm ? (
                  <div className="bd-edit">
                    <div className="bd-section-title"><FaEdit /> Edit Reservation</div>
                    <div className="bd-form-grid">
                      <label className="bd-field">
                        <span><FaCalendarAlt /> Reservation Date</span>
                        <input type="date" name="bookingDate" value={currentEditForm.bookingDate} onChange={handleEditChange} min={new Date().toISOString().split('T')[0]} />
                      </label>
                      <label className="bd-field">
                        <span><FaClock /> Start Time</span>
                        <input type="time" name="startTime" value={currentEditForm.startTime} onChange={handleEditChange} />
                      </label>
                      <label className="bd-field">
                        <span><FaClock /> End Time</span>
                        <input type="time" name="endTime" value={currentEditForm.endTime} onChange={handleEditChange} />
                      </label>
                      <label className="bd-field">
                        <span><FaUsers /> Expected Attendees</span>
                        <input type="number" name="expectedAttendees" value={currentEditForm.expectedAttendees} onChange={handleEditChange} min="1" />
                      </label>
                    </div>
                    <label className="bd-field">
                      <span><FaInfoCircle /> Purpose</span>
                      <textarea name="purpose" rows="4" value={currentEditForm.purpose} onChange={handleEditChange} />
                    </label>
                    {actionError && <p className="bd-error-text">{actionError}</p>}
                    <div className="bd-actions">
                      <button type="button" className="bd-btn" onClick={() => { setIsEditing(false); setEditForm(null); setActionError(''); }}>Cancel</button>
                      <button type="button" className="bd-btn bd-btn-primary" onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="bd-view">
                    <div className="bd-info-grid">
                      <div className="bd-info-box"><span>Student</span><strong>{studentName || 'Anonymous'}</strong><p>{studentRegNumber || '—'}</p></div>
                      <div className="bd-info-box"><span>Date</span><strong>{formatDate(bookingDate)}</strong></div>
                      <div className="bd-info-box"><span>Time</span><strong>{formatTime(startTime)} - {formatTime(endTime)}</strong></div>
                      <div className="bd-info-box"><span>Attendees</span><strong>{expectedAttendees}</strong></div>
                    </div>

                    <div className="bd-purpose">
                      <div className="bd-section-title"><FaInfoCircle /> Purpose</div>
                      <p>{purpose || '-'}</p>
                    </div>

                    {adminDecisionReason && (
                      <div className="bd-notice">
                        <div className="bd-section-title"><FaCheck /> Admin Remarks</div>
                        <p>{adminDecisionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {(status === 'PENDING' || status === 'APPROVED') && (
                <div className="bd-card bd-actions-card">
                  {status === 'PENDING' && (
                    <button type="button" className="bd-btn bd-btn-primary" onClick={() => setIsEditing(true)}>
                      <FaEdit /> Modify Request
                    </button>
                  )}
                  {status === 'APPROVED' && (
                    <button type="button" className="bd-btn bd-btn-danger" onClick={handleCancel} disabled={isCancelling}>
                      <FaTrash /> {isCancelling ? 'Cancelling...' : 'Withdraw Access'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="bd-side">
              {status === 'APPROVED' && (
                <div className="bd-card bd-qr-card">
                  <h3>Access QR Code</h3>
                  <p>Scan this code at the facility entrance.</p>
                  <div className="bd-qr-wrap" ref={qrRef}>
                    <QRCodeSVG value={`${window.location.origin}/verify-booking/${qrToken || booking.qrToken || bookingCode}`} size={200} bgColor="#ffffff" fgColor="#07101e" level="H" includeMargin={false} />
                  </div>
                  <button type="button" className="bd-btn bd-btn-primary" onClick={handleDownloadQR}>
                    <FaDownload /> Download QR
                  </button>
                </div>
              )}

              <div className="bd-card bd-summary">
                <div className="bd-section-title"><FaUserGraduate /> Booking Summary</div>
                <p><strong>Booking ID:</strong> {formatCode(bookingCode)}</p>
                <p><strong>Facility:</strong> {facilityLabel}</p>
                <p><strong>Date:</strong> {formatDate(bookingDate)}</p>
                <p><strong>Time:</strong> {formatTime(startTime)} - {formatTime(endTime)}</p>
                <p><strong>Status:</strong> {status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </DashboardLayout>
  );
}
