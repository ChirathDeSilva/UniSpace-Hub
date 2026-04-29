import httpClient from '../api/httpClient'

/**
 * Fetch the full profile of the currently authenticated user.
 * @returns {Promise<UserProfileDto>}
 */
export async function getProfile() {
  const res = await httpClient.get('/api/user/profile')
  return res.data
}

/**
 * Update the profile fields. Only non-null fields are applied server-side.
 * @param {Partial<ProfileUpdateRequest>} data
 * @returns {Promise<UserProfileDto>} — the updated profile
 */
export async function updateProfile(data) {
  const res = await httpClient.put('/api/user/profile', data)
  return res.data
}

/**
 * Fetch the 5 most recent bookings for the authenticated user.
 * Used in the student profile "Space Usage Summary" widget.
 * @returns {Promise<Array>}
 */
export async function getRecentBookings() {
  const res = await httpClient.get('/api/user/bookings/recent')
  return res.data
}
