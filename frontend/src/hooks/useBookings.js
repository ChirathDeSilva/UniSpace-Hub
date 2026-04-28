import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingCache } from '../utils/bookingCache';
import {
  fetchAllResources,
  fetchUserBookings,
} from '../services/bookingService';
import { getAccessToken } from '../services/authStorage';

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
    // Ignore storage write issues in private mode / strict browsers.
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

const getUserIdFromToken = () => {
  try {
    const token = getAccessToken();
    if (!token) return null;

    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    const payload = JSON.parse(decoded);
    const rawUserId = payload.userId ?? payload.id ?? payload.uid ?? payload.sub ?? null;
    if (rawUserId == null) return null;

    const parsed = Number(rawUserId);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const toResourcesMap = (resources) => {
  const map = {};
  resources.forEach((resource) => {
    const id = resource?.id ?? resource?.facilityId ?? resource?.resourceId;
    if (id != null) {
      map[id] = resource?.name || 'Unnamed Facility';
    }
  });
  return map;
};

export function useBookings() {
  const [bookings, setBookings] = useState(() => readBookingsCache());
  const [resourcesMap, setResourcesMap] = useState(() => {
    const cachedResources = bookingCache.getResources() || [];
    return toResourcesMap(cachedResources);
  });
  const [isLoading, setIsLoading] = useState(() => readBookingsCache().length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    else setIsRefreshing(true);
    setError('');

    try {
      const userId = getUserIdFromToken();
      const [bookingsResult, resourcesResult] = await Promise.all([
        userId ? fetchUserBookings(userId) : Promise.resolve({ data: [], error: 'Missing user id' }),
        fetchAllResources(),
      ]);

      if (bookingsResult?.error) {
        const cachedBookings = readBookingsCache();
        if (cachedBookings.length > 0) {
          setBookings(cachedBookings);
          setError('Showing cached bookings because live booking API is unavailable.');
        } else {
          setError(bookingsResult.error);
        }
      } else {
        const bookingsData = Array.isArray(bookingsResult?.data)
          ? bookingsResult.data.map(normalizeBooking)
          : [];

        setBookings(bookingsData);
        writeBookingsCache(bookingsData);
      }

      if (!resourcesResult?.error) {
        const resourcesData = Array.isArray(resourcesResult?.data) ? resourcesResult.data : [];
        bookingCache.setResources(resourcesData);
        setResourcesMap(toResourcesMap(resourcesData));
      } else {
        const cachedResources = bookingCache.getResources() || [];
        setResourcesMap(toResourcesMap(cachedResources));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const hasCachedData = readBookingsCache().length > 0;
    if (hasCachedData) {
      load(true);
    } else {
      load(false);
    }
  }, [load, location.pathname]);

  return {
    bookings,
    resourcesMap,
    isLoading,
    isRefreshing,
    error,
    refresh: () => load(false),
  };
}
