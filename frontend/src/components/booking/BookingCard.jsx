import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate } from 'react-icons/fa';
import BookingStatusBadge from './BookingStatusBadge';
import { formatTime, formatDate, formatCode } from '../../utils/formatters';
import './BookingCard.css';

export default function BookingCard({ booking, resourcesMap, isNew = false }) {
  const facilityKey = booking.facilityId ?? booking.resourceId;
  const facilityName = resourcesMap[facilityKey] || resourcesMap[String(facilityKey)] || facilityKey || 'Facility Booking';

  return (
    <Link to={`/student/booking/${booking.bookingCode}`} className={`booking-card${isNew ? ' booking-card-new' : ''}`}>
      <div className="booking-card-glow" />

      <div className="booking-card-body">
        <div className="booking-card-top">
          <BookingStatusBadge status={booking.status} />
          <span className="booking-card-id">ID: {formatCode(booking.bookingCode)}</span>
        </div>

        <h3 className="booking-card-title" title={facilityName}>{facilityName}</h3>
        <p className="booking-card-subtitle"><FaMapMarkerAlt /> Main Campus Hub</p>

        <div className="booking-card-identity">
          <div className="booking-card-avatar"><FaUserGraduate /></div>
          <div>
            <p className="booking-card-label">Requester Identity</p>
            <p className="booking-card-identity-line">
              {booking.studentRegNumber || '—'} <span>|</span> {booking.studentName || 'Anonymous'}
            </p>
          </div>
        </div>

        <div className="booking-card-dates">
          <div className="booking-card-row">
            <FaCalendarAlt />
            <div>
              <p>Reservation Date</p>
              <strong>{formatDate(booking.bookingDate)}</strong>
            </div>
          </div>
          <div className="booking-card-row">
            <FaClock />
            <div>
              <p>Time Slot</p>
              <strong>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="booking-card-footer">VIEW RESERVATION</div>
    </Link>
  );
}
