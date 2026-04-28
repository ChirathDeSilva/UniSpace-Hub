import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaMapMarkerAlt, FaTimesCircle, FaUserGraduate, FaUsers } from 'react-icons/fa';
import httpClient from '../../../api/httpClient';
import { formatDate, formatTime } from '../../../utils/formatters';
import './VerifyBooking.css';

export default function VerifyBooking() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        let data = null;

        try {
          const res = await httpClient.get(`/api/bookings/verify/${token}`);
          data = res.data;
        } catch {
          try {
            const res = await httpClient.post('/api/admin/bookings/check-ins', { qrToken: token });
            data = res.data;
          } catch {
            const res = await httpClient.post('/api/admin/bookings/verify-qr', { qrToken: token });
            data = res.data;
          }
        }

        if (!data) {
          throw new Error('Invalid Token');
        }

        setBooking(data);
        setStatus('success');
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const venueName = booking?.facilityName || booking?.facilityId || booking?.resourceId || '-';

  return (
    <div className="verify-page">
      <div className="verify-glow verify-glow-left" />
      <div className="verify-glow verify-glow-right" />

      <div className="verify-card">
        <div className={`verify-header verify-${status}`}>
          {status === 'loading' && <div className="verify-spinner" />}
          {status === 'success' && <FaCheckCircle className="verify-status-icon" />}
          {status === 'error' && <FaTimesCircle className="verify-status-icon" />}

          <h1>
            {status === 'success' ? 'Access Granted' : status === 'error' ? 'Verification Failed' : 'Verifying'}
          </h1>
          <p>
            {status === 'success'
              ? 'Verified by CampusNexus Authentication'
              : status === 'error'
                ? 'Invalid or expired QR token'
                : 'Checking token status...'}
          </p>
        </div>

        {status === 'success' && booking && (
          <div className="verify-body">
            <div className="verify-panel">
              <p className="verify-label">Authorized Student</p>
              <h2>{booking.studentName || 'Authenticated User'}</h2>
              <p className="verify-mono">{booking.studentRegNumber || 'REG-ID-PENDING'}</p>
            </div>

            <div className="verify-grid">
              <div className="verify-box">
                <p className="verify-subtitle"><FaCalendarAlt /> Date</p>
                <p>{formatDate(booking.bookingDate)}</p>
              </div>
              <div className="verify-box">
                <p className="verify-subtitle"><FaUsers /> Attendees</p>
                <p>{booking.expectedAttendees} <span>People</span></p>
              </div>
              <div className="verify-box verify-venue">
                <p className="verify-subtitle"><FaMapMarkerAlt /> Confirmed Venue</p>
                <p>{venueName}</p>
              </div>
            </div>

            <div className="verify-time">
              <div>
                <p className="verify-subtitle"><FaClock /> Check-In Window</p>
                <div className="verify-time-row">
                  <span>{formatTime(booking.startTime)}</span>
                  <span>to</span>
                  <span>{formatTime(booking.endTime)}</span>
                </div>
              </div>
            </div>

            <div className="verify-purpose">
              <p className="verify-label">Scheduled Activity</p>
              <p>{booking.purpose || '-'}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-error-body">
            <p>
              This QR code has either expired, been cancelled, or is invalid. Please contact support if you believe this is an error.
            </p>
            <Link to="/login" className="verify-link-btn">Return to Portal</Link>
          </div>
        )}

        <div className="verify-footer">
          <FaUserGraduate />
          <span>Official CampusNexus Verification Layer</span>
        </div>
      </div>

      <Link to="/" className="verify-exit-link">Exit Secure Verification</Link>
    </div>
  );
}
