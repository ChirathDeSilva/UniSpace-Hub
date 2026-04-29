/**
 * bookingService.js
 * API service for booking-related operations
 */

import httpClient from '../api/httpClient';

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

/**
 * Fetch all available resources/facilities
 * @returns {Promise} Resources array
 */
export const fetchAllResources = async () => {
  try {
    const response = await httpClient.get('/api/facilities');
    return { data: response.data };
  } catch (error) {
    return { data: null, error: getErrorMessage(error, 'Failed to fetch facilities') };
  }
};

/**
 * Fetch user profile information
 * @returns {Promise} User profile object
 */
export const fetchUserProfile = async () => {
  try {
    const response = await httpClient.get('/api/users/me');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: getErrorMessage(error, 'Failed to fetch profile') };
  }
};

/**
 * Create a new booking
 * @param {Object} payload - Booking data
 * @returns {Promise} Created booking object
 */
export const createBooking = async (payload) => {
  try {
    const response = await httpClient.post('/api/bookings', payload);
    return { data: response.data };
  } catch (error) {
    console.error('Error creating booking:', error);
    const status = error?.response?.status;
    const body = error?.response?.data;
    const errorMsg = getErrorMessage(error, 'Failed to create booking');
    console.error('Booking error details - Status:', status, 'Body:', body);
    return { data: null, error: errorMsg, status, errorDetails: body };
  }
};

/**
 * Fetch all bookings (admin view)
 * @returns {Promise} Array of bookings
 */
export const fetchAdminBookings = async () => {
  try {
    const response = await httpClient.get('/api/admin/bookings');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return { data: null, error: getErrorMessage(error, 'Failed to fetch admin bookings') };
  }
};

/**
 * Fetch admin review details for one booking
 * @param {String} bookingCode - Booking code
 * @returns {Promise} Review payload
 */
export const fetchAdminBookingReview = async (bookingCode) => {
  try {
    const response = await httpClient.get(`/api/admin/bookings/${bookingCode}/review`);
    return { data: response.data };
  } catch (error) {
    return { data: null, error: getErrorMessage(error, 'Failed to fetch booking review details') };
  }
};

/**
 * Approve booking as admin
 * @param {String} bookingCode - Booking code
 * @param {String|Number} adminId - Acting admin identifier
 * @param {String} reason - Optional decision remarks
 * @returns {Promise} Updated booking
 */
export const approveBooking = async (bookingCode, adminId, reason = '') => {
  try {
    const payload = {
      approvedBy: String(adminId ?? 'SYSTEM'),
      adminDecisionReason: reason || '',
    };
    const response = await httpClient.patch(`/api/admin/bookings/${bookingCode}/approve`, payload);
    return { data: response.data };
  } catch (error) {
    return { data: null, error: getErrorMessage(error, 'Failed to approve booking') };
  }
};

/**
 * Reject booking as admin
 * @param {String} bookingCode - Booking code
 * @param {String|Number} adminId - Acting admin identifier
 * @param {String} reason - Rejection reason (required by backend)
 * @returns {Promise} Updated booking
 */
export const rejectBooking = async (bookingCode, adminId, reason) => {
  try {
    const payload = {
      rejectedBy: String(adminId ?? 'SYSTEM'),
      adminDecisionReason: reason || 'Rejected by admin',
    };
    const response = await httpClient.patch(`/api/admin/bookings/${bookingCode}/reject`, payload);
    return { data: response.data };
  } catch (error) {
    return { data: null, error: getErrorMessage(error, 'Failed to reject booking') };
  }
};

/**
 * Best-effort admin identifier from stored access token
 * @returns {String}
 */
export const getAdminIdFromToken = () => {
  try {
    const token =
      localStorage.getItem('ush_access_token') ||
      localStorage.getItem('token') ||
      '';

    if (!token) return 'SYSTEM';

    const payloadPart = token.split('.')[1];
    if (!payloadPart) return 'SYSTEM';

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    const payload = JSON.parse(decoded);

    return String(payload.userId ?? payload.id ?? payload.uid ?? payload.sub ?? 'SYSTEM');
  } catch {
    return 'SYSTEM';
  }
};

/**
 * Fetch user's own bookings
 * @returns {Promise} Array of user bookings
 */
export const fetchUserBookings = async () => {
  try {
    const response = await httpClient.get('/api/bookings/user');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return { data: null, error: getErrorMessage(error, 'Failed to fetch user bookings') };
  }
};

/**
 * Update a booking
 * @param {Number} bookingId - Booking ID
 * @param {Object} payload - Updated booking data
 * @returns {Promise} Updated booking object
 */
export const updateBooking = async (bookingId, payload) => {
  try {
    const response = await httpClient.put(`/api/bookings/${bookingId}`, payload);
    return { data: response.data };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { data: null, error: getErrorMessage(error, 'Failed to update booking') };
  }
};

/**
 * Cancel a booking
 * @param {Number} bookingId - Booking ID
 * @returns {Promise} Cancellation response
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await httpClient.patch(`/api/bookings/${bookingId}/cancel`);
    return { data: response.data };
  } catch (error) {
    console.error('Error canceling booking:', error);
    return { data: null, error: getErrorMessage(error, 'Failed to cancel booking') };
  }
};
