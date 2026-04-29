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

const mergeBookings = (apiList, cachedList) => {
  const map = {};
  (apiList || []).forEach((b) => {
    const code = String(b.bookingCode || b.id || '');
    if (!code) return;
    map[code] = b;
  });

  (cachedList || []).forEach((cb) => {
    const code = String(cb.bookingCode || cb.id || '');
    if (!code) return;
    const existing = map[code];
    if (!existing) {
      map[code] = cb;
      return;
    }

    const apiUpdated = existing.updatedAt ? Date.parse(existing.updatedAt) : 0;
    const cachedUpdated = cb.updatedAt ? Date.parse(cb.updatedAt) : 0;

    if (cachedUpdated > apiUpdated) {
      map[code] = cb;
    } else if (!existing.updatedAt && cb.updatedAt) {
      map[code] = cb;
    } else if ((cb.status && cb.status !== existing.status) && cb.updatedAt) {
      map[code] = cb;
    }
  });

  return Object.values(map).map(normalizeBooking);
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
      // Fetch bookings and resources without authentication
      const [bookingsResult, resourcesResult] = await Promise.all([
        fetchAdminBookings(),
        fetchAllResources(),
      ]);

      const apiList = Array.isArray(bookingsResult?.data)
        ? bookingsResult.data.map(normalizeBooking)
        : [];
      const cached = readBookingsCache().map(normalizeBooking);
      const bookingsData = mergeBookings(apiList, cached);

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
