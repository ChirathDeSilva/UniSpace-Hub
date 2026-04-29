import { useState, useEffect, useCallback } from 'react';
import { fetchAdminBookings, fetchAllResources } from '../services/bookingService';
import { bookingCache } from '../utils/bookingCache';

export const BOOKING_STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

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

/**
 * @returns {{
 *   bookings: Array,
 *   filteredBookings: Array,
 *   resourcesMap: Object,
 *   filter: string,
 *   setFilter: (status: string) => void,
 *   loading: boolean,
 *   error: string|null,
 *   reload: () => void
 * }}
 */
export function useAdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [resourcesMap, setResourcesMap] = useState({});
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Fetch bookings without requiring authentication
        const bookingsResult = await fetchAdminBookings();
        const resourcesResult = await fetchAllResources();

        if (bookingsResult.error) {
            const cachedBookings = readBookingsCache();
            if (cachedBookings.length > 0) {
                setBookings(cachedBookings.map(normalizeBooking));
                setError('Showing cached bookings because live booking data is unavailable.');
            } else {
                setBookings([]);
                setError(bookingsResult.error);
            }
        } else {
            const apiList = (Array.isArray(bookingsResult.data) ? bookingsResult.data : []).map(normalizeBooking);
            const cachedBookings = readBookingsCache();
            const merged = mergeBookings(apiList, cachedBookings);
            setBookings(merged);
        }

        // Build facilityId/resourceId -> name map regardless of booking errors
        const resData = Array.isArray(resourcesResult.data) ? resourcesResult.data : [];
        const map = {};
        resData.forEach((r) => {
            const id = r?.id ?? r?.facilityId ?? r?.resourceId;
            if (id != null) {
                map[String(id)] = r.name;
            }
        });
        setResourcesMap(map);

        // Fallback to cached resources if needed
        if (Object.keys(map).length === 0) {
            const cachedResources = bookingCache.getResources() || [];
            if (cachedResources.length > 0) {
                const fallbackMap = {};
                cachedResources.forEach((resource) => {
                    const id = resource?.id ?? resource?.facilityId ?? resource?.resourceId;
                    if (id != null) {
                        fallbackMap[String(id)] = resource?.name || 'Unnamed Facility';
                    }
                });
                setResourcesMap(fallbackMap);
            }
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Sort bookings: earliest date first, then earliest start time
    const sortedBookings = [...bookings].sort((a, b) => {
        const dateA = new Date(a.bookingDate).getTime();
        const dateB = new Date(b.bookingDate).getTime();
        if (dateA !== dateB) return dateA - dateB;

        // If same date, sort by start time
        return (a.startTime || '').localeCompare(b.startTime || '');
    });

    const filteredBookings = filter === 'ALL'
        ? sortedBookings
        : sortedBookings.filter((b) => b.status === filter);

    return { bookings, filteredBookings, resourcesMap, filter, setFilter, loading, error, reload: load };
}
