import httpClient from '../api/httpClient'

export async function fetchNotifications(userId) {
  const res = await httpClient.get('/api/notifications', {
    params: { userId },
  })
  return res.data // plain array, LIFO sorted by backend
}

export async function fetchUnreadCount(userId) {
  const res = await httpClient.get('/api/notifications/count', {
    params: { userId },
  })
  return res.data
}

export async function markNotificationRead(id) {
  await httpClient.patch(`/api/notifications/${id}/read`)
}

export async function markAllNotificationsRead(userId) {
  await httpClient.post('/api/notifications/mark-all-read', null, {
    params: { userId },
  })
}
