import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendarCheck, FaChevronLeft, FaChevronRight, FaClipboardCheck, FaEdit, FaExclamationTriangle, FaInbox, FaQrcode, FaSearch } from 'react-icons/fa';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useAdminBookings, BOOKING_STATUSES } from '../../../hooks/useAdminBookings';
import { formatCode, formatDate, formatTime } from '../../../utils/formatters';
import './AdminBookingDashboard.css';

const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  return <span className={`adb-badge adb-${status || 'PENDING'}`}>{status}</span>;
}

function StatCard({ label, value }) {
  return (
    <div className="adb-stat-card">
      <div className="adb-stat-value">{value}</div>
      <div className="adb-stat-label">{label}</div>
    </div>
  );
}

export default function AdminBookingDashboard() {
  const { bookings, filteredBookings, resourcesMap, setFilter, loading, error } = useAdminBookings();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [highlightedCode, setHighlightedCode] = useState(null);
  const location = useLocation();
  const rowRefs = useRef({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('highlight');
    if (code) {
      setFilter('ALL');
      setSearch(code);
      setHighlightedCode(code);
      const timer = setTimeout(() => setHighlightedCode(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.search, setFilter]);

  useEffect(() => {
    if (highlightedCode && rowRefs.current[highlightedCode]) {
      const timer = setTimeout(() => {
        rowRefs.current[highlightedCode].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [highlightedCode]);

  const counts = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    approved: bookings.filter((b) => b.status === 'APPROVED').length,
    rejected: bookings.filter((b) => b.status === 'REJECTED').length,
  }), [bookings]);

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredBookings;

    return filteredBookings.filter((b) =>
      String(b.bookingCode || '').toLowerCase().includes(q) ||
      String(resourcesMap[String(b.facilityId)] || '').toLowerCase().includes(q) ||
      String(b.studentRegNumber || '').toLowerCase().includes(q) ||
      String(b.studentName || '').toLowerCase().includes(q) ||
      String(b.userId || '').toLowerCase().includes(q),
    );
  }, [filteredBookings, resourcesMap, search]);

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = searched.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <DashboardLayout title="Booking Management">
      <div className="adb-page">
        <div className="adb-container">
          <div className="adb-header">
            <div>
              <p className="adb-kicker">Admin booking dashboard</p>
              <h1>Reservation Log</h1>
            </div>
          </div>

          <div className="adb-stats">
            <StatCard label="Total Reservations" value={counts.total} />
            <StatCard label="Pending Review" value={counts.pending} />
            <StatCard label="Approved" value={counts.approved} />
            <StatCard label="Rejected" value={counts.rejected} />
          </div>

          <div className="adb-toolbar">
            <div className="adb-filters">
              {BOOKING_STATUSES.map((status) => (
                <button key={status} type="button" className="adb-filter-btn" onClick={() => { setFilter(status); setPage(1); }}>
                  {status}
                </button>
              ))}
            </div>

            <div className="adb-search">
              <FaSearch />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by code, name, or facility"
              />
            </div>
          </div>

          {loading && <div className="adb-message">Loading reservations...</div>}

          {error && (
            <div className="adb-message adb-message-error">
              <FaExclamationTriangle />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="adb-table-wrap">
              <div className="adb-results-summary">Showing {searched.length} results</div>

              <table className="adb-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Booking ID</th>
                    <th>Student Reg ID</th>
                    <th>Facility</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>QR Code</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="adb-empty">
                        <FaInbox /> No reservations found
                      </td>
                    </tr>
                  ) : pageSlice.map((booking) => {
                    const isPending = booking.status === 'PENDING';
                    const isApproved = booking.status === 'APPROVED';
                    const facilityName = resourcesMap[String(booking.facilityId)] || booking.facilityId;

                    return (
                      <tr key={booking.bookingCode} ref={(el) => { rowRefs.current[booking.bookingCode] = el; }} className={highlightedCode === booking.bookingCode ? 'adb-highlight' : ''}>
                        <td><StatusBadge status={booking.status} /></td>
                        <td>{formatCode(booking.bookingCode)}</td>
                        <td>{booking.studentRegNumber || '—'}</td>
                        <td>{facilityName}</td>
                        <td>{formatDate(booking.bookingDate)}</td>
                        <td>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</td>
                        <td>
                          {isApproved ? (
                            <Link to={`/admin/booking/scanner?booking=${booking.bookingCode}`} className="adb-link"> <FaQrcode /> View QR </Link>
                          ) : '—'}
                        </td>
                        <td>
                          {isPending ? (
                            <Link to={`/admin/booking/review/${booking.bookingCode}`} className="adb-link"><FaClipboardCheck /> Review</Link>
                          ) : booking.status === 'CANCELLED' ? (
                            <Link to={`/admin/booking/review/${booking.bookingCode}`} className="adb-link"><FaSearch /> View</Link>
                          ) : (
                            <Link to={`/admin/booking/review/${booking.bookingCode}`} className="adb-link"><FaEdit /> Update</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="adb-pagination">
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                    <FaChevronLeft />
                  </button>
                  <span>Page {safePage} of {totalPages}</span>
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
