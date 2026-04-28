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
    <section className="stack reveal" aria-labelledby="my-bookings-title">
      <div className="card stack" style={{ gap: '0.35rem' }}>
        <h1 id="my-bookings-title">My Bookings</h1>
        <p>View and manage all your facility reservations.</p>
        <div className="my-bookings-actions">
          <Link to="/student/booking" className="btn btn-secondary">← Back</Link>
          <Link to="/student/booking/new" className="btn btn-primary">+ New Booking</Link>
        </div>
      </div>

      <div className="card" aria-label="Booking filters">
        <div className="my-bookings-controls">
          <label className="my-bookings-filter-field" htmlFor="booking-search">
            Search
            <input
              id="booking-search"
              type="search"
              placeholder="Search by booking code, facility, or reg number"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="my-bookings-input"
            />
          </label>

          <div className="my-bookings-filter-status">
            <span className="my-bookings-filter-label">Status</span>
            <div className="my-bookings-filters">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`btn btn-secondary ${statusFilter === status ? 'active' : ''}`}
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
        </div>
      </div>

      {error && (
        <div className="card my-bookings-message my-bookings-message-error">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={refresh}>Retry</button>
        </div>
      )}

      {isLoading && (
        <div className="my-bookings-grid">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="card my-bookings-message">
          <p>No bookings found.</p>
        </div>
      )}

      {!isLoading && filteredBookings.length > 0 && (
        <div>
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
    </section>
  );
}
