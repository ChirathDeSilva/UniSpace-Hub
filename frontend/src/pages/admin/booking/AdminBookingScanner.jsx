import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaArrowLeft, FaQrcode, FaSave, FaSearch } from 'react-icons/fa';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useAdminBookings } from '../../../hooks/useAdminBookings';
import { formatCode, formatDate, formatTime } from '../../../utils/formatters';
import './AdminBookingScanner.css';

function SingleBookingQR({ booking, resourcesMap }) {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(true);

  const qrValue = `CHECKIN_TOKEN:${booking.qrToken || booking.bookingCode}`;
  const facilityName = resourcesMap[String(booking.facilityId)] || `#${booking.facilityId}`;

  return (
    <div className="abs-card">
      <h3>{formatCode(booking.bookingCode)}</h3>
      <p><strong>Facility:</strong> {facilityName}</p>
      <p><strong>Date:</strong> {formatDate(booking.bookingDate)}</p>
      <p><strong>Time:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>

      {showQR ? (
        <div className="abs-qr-wrap">
          <QRCodeSVG value={qrValue} size={220} bgColor="#ffffff" fgColor="#111111" level="H" includeMargin={false} />
        </div>
      ) : (
        <p className="abs-muted">QR hidden.</p>
      )}

      <div className="abs-actions">
        <button className="abs-btn" onClick={() => setShowQR((prev) => !prev)}>
          <FaQrcode /> {showQR ? 'Hide QR' : 'Show QR'}
        </button>
        <button className="abs-btn abs-btn-primary" onClick={() => navigate(`/admin/booking?highlight=${booking.bookingCode}`)}>
          <FaSave /> Save and Back
        </button>
      </div>
    </div>
  );
}

export default function AdminBookingScanner() {
  const { bookings, resourcesMap, loading } = useAdminBookings();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [doneCodes, setDoneCodes] = useState(new Set());

  const targetCode = searchParams.get('booking');

  const approvedBookings = useMemo(() => bookings.filter((b) => b.status === 'APPROVED'), [bookings]);

  const singleBooking = useMemo(() => {
    if (!targetCode) return null;
    return approvedBookings.find((b) => b.bookingCode === targetCode) || null;
  }, [approvedBookings, targetCode]);

  const pendingBookings = useMemo(
    () => approvedBookings.filter((b) => !doneCodes.has(b.bookingCode)),
    [approvedBookings, doneCodes],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pendingBookings;

    return pendingBookings.filter((b) => {
      const facilityName = resourcesMap[String(b.facilityId)] || '';
      return (
        String(b.bookingCode).toLowerCase().includes(q) ||
        facilityName.toLowerCase().includes(q) ||
        String(formatDate(b.bookingDate)).toLowerCase().includes(q)
      );
    });
  }, [pendingBookings, resourcesMap, search]);

  const qrValue = selected ? `CHECKIN_TOKEN:${selected.qrToken || selected.bookingCode}` : '';

  const handleSave = () => {
    if (selected) {
      setDoneCodes((prev) => new Set([...prev, selected.bookingCode]));
      navigate(`/admin/booking?highlight=${selected.bookingCode}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="QR Code Generator">
        <div className="abs-page">
          <div className="abs-card abs-center">Loading approved bookings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="QR Code Generator">
      <div className="abs-page">
        <div className="abs-container">
          <Link to="/admin/booking" className="abs-back-link">
            <FaArrowLeft /> Back to Booking Log
          </Link>

          <h2 className="abs-title">QR Code Generator</h2>

          {singleBooking ? (
            <SingleBookingQR booking={singleBooking} resourcesMap={resourcesMap} />
          ) : targetCode && !singleBooking ? (
            <div className="abs-card abs-center">
              <p>Booking not found or not approved.</p>
              <Link to="/admin/booking" className="abs-btn abs-btn-primary">Back</Link>
            </div>
          ) : (
            <div className="abs-grid">
              <div className="abs-card">
                <h3>Approved Bookings</h3>
                <p className="abs-muted">Pending QR: {pendingBookings.length}</p>

                <div className="abs-search-wrap">
                  <FaSearch />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search code, facility, date"
                    className="abs-input"
                  />
                </div>

                <div className="abs-list">
                  {filtered.length === 0 ? (
                    <p className="abs-muted">No bookings found.</p>
                  ) : (
                    filtered.map((b) => {
                      const active = selected?.bookingCode === b.bookingCode;
                      return (
                        <button
                          type="button"
                          key={b.bookingCode}
                          className={`abs-list-item${active ? ' active' : ''}`}
                          onClick={() => {
                            setSelected(b);
                            setShowQR(false);
                          }}
                        >
                          <span>{formatCode(b.bookingCode)}</span>
                          <small>{resourcesMap[String(b.facilityId)] || `#${b.facilityId}`}</small>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="abs-card">
                {!selected ? (
                  <p className="abs-muted">Select a booking to generate QR.</p>
                ) : (
                  <>
                    <h3>{formatCode(selected.bookingCode)}</h3>
                    <p><strong>Facility:</strong> {resourcesMap[String(selected.facilityId)] || `#${selected.facilityId}`}</p>
                    <p><strong>Date:</strong> {formatDate(selected.bookingDate)}</p>
                    <p><strong>Time:</strong> {formatTime(selected.startTime)} - {formatTime(selected.endTime)}</p>

                    {showQR ? (
                      <div className="abs-qr-wrap">
                        <QRCodeSVG value={qrValue} size={200} bgColor="#ffffff" fgColor="#111111" level="H" includeMargin={false} />
                      </div>
                    ) : (
                      <p className="abs-muted">Click generate to show QR.</p>
                    )}

                    <div className="abs-actions">
                      <button className="abs-btn" onClick={() => setShowQR((prev) => !prev)}>
                        <FaQrcode /> {showQR ? 'Hide QR' : 'Generate QR'}
                      </button>
                      <button className="abs-btn abs-btn-primary" onClick={handleSave}>
                        <FaSave /> Save and Back
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
