import React from 'react';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import './BookingStatusBadge.css';

export default function BookingStatusBadge({ status, className = '' }) {
  const normalized = status || 'PENDING';
  const tone = normalized === 'APPROVED' ? 'approved' : normalized === 'REJECTED' ? 'rejected' : normalized === 'CANCELLED' ? 'cancelled' : 'pending';
  const icon = normalized === 'APPROVED' ? <FaCheckCircle /> : normalized === 'REJECTED' ? <FaTimesCircle /> : normalized === 'CANCELLED' ? <FaTimesCircle /> : <FaHourglassHalf />;

  return (
    <span className={`booking-status-badge booking-status-${tone} ${className}`.trim()}>
      {icon}
      <span>{normalized}</span>
    </span>
  );
}
