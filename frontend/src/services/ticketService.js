import httpClient from '../api/httpClient'

export async function getSlaDashboardTickets(userId) {
  const response = await httpClient.get('/api/tickets/sla-dashboard', {
    params: { userId },
  })
  return response.data
}
