const STORAGE_KEY = 'ush_tickets'

export const STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  CLOSED: 'CLOSED',
}

export const statusMeta = {
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

export const priorities = ['LOW', 'MEDIUM', 'HIGH']
export const categories = ['IT Issue', 'Facility', 'Academic', 'Other']

export const currentUser = {
  id: 'STU-2026-009',
  name: 'Gayan chinthaka',
  role: 'student',
}

export const currentTechnician = {
  id: 'TECH-001',
  name: 'Nuwan Silva',
}

const seedTickets = [
  {
    id: 'TK-2101',
    title: 'Wi-Fi unstable in lecture hall A2',
    description:
      'Network disconnects every 10 minutes during classes and reconnects automatically.',
    category: 'IT Issue',
    priority: 'HIGH',
    status: STATUS.OPEN,
    assignedTechnicianId: 'TECH-001',
    assignedTechnicianName: 'Nuwan Silva',
    facility: { name: 'Lecture Hall A2', status: 'Needs inspection' },
    createdAt: '2026-04-24',
    createdBy: { id: 'STU-2026-009', name: 'Ishoda Senarath' },
    attachments: ['wifi-error.png'],
    comments: [
      {
        id: 'C-1',
        author: 'System',
        text: 'Ticket submitted successfully.',
        createdAt: '2026-04-24 09:10',
      },
    ],
  },
  {
    id: 'TK-2102',
    title: 'Projector not turning on',
    description: 'Projector in Lab B3 does not power on and shows warning light.',
    category: 'Facility',
    priority: 'MEDIUM',
    status: STATUS.IN_PROGRESS,
    assignedTechnicianId: 'TECH-001',
    assignedTechnicianName: 'Nuwan Silva',
    facility: { name: 'Lab B3', status: 'Under maintenance' },
    createdAt: '2026-04-22',
    createdBy: { id: 'LEC-1002', name: 'Dr. Perera' },
    attachments: ['projector.jpg'],
    comments: [
      {
        id: 'C-2',
        author: 'Nuwan Silva',
        text: 'Checked power supply. Replacing cable.',
        createdAt: '2026-04-23 13:30',
      },
    ],
  },
  {
    id: 'TK-2103',
    title: 'Need access to research repository',
    description: 'Unable to open department research repository from campus account.',
    category: 'Academic',
    priority: 'LOW',
    status: STATUS.RESOLVED,
    assignedTechnicianId: 'TECH-003',
    assignedTechnicianName: 'Kamal Jayasuriya',
    facility: null,
    createdAt: '2026-04-20',
    createdBy: { id: 'STU-2026-009', name: 'Ishoda Senarath' },
    attachments: [],
    comments: [
      {
        id: 'C-3',
        author: 'Kamal Jayasuriya',
        text: 'Permission granted. Please retry login.',
        createdAt: '2026-04-21 17:40',
      },
    ],
  },
  {
    id: 'TK-2104',
    title: 'Broken AC in lecture hall C1',
    description: 'AC is not cooling and classes are uncomfortable in afternoon sessions.',
    category: 'Facility',
    priority: 'HIGH',
    status: STATUS.REJECTED,
    assignedTechnicianId: 'TECH-001',
    assignedTechnicianName: 'Nuwan Silva',
    facility: { name: 'Lecture Hall C1', status: 'Pending external vendor' },
    createdAt: '2026-04-19',
    createdBy: { id: 'LEC-2044', name: 'Prof. Fernando' },
    attachments: ['ac-unit.mp4'],
    comments: [
      {
        id: 'C-4',
        author: 'Nuwan Silva',
        text: 'Replacement requires vendor support. Current request rejected for resubmission.',
        createdAt: '2026-04-20 11:15',
      },
    ],
  },
]

export function loadTickets() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    return seedTickets
  }

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : seedTickets
  } catch (error) {
    return seedTickets
  }
}

export function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
}

export function nextTicketId(ticketList) {
  const lastNum = ticketList
    .map((ticket) => Number(ticket.id.replace('TK-', '')))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0]

  return `TK-${String((lastNum || 2100) + 1).padStart(4, '0')}`
}

export function formatStatus(status) {
  return statusMeta[status]?.label || status
}

export function statusClass(status) {
  return statusMeta[status]?.className || 'ticket-status-open'
}

export function addComment(ticket, author, text) {
  return {
    ...ticket,
    comments: [
      ...ticket.comments,
      {
        id: `C-${Math.floor(Math.random() * 100000)}`,
        author,
        text,
        createdAt: new Date().toLocaleString(),
      },
    ],
  }
}

export function getTicketById(ticketList, id) {
  return ticketList.find((ticket) => ticket.id === id) || null
}
