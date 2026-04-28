import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { bookingCache } from '../utils/bookingCache';
import {
  fetchAllResources,
} from '../services/bookingService';
import httpClient from '../api/httpClient';

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
      // Use DEMO_USER_ID consistent with student booking flow
      // NOTE: Backend falls back to first available user if requested userId doesn't exist
      // User 1 doesn't exist, so bookings are saved to user 2
      const DEMO_USER_ID = 2;
      
      console.log('[useBookings] Starting load for userId:', DEMO_USER_ID);
      
      const [bookingsResult, resourcesResult] = await Promise.all([
        // Use public endpoint: GET /api/bookings?userId={userId}
        httpClient.get(`/api/bookings?userId=${DEMO_USER_ID}`)
          .then(response => {
            console.log('[useBookings] API response:', response.data);
            return { data: response.data };
          })
          .catch(err => {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to fetch bookings';
            console.error('[useBookings] API error:', errorMsg);
            return { data: null, error: errorMsg };
          }),
        fetchAllResources(),
      ]);

      console.log('[useBookings] bookingsResult:', bookingsResult);

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

        console.log('[useBookings] Normalized bookings:', bookingsData);
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
