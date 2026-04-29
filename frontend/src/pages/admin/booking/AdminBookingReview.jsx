import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaQrcode } from 'react-icons/fa';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import Toast from '../../../components/booking/Toast';
import { formatCode, formatDate, formatTime } from '../../../utils/formatters';
import {
  approveBooking,
  fetchAdminBookingReview,
  fetchAllResources,
  rejectBooking,
} from '../../../services/bookingService';
import { bookingCache } from '../../../utils/bookingCache';
import './AdminBookingReview.css';

const DEMO_BOOKINGS_CACHE_KEY = 'ush_demo_bookings_cache';

const readBookingsCache = () => {
  try {
    const raw = sessionStorage.getItem(DEMO_BOOKINGS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBookingsCache = (bookings) => {
  try {
    sessionStorage.setItem(DEMO_BOOKINGS_CACHE_KEY, JSON.stringify(bookings));
  } catch {
    // Ignore storage write failures in demo mode.
  }
};

const normalizeBooking = (booking) => {
  const facilityId = booking?.facilityId ?? booking?.resourceId ?? null;
  return {
    ...booking,
    facilityId,
    resourceId: facilityId,
  };
};

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = String(timeStr).split(':').map(Number);
  return (hours * 60) + minutes;
};

const overlaps = (left, right) => {
  const leftStart = timeToMinutes(left.startTime);
  const leftEnd = timeToMinutes(left.endTime);
  const rightStart = timeToMinutes(right.startTime);
  const rightEnd = timeToMinutes(right.endTime);
  return leftStart < rightEnd && leftEnd > rightStart;
};

const buildLocalReviewData = (booking, allBookings) => {
  const normalizedBooking = normalizeBooking(booking);
  const conflictingBookings = allBookings
    .map(normalizeBooking)
    .filter((item) =>
      String(item.bookingCode) !== String(normalizedBooking.bookingCode) &&
      String(item.facilityId) === String(normalizedBooking.facilityId) &&
      String(item.bookingDate) === String(normalizedBooking.bookingDate) &&
      item.status === 'APPROVED' &&
      overlaps(normalizedBooking, item),
    );

  const canApprove = normalizedBooking.status === 'PENDING' && conflictingBookings.length === 0;

  return {
    bookingDetails: normalizedBooking,
    resourceSummary: 'Local demo review mode.',
    approvedBookingsForDate: allBookings
      .map(normalizeBooking)
      .filter((item) =>
        String(item.facilityId) === String(normalizedBooking.facilityId) &&
        String(item.bookingDate) === String(normalizedBooking.bookingDate) &&
        item.status === 'APPROVED',
      ),
    overlappingBookings: conflictingBookings,
    canApprove,
    reviewMessage: canApprove
      ? 'Booking is valid and can be approved locally.'
      : 'Booking has overlap conflicts and cannot be approved locally.',
  };
};

export default function AdminBookingReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reviewData, setReviewData] = useState(null);
  const [resourceMap, setResourceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [adminReason, setAdminReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [showOverride, setShowOverride] = useState(false);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [approvedCode, setApprovedCode] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      const cachedBookings = readBookingsCache().map(normalizeBooking);
      const cachedResources = bookingCache.getResources() || [];

      const nextMap = {};
      cachedResources.forEach((r) => {
        const key = r?.id ?? r?.facilityId ?? r?.resourceId;
        if (key != null) nextMap[String(key)] = r?.name || 'Unnamed Facility';
      });

      const token = localStorage.getItem('ush_access_token') || localStorage.getItem('token') || '';
      if (!token) {
        const localBooking = cachedBookings.find((booking) => String(booking.bookingCode) === String(id));
        if (!localBooking) {
          setError('Booking not found in demo data.');
          setLoading(false);
          return;
        }

        setResourceMap(nextMap);
        setReviewData(buildLocalReviewData(localBooking, cachedBookings));
        setLoading(false);
        return;
      }

      const [reviewRes, resourcesRes] = await Promise.all([
        fetchAdminBookingReview(id),
        fetchAllResources(),
      ]);

      if (reviewRes.error || !reviewRes.data) {
        const localBooking = cachedBookings.find((booking) => String(booking.bookingCode) === String(id));
        if (!localBooking) {
          setError(reviewRes.error || 'Booking not found.');
          setLoading(false);
          return;
        }

        setResourceMap(nextMap);
        setReviewData(buildLocalReviewData(localBooking, cachedBookings));
        setLoading(false);
        return;
      }

      const resources = Array.isArray(resourcesRes.data) ? resourcesRes.data : [];
      const remoteMap = {};
      resources.forEach((r) => {
        const key = r?.id ?? r?.facilityId ?? r?.resourceId;
        if (key != null) remoteMap[String(key)] = r?.name || 'Unnamed Facility';
      });

      setResourceMap(Object.keys(remoteMap).length > 0 ? remoteMap : nextMap);
      setReviewData(reviewRes.data);
      setLoading(false);
    };

    load();
  }, [id]);

  const bookingDetails = reviewData?.bookingDetails;
  const overlappingBookings = reviewData?.overlappingBookings || [];
  const canApprove = Boolean(reviewData?.canApprove);

  const facilityName = useMemo(() => {
    if (!bookingDetails) return '-';
    const facilityId = bookingDetails.facilityId;
    return resourceMap[String(facilityId)] || `Facility #${facilityId}`;
  }, [bookingDetails, resourceMap]);

  const isCancelled = bookingDetails?.status === 'CANCELLED';
  const isProcessed = ['APPROVED', 'REJECTED', 'CANCELLED'].includes(bookingDetails?.status);

  const handleAction = async (actionType, explicitReason = null) => {
    if (!bookingDetails) return false;

    const identifier = bookingDetails.bookingCode || id;
    const remarksToUse = explicitReason !== null ? explicitReason : adminReason;

    if (actionType === 'REJECT' && !remarksToUse.trim()) {
      setActionError('A reason is required when rejecting a booking.');
      return false;
    }

    setSubmitting(true);
    setActionError('');
    const token = localStorage.getItem('ush_access_token') || localStorage.getItem('token') || '';
    const isDemoMode = !token;

    const applyLocalChange = (nextStatus) => {
      const allBookings = readBookingsCache().map(normalizeBooking);
      const nextBookings = allBookings.map((booking) => {
        if (String(booking.bookingCode) !== String(identifier)) {
          return booking;
        }

        const updated = {
          ...booking,
          status: nextStatus,
          adminDecisionReason: remarksToUse || '',
          updatedAt: new Date().toISOString(),
        };

        if (nextStatus === 'APPROVED') {
          updated.approvedAt = new Date().toISOString();
          updated.approvedBy = 'SYSTEM';
          updated.rejectedAt = null;
          updated.rejectedBy = null;
          updated.qrToken = updated.qrToken || `DEMO-${String(identifier)}`;
        }

        if (nextStatus === 'REJECTED') {
          updated.rejectedAt = new Date().toISOString();
          updated.rejectedBy = 'SYSTEM';
          updated.approvedAt = null;
          updated.approvedBy = null;
          updated.qrToken = null;
        }

        return updated;
      });

      writeBookingsCache(nextBookings);
      const refreshed = nextBookings.find((booking) => String(booking.bookingCode) === String(identifier));
      setReviewData(buildLocalReviewData(refreshed, nextBookings));
    };

    try {
      if (isDemoMode) {
        applyLocalChange(actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED');
      } else {
        const adminId = 'SYSTEM';
        const result =
          actionType === 'APPROVE'
            ? await approveBooking(identifier, adminId, remarksToUse)
            : await rejectBooking(identifier, adminId, remarksToUse);

        if (result.error) {
          setActionError(result.error);
          setSubmitting(false);
          return false;
        }

        const refresh = await fetchAdminBookingReview(identifier);
        if (!refresh.error && refresh.data) {
          setReviewData(refresh.data);
        }
      }

      if (actionType === 'APPROVE') {
        setApprovedCode(identifier);
        setToast({ type: 'success', message: 'Booking approved.' });
      } else {
        setToast({ type: 'success', message: 'Booking rejected.' });
        if (!isEditingRemarks) {
          setTimeout(() => navigate(`/admin/booking?highlight=${identifier}`), 1200);
        }
      }

      setSubmitting(false);
      return true;
    } catch {
      setActionError('Failed to complete action. Please try again.');
      setSubmitting(false);
      return false;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Review Booking">
        <div className="abr-page">
          <div className="abr-card abr-center">Loading review data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !reviewData || !bookingDetails) {
    return (
      <DashboardLayout title="Review Booking">
        <div className="abr-page">
          <div className="abr-card abr-center abr-error">
            <FaExclamationTriangle />
            <p>{error || 'Booking not found.'}</p>
            <Link to="/admin/booking" className="abr-link-btn">Back to Booking Log</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Review Booking">
      <div className="abr-page">
        <div className="abr-container">
          <Link to="/admin/booking" className="abr-back-link">
            <FaArrowLeft /> Back to Booking Log
          </Link>

          <div className="abr-card">
            <h2>{formatCode(bookingDetails.bookingCode)}</h2>
            <div className="abr-grid">
              <div>
                <strong>Status</strong>
                <p>{bookingDetails.status}</p>
              </div>
              <div>
                <strong>Facility</strong>
                <p>{facilityName}</p>
              </div>
              <div>
                <strong>Date</strong>
                <p>{formatDate(bookingDetails.bookingDate)}</p>
              </div>
              <div>
                <strong>Time</strong>
                <p>
                  {formatTime(bookingDetails.startTime)} - {formatTime(bookingDetails.endTime)}
                </p>
              </div>
              <div>
                <strong>Student</strong>
                <p>{bookingDetails.studentRegNumber || 'Anonymous'}</p>
              </div>
              <div>
                <strong>Attendees</strong>
                <p>{bookingDetails.expectedAttendees ?? '-'}</p>
              </div>
            </div>
            <div className="abr-purpose">
              <strong>Purpose</strong>
              <p>{bookingDetails.purpose || '-'}</p>
            </div>
          </div>

          {overlappingBookings.length > 0 && (
            <div className="abr-card abr-warning">
              <h3>Schedule Conflict</h3>
              {overlappingBookings.map((ob) => (
                <div key={ob.bookingCode} className="abr-row">
                  <span>{formatCode(ob.bookingCode)}</span>
                  <span>
                    {formatTime(ob.startTime)} - {formatTime(ob.endTime)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isCancelled && (
            <div className="abr-card abr-muted">
              <h3>Cancelled Booking</h3>
              <p>This booking is archived and cannot be modified.</p>
              <p>Cancelled by: {bookingDetails.cancelledBy || 'SYSTEM'}</p>
            </div>
          )}

          {!isCancelled && bookingDetails.status === 'PENDING' && (
            <div className="abr-card">
              <h3>Admin Decision</h3>
              <textarea
                value={adminReason}
                onChange={(e) => {
                  setAdminReason(e.target.value);
                  setActionError('');
                }}
                placeholder="Enter remarks"
                rows={4}
                className="abr-textarea"
              />

              {actionError && <p className="abr-error-text">{actionError}</p>}

              <div className="abr-actions">
                <button
                  className="abr-btn abr-btn-success"
                  onClick={() => handleAction('APPROVE')}
                  disabled={submitting || !canApprove}
                >
                  {submitting ? 'Processing...' : 'Approve'}
                </button>
                <button
                  className="abr-btn abr-btn-danger"
                  onClick={() => handleAction('REJECT')}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Reject'}
                </button>
              </div>

              {!canApprove && <p className="abr-note">Approval is disabled due to conflicts.</p>}
            </div>
          )}

          {!isCancelled && isProcessed && bookingDetails.status !== 'PENDING' && (
            <div className="abr-card">
              <h3>Decision Record</h3>
              {!isEditingRemarks ? (
                <>
                  <p>{bookingDetails.adminDecisionReason || 'No remarks provided.'}</p>
                  <div className="abr-actions">
                    <button
                      className="abr-btn"
                      onClick={() => {
                        setActionError('');
                        setAdminReason(bookingDetails.adminDecisionReason || '');
                        setIsEditingRemarks(true);
                      }}
                    >
                      Edit Remarks
                    </button>
                    {(bookingDetails.status === 'APPROVED' || bookingDetails.status === 'REJECTED') && (
                      <button
                        className="abr-btn"
                        onClick={() => {
                          setActionError('');
                          setAdminReason('');
                          setShowOverride(true);
                        }}
                      >
                        Override Decision
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    value={adminReason}
                    onChange={(e) => {
                      setAdminReason(e.target.value);
                      setActionError('');
                    }}
                    rows={4}
                    className="abr-textarea"
                  />
                  {actionError && <p className="abr-error-text">{actionError}</p>}
                  <div className="abr-actions">
                    <button
                      className="abr-btn"
                      onClick={() => {
                        setIsEditingRemarks(false);
                        setActionError('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="abr-btn abr-btn-success"
                      disabled={submitting}
                      onClick={async () => {
                        const currentStatus = bookingDetails.status;
                        const ok = await handleAction(currentStatus === 'APPROVED' ? 'APPROVE' : 'REJECT');
                        if (ok) {
                          setIsEditingRemarks(false);
                          setToast({ type: 'success', message: 'Remarks updated.' });
                          setTimeout(() => navigate(`/admin/booking?highlight=${bookingDetails.bookingCode}`), 1200);
                        }
                      }}
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {showOverride && isProcessed && !isCancelled && (
            <div className="abr-card">
              <h3>Override Decision</h3>
              <textarea
                value={adminReason}
                onChange={(e) => {
                  setAdminReason(e.target.value);
                  setActionError('');
                }}
                rows={4}
                className="abr-textarea"
                placeholder="Enter override reason"
              />
              {actionError && <p className="abr-error-text">{actionError}</p>}

              <div className="abr-actions">
                <button
                  className="abr-btn"
                  onClick={() => {
                    setShowOverride(false);
                    setAdminReason('');
                    setActionError('');
                  }}
                >
                  Close
                </button>

                {bookingDetails.status === 'REJECTED' && (
                  <button
                    className="abr-btn abr-btn-success"
                    onClick={async () => {
                      const ok = await handleAction('APPROVE');
                      if (ok) setShowOverride(false);
                    }}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Approve Instead'}
                  </button>
                )}

                {bookingDetails.status === 'APPROVED' && (
                  <button
                    className="abr-btn abr-btn-danger"
                    onClick={async () => {
                      const ok = await handleAction('REJECT');
                      if (ok) setShowOverride(false);
                    }}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Reject Instead'}
                  </button>
                )}
              </div>
            </div>
          )}

          {approvedCode && (
            <div className="abr-card abr-success">
              <h3>QR Token Ready</h3>
              <p>Booking {formatCode(approvedCode)} was approved and QR is ready.</p>
              <Link to={`/admin/booking/scanner?booking=${approvedCode}`} className="abr-link-btn">
                <FaQrcode /> Open QR Generator
              </Link>
            </div>
          )}
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </DashboardLayout>
  );
}
