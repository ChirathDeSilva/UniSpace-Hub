import httpClient from '../api/httpClient'

function normalizeUser(user) {
  if (!user) {
    return { id: null, name: '' }
  }

  return {
    id: user.id ?? user.userId ?? null,
    name: user.fullName ?? user.name ?? '',
  }
}

function normalizeFacility(facility) {
  if (!facility) {
    return null
  }

  return {
    id: facility.id ?? null,
    name: facility.name ?? '',
    status: facility.status ?? '',
    location: facility.location ?? '',
  }
}

function normalizeTicket(data) {
  const createdBy = normalizeUser(data?.createdBy)
  const assignedTo = normalizeUser(data?.assignedTo)

  return {
    id: data?.id ?? null,
    title: data?.title ?? '',
    description: data?.description ?? '',
    category: (data?.category ?? '').toUpperCase(),
    priority: (data?.priority ?? '').toUpperCase(),
    status: (data?.status ?? 'NEW').toUpperCase(),
    slaStatus: data?.slaStatus ?? null,
    slaDeadline: data?.slaDeadline ?? null,
    location: data?.location ?? '',
    contactDetails: data?.contactDetails ?? '',
    createdAt: data?.createdAt ?? '',
    updatedAt: data?.updatedAt ?? '',
    createdBy,
    assignedTechnicianId: assignedTo.id,
    assignedTechnicianName: assignedTo.name,
    facility: normalizeFacility(data?.facility),
  }
}

function normalizeComment(comment) {
  const author = normalizeUser(comment?.user)

  return {
    id: comment?.id ?? null,
    author: author.name,
    text: comment?.message ?? '',
    createdAt: comment?.createdAt ?? '',
  }
}

function normalizeAttachment(attachment) {
  return {
    id: attachment?.id ?? null,
    fileName: attachment?.fileName ?? '',
    filePath: attachment?.filePath ?? '',
    fileType: attachment?.fileType ?? '',
    fileSize: attachment?.fileSize ?? 0,
  }
}

export async function getTickets() {
  const response = await httpClient.get('/api/tickets')
  if (!Array.isArray(response.data)) {
    return []
  }

  return response.data.map((ticket) => normalizeTicket(ticket))
}

export async function getTicketById(id) {
  const response = await httpClient.get(`/api/tickets/${id}`)
  return normalizeTicket(response.data)
}

export async function createTicket(payload) {
  const response = await httpClient.post('/api/tickets', payload)
  return normalizeTicket(response.data)
}

export async function updateTicketByOwner(id, payload) {
  const response = await httpClient.put(`/api/tickets/${id}/update`, payload)
  return normalizeTicket(response.data)
}

export async function cancelTicketByOwner(id, userId) {
  const response = await httpClient.put(`/api/tickets/${id}/cancel`, { userId })
  return normalizeTicket(response.data)
}

export async function deleteTicket(id) {
  await httpClient.delete(`/api/tickets/${id}`)
}

export async function claimTicket(id, technicianId) {
  const response = await httpClient.put(`/api/tickets/${id}/claim`, { technicianId })
  return normalizeTicket(response.data)
}

export async function updateTicketStatus(id, status, technicianId, reason) {
  const response = await httpClient.put(`/api/tickets/${id}/status`, {
    status,
    technicianId,
    reason,
  })
  return normalizeTicket(response.data)
}

export async function updateTicketFacilityStatus(id, actorUserId, facilityStatus, note) {
  const response = await httpClient.put(`/api/tickets/${id}/facility-status`, {
    actorUserId,
    facilityStatus,
    note,
  })
  return normalizeTicket(response.data)
}

export async function getTicketComments(ticketId) {
  const response = await httpClient.get(`/api/comments/${ticketId}`)
  if (!Array.isArray(response.data)) {
    return []
  }

  return response.data.map((comment) => normalizeComment(comment))
}

export async function addTicketComment(ticketId, userId, message) {
  const response = await httpClient.post('/api/comments', {
    ticketId,
    userId,
    message,
  })
  return normalizeComment(response.data)
}

export async function getTicketAttachments(ticketId) {
  const response = await httpClient.get(`/api/attachments/${ticketId}`)
  if (!Array.isArray(response.data)) {
    return []
  }

  return response.data.map((attachment) => normalizeAttachment(attachment))
}

export async function addTicketAttachment(ticketId, file) {
  const formData = new FormData()
  formData.append('ticketId', String(ticketId))
  formData.append('file', file)

  const response = await httpClient.post('/api/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return normalizeAttachment(response.data)
}

export async function deleteTicketAttachment(attachmentId) {
  await httpClient.delete(`/api/attachments/${attachmentId}`)
}

export async function getSlaDashboardTickets(userId) {
  const response = await httpClient.get('/api/tickets/sla-dashboard', {
    params: { userId },
  })
  if (!Array.isArray(response.data)) {
    return []
  }
  return response.data.map((ticket) => normalizeTicket(ticket))
}
