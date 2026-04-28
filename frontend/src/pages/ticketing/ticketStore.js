export const STATUS = {
  NEW: 'NEW',
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED',
}

export const statusMeta = {
  [STATUS.NEW]: { label: 'New', className: 'ticket-status-new' },
  [STATUS.OPEN]: { label: 'Open', className: 'ticket-status-open' },
  [STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'ticket-status-in-progress',
  },
  [STATUS.RESOLVED]: { label: 'Resolved', className: 'ticket-status-resolved' },
  [STATUS.REJECTED]: { label: 'Rejected', className: 'ticket-status-rejected' },
  [STATUS.CANCELLED]: { label: 'Cancelled', className: 'ticket-status-cancelled' },
  [STATUS.CLOSED]: { label: 'Closed', className: 'ticket-status-closed' },
}

export const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
export const categories = ['ELECTRICAL', 'PLUMBING', 'CLEANING', 'IT', 'OTHER']

export function formatStatus(status) {
  return statusMeta[status]?.label || status
}

export function statusClass(status) {
  return statusMeta[status]?.className || 'ticket-status-open'
}
