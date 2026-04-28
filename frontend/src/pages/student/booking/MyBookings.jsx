import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBookings } from '../../../hooks/useBookings';
import BookingCard from '../../../components/booking/BookingCard';
import SkeletonCard from '../../../components/booking/SkeletonCard';
import Pagination from '../../../components/booking/Pagination';
import './MyBookings.css';

const ITEMS_PER_PAGE = 6;

export default function MyBookings() {
  const { bookings, resourcesMap, isLoading, error, refresh } = useBookings();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const location = useLocation();
  const newBookingCode = location.state?.newBookingCode ?? null;

  useEffect(() => {
    if (!newBookingCode || bookings.length === 0) return;

    const idx = bookings.findIndex((booking) => booking.bookingCode === newBookingCode);
    if (idx === -1) return;

    setCurrentPage(Math.ceil((idx + 1) / ITEMS_PER_PAGE));
  }, [bookings, newBookingCode]);

  const filteredBookings = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return bookings.filter((booking) => {
      const regNumber = booking.studentRegNumber || '';
      const facilityKey = booking.facilityId ?? booking.resourceId;
      const facilityName = resourcesMap[facilityKey] || resourcesMap[String(facilityKey)] || '';

      const matchesSearch =
        regNumber.toLowerCase().includes(query) ||
        facilityName.toLowerCase().includes(query) ||
        String(booking.bookingCode || '').toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, resourcesMap, searchTerm, statusFilter]);

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-card">
        <div className="my-bookings-header">
          <div>
            <p className="my-bookings-kicker">Student Booking Center</p>
            <h1>My Bookings</h1>
          </div>

          <div className="my-bookings-actions">
            <Link to="/student/booking" className="my-bookings-link">Back</Link>
            <Link to="/student/booking/new" className="my-bookings-link my-bookings-link-primary">New Booking</Link>
          </div>
        </div>

        <div className="my-bookings-controls">
          <input
            type="text"
            placeholder="Search by reg number or facility"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="my-bookings-input"
          />

          <div className="my-bookings-filters">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                type="button"
                className={`my-bookings-filter${statusFilter === status ? ' active' : ''}`}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="my-bookings-message my-bookings-message-error">
            <p>{error}</p>
            <button type="button" onClick={refresh}>Retry</button>
          </div>
        )}

        {isLoading && (
          <div className="my-bookings-grid">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!isLoading && bookings.length === 0 && (
          <div className="my-bookings-message">
            <p>No bookings found.</p>
          </div>
        )}

        {!isLoading && filteredBookings.length > 0 && (
          <div className="my-bookings-results">
            <div className="my-bookings-grid">
              {filteredBookings
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((booking) => (
                  <BookingCard
                    key={booking.bookingCode}
                    booking={booking}
                    resourcesMap={resourcesMap}
                    isNew={booking.bookingCode === newBookingCode}
                  />
                ))}
            </div>

            <Pagination
              total={filteredBookings.length}
              pageSize={ITEMS_PER_PAGE}
              current={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
