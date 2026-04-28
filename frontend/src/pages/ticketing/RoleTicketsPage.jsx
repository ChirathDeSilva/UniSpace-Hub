import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import {
  STATUS,
  categories,
  currentTechnician,
  currentUser,
  formatStatus,
  loadTickets,
  nextTicketId,
  priorities,
  saveTickets,
  statusClass,
  statusMeta,
} from './ticketStore'
// ✅ NEW: Icons for modern action buttons
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa'

function ToastStack({ toasts, onRemove }) {
  return (
    <div className="ticket-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`ticket-toast ${toast.type === 'error' ? 'ticket-toast-error' : ''}`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="ticket-toast-close"
            onClick={() => onRemove(toast.id)}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}

function RoleBanner({ role }) {
  const title =
    role === 'admin'
      ? 'Admin Ticket Dashboard'
      : role === 'technician'
        ? 'Technician Ticket Dashboard'
        : 'My Ticket Dashboard'

  const subtitle =
    role === 'admin'
      ? 'View and manage every ticket across the university.'
      : role === 'technician'
        ? `Assigned to ${currentTechnician.name} (${currentTechnician.id}).`
        : 'Create, track, edit, and cancel your own tickets.'

  return (
    <Card className="ticket-role-banner reveal">
      <div className="ticket-role-banner-row">
        <div>
          <p className="ticket-kicker">Uni Space Hub Tickets</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
    </Card>
  )
}

function Filters({ role, filters, technicians, onChange, searchPlaceholder }) {
  return (
    <Card className="ticket-filters-card">
      <div className="ticket-filters-grid">
        <div className="field">
          <label htmlFor="ticket-search">Search Tickets</label>
          <input
            id="ticket-search"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>

        <div className="field">
          <label htmlFor="ticket-status-filter">Status</label>
          <select
            id="ticket-status-filter"
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {Object.keys(statusMeta).map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="ticket-priority-filter">Priority</label>
          <select
            id="ticket-priority-filter"
            value={filters.priority}
            onChange={(event) => onChange('priority', event.target.value)}
          >
            <option value="ALL">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        {(role === 'admin' || role === 'technician') && (
          <div className="field">
            <label htmlFor="ticket-tech-filter">Assigned Technician</label>
            <select
              id="ticket-tech-filter"
              value={filters.technician}
              onChange={(event) => onChange('technician', event.target.value)}
            >
              <option value="ALL">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Card>
  )
}
function TicketList({ role, tickets, onView, onEdit, onDelete }) {
  const showTitle = role !== 'technician'

  return (
    <Card className="ticket-list-card">
      <div className="ticket-list-header">
        <h2>Ticket List</h2>
        <p>{tickets.length} record(s)</p>
      </div>

      {tickets.length === 0 ? (
        <div className="ticket-empty">
          <h3>No tickets found</h3>
          <p>Try adjusting filters or create a new ticket.</p>
        </div>
      ) : (
        <div className="ticket-table" role="table">

          {/* HEADER ROW */}
          <div className="ticket-table-row ticket-table-head">
            <span>Ticket ID</span>
            {showTitle ? <span>Title</span> : null}
            <span>Category</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Technician</span>
            <span>Actions</span>
          </div>

          {/* DATA ROWS */}
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-table-row">

              <span className="ticket-id-highlight" data-label="Ticket ID">
                {ticket.id}
              </span>

              {showTitle && (
                <span data-label="Title">{ticket.title}</span>
              )}

              <span data-label="Category">{ticket.category}</span>

              <span data-label="Priority">{ticket.priority}</span>

              <span data-label="Status">
                <span className={`ticket-status-badge ${statusClass(ticket.status)}`}>
                  {formatStatus(ticket.status)}
                </span>
              </span>
              

              <span data-label="Technician">
                {ticket.assignedTechnicianName || 'Unassigned'}
              </span>

              {/* ✅ UPDATED ACTION BUTTONS WITH ICONS */}
              <span className="ticket-actions-cell">

                {/* VIEW */}
                <button
                  className="ticket-icon-btn view"
                  onClick={() => onView(ticket.id)}
                  title="View Ticket"
                >
                  <FaEye />
                </button>

                {/* EDIT */}
                <button
                  className="ticket-icon-btn edit"
                  onClick={() => onEdit(ticket.id)}
                  title="Edit Ticket"
                >
                  <FaEdit />
                </button>

                {/* DELETE */}
                <button
                  className="ticket-icon-btn delete"
                  onClick={() => onDelete(ticket.id)}
                  title="Delete Ticket"
                >
                  <FaTrash />
                </button>

              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
// function TicketList({ role, tickets, onView, onEdit, onDelete }) {
//   const showTitle = role !== 'technician'

//   return (
//     <Card className="ticket-list-card">
//       <div className="ticket-list-header">
//         <h2>Ticket List</h2>
//         <p>{tickets.length} record(s)</p>
//       </div>

//       {tickets.length === 0 ? (
//         <div className="ticket-empty">
//           <h3>No tickets found</h3>
//           <p>Try adjusting filters or create a new ticket.</p>
//         </div>
//       ) : (
//         <div className="ticket-table" role="table" aria-label="Ticket list">
//           <div className="ticket-table-row ticket-table-head" role="row">
//             <span>Ticket ID</span>
//             {showTitle ? <span>Title</span> : null}
//             <span>Category</span>
//             <span>Priority</span>
//             <span>Status</span>
//             <span>Assigned Technician</span>
//             <span>Actions</span>
//           </div>

//           {tickets.map((ticket) => (
//             <div
//               role="row"
//               key={ticket.id}
//               className="ticket-table-row"
//             >
//               <span data-label="Ticket ID" className="ticket-id-highlight">
//                 {ticket.id}
//               </span>
//               {showTitle ? <span data-label="Title">{ticket.title}</span> : null}
//               <span data-label="Category">{ticket.category}</span>
//               <span data-label="Priority">{ticket.priority}</span>
//               <span data-label="Status">
//                 <span className={`ticket-status-badge ${statusClass(ticket.status)}`}>
//                   {formatStatus(ticket.status)}
//                 </span>
//               </span>
//               <span data-label="Assigned Technician">
//                 {ticket.assignedTechnicianName || 'Unassigned'}
//               </span>
//               <span data-label="Actions" className="ticket-actions-cell">
//                 <button
//                   type="button"
//                   className="ticket-icon-btn"
//                   aria-label={`View ${ticket.id}`}
//                   onClick={() => onView(ticket.id)}
//                   title="View"
//                 >
//                   View
//                 </button>
//                 <button
//                   type="button"
//                   className="ticket-icon-btn"
//                   aria-label={`Edit ${ticket.id}`}
//                   onClick={() => onEdit(ticket.id)}
//                   title="Edit"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   type="button"
//                   className="ticket-icon-btn"
//                   aria-label={`Delete ${ticket.id}`}
//                   onClick={() => onDelete(ticket.id)}
//                   title="Delete"
//                 >
//                   Delete
//                 </button>
//               </span>
//             </div>
//           ))}
//         </div>
//       )}
//     </Card>
//   )
// }

function Modal({ title, children, onClose }) {
  return (
    <div className="ticket-modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="ticket-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ticket-modal-header">
          <h3>{title}</h3>
          <button type="button" className="ticket-modal-close" onClick={onClose}>
            x
          </button>
        </div>
        <div className="ticket-modal-body">{children}</div>
      </section>
    </div>
  )
}

export default function RoleTicketsPage({ role = 'user' }) {
  const [tickets, setTickets] = useState(() => loadTickets())
  const [isLoading, setIsLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    technician: role === 'technician' ? currentTechnician.id : 'ALL',
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editModeTicketId, setEditModeTicketId] = useState(null)

  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    facility: '',
    attachments: [],
  })
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450)
    return () => clearTimeout(timer)
  }, [])

  const technicians = useMemo(() => {
    const map = new Map()
    tickets.forEach((ticket) => {
      if (ticket.assignedTechnicianId && ticket.assignedTechnicianName) {
        map.set(ticket.assignedTechnicianId, {
          id: ticket.assignedTechnicianId,
          name: ticket.assignedTechnicianName,
        })
      }
    })

    if (!map.has(currentTechnician.id)) {
      map.set(currentTechnician.id, currentTechnician)
    }

    return Array.from(map.values())
  }, [tickets])

  const visibleTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        if (role === 'technician') {
          return ticket.assignedTechnicianId === currentTechnician.id
        }

        if (role === 'user') {
          return ticket.createdBy.id === currentUser.id
        }

        return true
      })
      .filter((ticket) => {
        if (filters.status !== 'ALL' && ticket.status !== filters.status) {
          return false
        }

        if (filters.priority !== 'ALL' && ticket.priority !== filters.priority) {
          return false
        }

        if (filters.technician !== 'ALL' && ticket.assignedTechnicianId !== filters.technician) {
          return false
        }

        if (filters.search.trim()) {
          const term = filters.search.trim().toLowerCase()
          const text = `${ticket.id} ${ticket.title} ${ticket.category} ${ticket.createdBy.name}`.toLowerCase()
          return text.includes(term)
        }

        return true
      })
  }, [tickets, role, filters])

  function persistTickets(next) {
    setTickets(next)
    saveTickets(next)
  }

  function addToast(message, type = 'success') {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2800)
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  function updateFilter(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function openCreateModal() {
    setFormValues({
      title: '',
      description: '',
      category: '',
      priority: '',
      facility: '',
      attachments: [],
    })
    setFormError('')
    setEditModeTicketId(null)
    setShowCreateModal(true)
  }

  function openEditModal(ticket) {
    setFormValues({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      facility: ticket.facility?.name || '',
      attachments: ticket.attachments,
    })
    setFormError('')
    setEditModeTicketId(ticket.id)
    setShowCreateModal(true)
  }

  function handleFiles(event) {
    const files = Array.from(event.target.files || []).map((file) => file.name)
    if (files.length > 3) {
      setFormError('Maximum 3 attachment files are allowed.')
      return
    }

    setFormError('')
    setFormValues((prev) => ({ ...prev, attachments: files }))
  }

  function saveTicket(event) {
    event.preventDefault()

    const { title, description, category, priority, facility, attachments } = formValues
    if (!title.trim() || !description.trim() || !category || !priority) {
      setFormError('Please complete all required fields.')
      return
    }

    if (description.trim().length < 10) {
      setFormError('Description should be at least 10 characters.')
      return
    }

    if (editModeTicketId) {
      const next = tickets.map((ticket) => {
        if (ticket.id !== editModeTicketId) {
          return ticket
        }

        return {
          ...ticket,
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          facility: facility.trim()
            ? {
                name: facility.trim(),
                status: ticket.facility?.status || 'Open',
              }
            : null,
          attachments,
        }
      })
      persistTickets(next)
      addToast('Ticket updated.')
    } else {
      const newTicket = {
        id: nextTicketId(tickets),
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: STATUS.OPEN,
        assignedTechnicianId: currentTechnician.id,
        assignedTechnicianName: currentTechnician.name,
        facility: facility.trim() ? { name: facility.trim(), status: 'Open' } : null,
        createdAt: new Date().toISOString().slice(0, 10),
        createdBy: { id: currentUser.id, name: currentUser.name },
        attachments,
        comments: [
          {
            id: `C-${Math.floor(Math.random() * 100000)}`,
            author: 'System',
            text: 'Ticket created and queued for review.',
            createdAt: new Date().toLocaleString(),
          },
        ],
      }
      const next = [newTicket, ...tickets]
      persistTickets(next)
      addToast('Ticket created successfully.')
    }

    setShowCreateModal(false)
  }

  function openDetail(ticketId, mode) {
    const basePath =
      role === 'admin'
        ? '/admin/tickets'
        : role === 'technician'
          ? '/technician/tickets'
          : '/user/tickets'
    navigate(`${basePath}/${ticketId}`, mode ? { state: { mode } } : undefined)
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return
    }

    const next = tickets.filter((ticket) => ticket.id !== deleteTarget)
    persistTickets(next)
    setDeleteTarget(null)
    addToast('Ticket deleted.')
  }

  const filterPlaceholder =
    role === 'admin'
      ? 'Search by ticket ID, title, user...'
      : role === 'technician'
        ? 'Search assigned tickets...'
        : 'Search my tickets...'

  return (
    <section className="ticket-workspace ticket-fullwidth stack reveal-stagger">
      <RoleBanner role={role} />

      {role === 'user' ? (
        <div className="ticket-top-actions">
          <Button onClick={openCreateModal}>Create Ticket</Button>
        </div>
      ) : null}

      <Filters
        role={role}
        filters={filters}
        technicians={technicians}
        onChange={updateFilter}
        searchPlaceholder={filterPlaceholder}
      />

      {isLoading ? (
        <Card>
          <div className="ticket-loading">
            <span className="spinner" aria-hidden="true" />
            <p>Loading tickets...</p>
          </div>
        </Card>
      ) : (
        <div className="ticket-main-grid">
          <TicketList
            role={role}
            tickets={visibleTickets}
            onView={(ticketId) => openDetail(ticketId)}
            onEdit={(ticketId) => openDetail(ticketId, 'edit')}
            onDelete={(ticketId) => setDeleteTarget(ticketId)}
          />
        </div>
      )}

      {showCreateModal ? (
        <Modal
          title={editModeTicketId ? 'Edit Ticket' : 'Create Ticket'}
          onClose={() => setShowCreateModal(false)}
        >
          {/* <form className="ticket-form" onSubmit={saveTicket}>
            <div className="ticket-user-grid">
              <div className="field">
                <label htmlFor="user-id">User ID</label>
                <input id="user-id" value={currentUser.id} readOnly />
              </div>
              <div className="field">
                <label htmlFor="user-name">Name</label>
                <input id="user-name" value={currentUser.name} readOnly />
              </div>
            </div>

            <div className="field">
              <label htmlFor="ticket-title">Title</label>
              <input
                id="ticket-title"
                value={formValues.title}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </div>

            <div className="field">
              <label htmlFor="ticket-description">Description</label>
              <textarea
                id="ticket-description"
                rows="4"
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, description: event.target.value }))
                }
                required
              />
            </div>

            <div className="ticket-user-grid">
              <div className="field">
                <label htmlFor="ticket-category">Category</label>
                <select
                  id="ticket-category"
                  value={formValues.category}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, category: event.target.value }))
                  }
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="ticket-priority">Priority</label>
                <select
                  id="ticket-priority"
                  value={formValues.priority}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, priority: event.target.value }))
                  }
                  required
                >
                  <option value="">Select priority</option>
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="ticket-facility">Facility</label>
              <input
                id="ticket-facility"
                placeholder="Lab / Lecture Hall / etc."
                value={formValues.facility}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, facility: event.target.value }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="ticket-files">Attachments (max 3)</label>
              <input id="ticket-files" type="file" multiple onChange={handleFiles} />
              {formValues.attachments.length ? (
                <p className="text-muted">{formValues.attachments.join(', ')}</p>
              ) : (
                <p className="text-muted">No files selected.</p>
              )}
            </div>

            {formError ? <p className="field-error">{formError}</p> : null}

            <div className="ticket-modal-actions">
              <Button type="submit">{editModeTicketId ? 'Update' : 'Submit'}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </form> */}
                  <form className="ticket-form-fancy" onSubmit={saveTicket}>

          {/* HEADER */}
          <div className="ticket-form-title">
            <h2>{editModeTicketId ? 'Edit Ticket' : 'Create Support Ticket'}</h2>
            <p>Provide details clearly so we can resolve your issue faster</p>
          </div>


          {/* USER INFO CARD */}
          <div className="ticket-form-card soft">
            <h4>Requester Information</h4>

            <div className="ticket-form-row">
              <div>
                <label>User ID</label>
                <input value={currentUser.id} readOnly />
              </div>

              <div>
                <label>Name</label>
                <input value={currentUser.name} readOnly />
              </div>
            </div>
          </div>


          {/* TITLE CARD */}
          <div className="ticket-form-card">
            <label>Ticket Title</label>
            <input
              value={formValues.title}
              onChange={(e) =>
                setFormValues(prev => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Wi-Fi not working in lecture hall"
            />
          </div>


          {/* DESCRIPTION CARD */}
          <div className="ticket-form-card">
            <label>Description</label>
            <textarea
              rows="5"
              value={formValues.description}
              onChange={(e) =>
                setFormValues(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Explain the issue in detail..."
            />
          </div>


          {/* DETAILS GRID CARD */}
          <div className="ticket-form-card grid">

            <div>
              <label>Category</label>
              <select
                value={formValues.category}
                onChange={(e) =>
                  setFormValues(prev => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label>Priority</label>
              <select
                value={formValues.priority}
                onChange={(e) =>
                  setFormValues(prev => ({ ...prev, priority: e.target.value }))
                }
              >
                <option value="">Select priority</option>
                {priorities.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="full">
              <label>Facility (optional)</label>
              <input
                value={formValues.facility}
                onChange={(e) =>
                  setFormValues(prev => ({ ...prev, facility: e.target.value }))
                }
                placeholder="Lecture Hall / Lab / etc."
              />
            </div>

          </div>


          {/* ATTACHMENTS */}
          <div className="ticket-form-card">
            <label>Attachments (max 3 files)</label>
            <input type="file" multiple onChange={handleFiles} />

            {formValues.attachments.length > 0 && (
              <div className="ticket-file-preview">
                {formValues.attachments.map(f => (
                  <span key={f} className="file-chip">{f}</span>
                ))}
              </div>
            )}
          </div>


          {/* ERROR */}
          {formError && (
            <div className="form-error-box">
              {formError}
            </div>
          )}


          {/* ACTION BAR */}
          <div className="ticket-form-actions-fancy">
            <Button type="submit">
              {editModeTicketId ? 'Update Ticket' : 'Submit Ticket'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
          </div>

        </form>
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal title="Delete Ticket" onClose={() => setDeleteTarget(null)}>
          <div className="stack">
            <p>Are you sure you want to delete this ticket?</p>
            <div className="ticket-modal-actions">
              <Button onClick={confirmDelete}>Delete</Button>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Back
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <ToastStack toasts={toasts} onRemove={removeToast} />
    </section>
  )
}
