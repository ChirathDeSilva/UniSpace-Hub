/**
 * useAdminBookings.js — Admin Booking List Hook
 *
 * Encapsulates: data fetching, resources map, status filter logic, loading & error state.
 * The AdminBookingDashboard page becomes a pure presentation component
 * by consuming this hook.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminBookings, fetchAllResources } from '../services/bookingService';

export const BOOKING_STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

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

        // Fetch bookings and resources in parallel for efficiency
        const [bookingsResult, resourcesResult] = await Promise.all([
            fetchAdminBookings(),
            fetchAllResources(),
        ]);

        if (bookingsResult.error) {
            setError(bookingsResult.error);
        } else {
            const normalized = (Array.isArray(bookingsResult.data) ? bookingsResult.data : []).map((b) => {
                const facilityId = b?.facilityId ?? b?.resourceId ?? null;
                return { ...b, facilityId, resourceId: facilityId };
            });
            setBookings(normalized);
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
