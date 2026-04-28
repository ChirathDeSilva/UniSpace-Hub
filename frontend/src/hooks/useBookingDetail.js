import { useCallback, useEffect, useState } from 'react';
import { fetchAdminBookings, fetchAllResources } from '../services/bookingService';
import { bookingCache } from '../utils/bookingCache';

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

const normalizeBooking = (booking) => {
  const facilityId = booking?.facilityId ?? booking?.resourceId ?? null;
  return {
    ...booking,
    facilityId,
    resourceId: facilityId,
  };
};

export function useBookingDetail(bookingCode) {
  const [booking, setBooking] = useState(null);
  const [resourceDetails, setResourceDetails] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [bookingsResult, resourcesResult] = await Promise.all([
        fetchAdminBookings(),
        fetchAllResources(),
      ]);

      const bookingsData = Array.isArray(bookingsResult?.data)
        ? bookingsResult.data.map(normalizeBooking)
        : readBookingsCache().map(normalizeBooking);

      const current = bookingsData.find((b) => String(b.bookingCode) === String(bookingCode));

      if (!current) {
        setBooking(null);
        setResourceDetails(null);
        setQrToken('');
        setError('Booking not found.');
        return;
      }

      const resourcesData = Array.isArray(resourcesResult?.data)
        ? resourcesResult.data
        : (bookingCache.getResources() || []);

      const facility = resourcesData.find(
        (resource) => String(resource.id) === String(current.facilityId),
      ) || null;

      setBooking(current);
      setResourceDetails(facility);
      setQrToken(current.qrToken || '');
    } finally {
      setIsLoading(false);
    }
  }, [bookingCode]);

  useEffect(() => {
    load();
  }, [load, bookingCode]);

  return {
    booking,
    resourceDetails,
    qrToken,
    isLoading,
    error,
    refetch: load,
  };
}
