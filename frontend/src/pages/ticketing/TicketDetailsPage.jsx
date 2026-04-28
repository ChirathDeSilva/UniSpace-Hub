    import { useEffect, useMemo, useState } from 'react'
    import { useLocation, useNavigate, useParams } from 'react-router-dom'
    import Button from '../../components/ui/Button'
    import Card from '../../components/ui/Card'
    import {
    STATUS,
    addComment,
    categories,
    currentTechnician,
    currentUser,
    formatStatus,
    loadTickets,
    priorities,
    saveTickets,
    statusClass,
    } from './ticketStore'

    function DetailsCard({ role, ticket, onEdit, onCancel, onStatus }) {
    if (!ticket) {
        return null
    }

    const isClosed = ticket.status === STATUS.CLOSED
    const canClose = ticket.status === STATUS.RESOLVED || ticket.status === STATUS.REJECTED

    return (
        <Card className="ticket-details-card">
        <div className="ticket-details-head">
            <div>
            <p className="ticket-kicker">Ticket Details</p>
            <h2>{ticket.title}</h2>
            </div>
            <span className={`ticket-status-badge ${statusClass(ticket.status)}`}>
            {formatStatus(ticket.status)}
            </span>
        </div>

        <div className="ticket-meta-grid">
            <div>
            <p className="text-muted">Ticket ID</p>
            <strong>{ticket.id}</strong>
            </div>
            <div>
            <p className="text-muted">Created Date</p>
            <strong>{ticket.createdAt}</strong>
            </div>
            <div>
            <p className="text-muted">Category</p>
            <strong>{ticket.category}</strong>
            </div>
            <div>
            <p className="text-muted">Priority</p>
            <strong>{ticket.priority}</strong>
            </div>
        </div>

        <div className="ticket-meta-grid">
            <div>
            <p className="text-muted">User</p>
            <strong>
                {ticket.createdBy.name} ({ticket.createdBy.id})
            </strong>
            </div>
            <div>
            <p className="text-muted">Technician</p>
            <strong>
                {ticket.assignedTechnicianName
                ? `${ticket.assignedTechnicianName} (${ticket.assignedTechnicianId})`
                : 'Unassigned'}
            </strong>
            </div>
        </div>

        <div>
            <p className="text-muted">Description</p>
            <p>{ticket.description}</p>
        </div>

        <div>
            <p className="text-muted">Attachments</p>
            {ticket.attachments.length ? (
            <ul className="ticket-file-list">
                {ticket.attachments.map((file) => (
                <li key={file}>{file}</li>
                ))}
            </ul>
            ) : (
            <p>No attachments.</p>
            )}
        </div>

        {ticket.facility ? (
            <div className="ticket-facility-box">
            <p className="text-muted">Facility</p>
            <p>
                <strong>{ticket.facility.name}</strong>
            </p>
            <p>Current status: {ticket.facility.status}</p>
            </div>
        ) : null}

        {role === 'user' ? (
            <div className="ticket-action-row">
            <Button variant="secondary" onClick={onEdit} disabled={ticket.status === STATUS.CLOSED}>
                Edit Ticket
            </Button>
            <Button variant="ghost" onClick={onCancel} disabled={ticket.status === STATUS.CLOSED}>
                Cancel Ticket
            </Button>
            </div>
        ) : null}

        {role !== 'user' ? (
            <div className="ticket-status-actions">
            <Button
                variant="secondary"
                onClick={() => onStatus(STATUS.IN_PROGRESS)}
                disabled={isClosed}
            >
                IN_PROGRESS
            </Button>
            <Button
                variant="secondary"
                onClick={() => onStatus(STATUS.RESOLVED)}
                disabled={isClosed}
            >
                RESOLVED
            </Button>
            <Button
                variant="secondary"
                onClick={() => onStatus(STATUS.REJECTED)}
                disabled={isClosed}
            >
                REJECTED
            </Button>
            <Button variant="ghost" onClick={() => onStatus(STATUS.CANCELLED)} disabled={isClosed}>
                CANCELLED
            </Button>
            <Button onClick={() => onStatus(STATUS.CLOSED)} disabled={!canClose || isClosed}>
                CLOSED
            </Button>
            </div>
        ) : null}
        </Card>
    )
    }

    function TicketForm({ values, onChange, onFiles, onSubmit, onCancel, error, submitLabel }) {
    return (
        <Card className="ticket-details-card">
        <h3>{submitLabel} Ticket</h3>
        <form className="ticket-form" onSubmit={onSubmit}>
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
                value={values.title}
                onChange={(event) => onChange('title', event.target.value)}
                required
            />
            </div>

            <div className="field">
            <label htmlFor="ticket-description">Description</label>
            <textarea
                id="ticket-description"
                rows="4"
                value={values.description}
                onChange={(event) => onChange('description', event.target.value)}
                required
            />
            </div>

            <div className="ticket-user-grid">
            <div className="field">
                <label htmlFor="ticket-category">Category</label>
                <select
                id="ticket-category"
                value={values.category}
                onChange={(event) => onChange('category', event.target.value)}
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
                value={values.priority}
                onChange={(event) => onChange('priority', event.target.value)}
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
                value={values.facility}
                onChange={(event) => onChange('facility', event.target.value)}
            />
            </div>

            <div className="field">
            <label htmlFor="ticket-files">Attachments (max 3)</label>
            <input id="ticket-files" type="file" multiple onChange={onFiles} />
            {values.attachments.length ? (
                <p className="text-muted">{values.attachments.join(', ')}</p>
            ) : (
                <p className="text-muted">No files selected.</p>
            )}
            </div>

            {error ? <p className="field-error">{error}</p> : null}

            <div className="ticket-modal-actions">
            <Button type="submit">{submitLabel}</Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
            </Button>
            </div>
        </form>
        </Card>
    )
    }

    function CommentForm({ value, onChange, onSubmit }) {
    return (
        <Card className="ticket-details-card">
        <h3>Add Comment</h3>
        <div className="field">
            <label htmlFor="ticket-comment">Message</label>
            <textarea
            id="ticket-comment"
            rows="3"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Add a note for the ticket history..."
            />
        </div>
        <div className="ticket-modal-actions">
            <Button onClick={onSubmit}>Post Comment</Button>
        </div>
        </Card>
    )
    }

    function CancelForm({ value, onChange, onSubmit }) {
    return (
        <Card className="ticket-details-card">
        <h3>Cancel Ticket</h3>
        <div className="field">
            <label htmlFor="cancel-reason">Cancellation reason</label>
            <textarea
            id="cancel-reason"
            rows="3"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Provide a reason before cancelling..."
            />
        </div>
        <div className="ticket-modal-actions">
            <Button variant="ghost" onClick={onSubmit}>
            Cancel Ticket
            </Button>
        </div>
        </Card>
    )
    }

    export default function TicketDetailsPage({ role = 'user' }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [tickets, setTickets] = useState(() => loadTickets())
    const [isEditing, setIsEditing] = useState(location.state?.mode === 'edit')
    const [formError, setFormError] = useState('')
    const [commentText, setCommentText] = useState('')
    const [cancelReason, setCancelReason] = useState('')
    const [statusComment, setStatusComment] = useState('')
    const [facilityStatus, setFacilityStatus] = useState('')

    const ticket = useMemo(() => tickets.find((item) => item.id === id) || null, [tickets, id])

    const [formValues, setFormValues] = useState({
        title: '',
        description: '',
        category: '',
        priority: '',
        facility: '',
        attachments: [],
    })

    useEffect(() => {
        if (!ticket) {
        return
        }

        setFormValues({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        facility: ticket.facility?.name || '',
        attachments: ticket.attachments,
        })

        setFacilityStatus(ticket.facility?.status || '')
    }, [ticket])

    if (!ticket) {
        return (
        <section className="ticket-detail-page stack reveal">
            <Card>
            <h2>Ticket not found</h2>
            <p>The requested ticket does not exist.</p>
            <Button onClick={() => navigate(-1)}>Back</Button>
            </Card>
        </section>
        )
    }

    function persistTickets(next) {
        setTickets(next)
        saveTickets(next)
    }

    function updateFormValue(key, value) {
        setFormValues((prev) => ({ ...prev, [key]: value }))
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

        const next = tickets.map((item) => {
        if (item.id !== ticket.id) {
            return item
        }

        return {
            ...item,
            title: title.trim(),
            description: description.trim(),
            category,
            priority,
            facility: facility.trim()
            ? {
                name: facility.trim(),
                status: item.facility?.status || 'Open',
                }
            : null,
            attachments,
        }
        })

        persistTickets(next)
        setIsEditing(false)
        setFormError('')
    }

    function cancelTicket() {
        if (!cancelReason.trim()) {
        setFormError('Cancellation reason is required.')
        return
        }

        const next = tickets.map((item) => {
        if (item.id !== ticket.id) {
            return item
        }

        return addComment(
            { ...item, status: STATUS.CANCELLED },
            currentUser.name,
            `Cancelled by user: ${cancelReason.trim()}`
        )
        })

        persistTickets(next)
        setCancelReason('')
        setFormError('')
    }

    function updateStatus(targetStatus) {
        if (targetStatus === STATUS.REJECTED && !statusComment.trim()) {
        setFormError('Comment is required for Rejected status.')
        return
        }

        const fallbackText =
        targetStatus === STATUS.IN_PROGRESS
            ? 'Work has started on this issue.'
            : 'Issue has been resolved and verified.'

        const note = statusComment.trim() || fallbackText

        const next = tickets.map((item) => {
        if (item.id !== ticket.id) {
            return item
        }

        return addComment({ ...item, status: targetStatus }, currentTechnician.name, note)
        })

        persistTickets(next)
        setStatusComment('')
        setFormError('')
    }

    function updateFacility() {
        const trimmed = facilityStatus.trim()

        const next = tickets.map((item) => {
        if (item.id !== ticket.id) {
            return item
        }

        if (!trimmed) {
            return { ...item, facility: null }
        }

        return {
            ...item,
            facility: {
            name: item.facility?.name || 'Facility',
            status: trimmed,
            },
        }
        })

        persistTickets(next)
        setFacilityStatus(trimmed)
        setFormError('')
    }

    function postComment() {
        if (!commentText.trim()) {
        setFormError('Comment text is required.')
        return
        }

        const author = role === 'user' ? currentUser.name : currentTechnician.name

        const next = tickets.map((item) => {
        if (item.id !== ticket.id) {
            return item
        }

        return addComment(item, author, commentText.trim())
        })

        persistTickets(next)
        setCommentText('')
        setFormError('')
    }

    function deleteTicket() {
        const next = tickets.filter((item) => item.id !== ticket.id)
        persistTickets(next)
        navigate(-1)
    }

    return (
        <section className="ticket-detail-page stack reveal-stagger">
        <div className="ticket-detail-hero">
            <div>
            <p className="ticket-kicker">Ticket</p>
            <h1>{ticket.title}</h1>
            <p>Manage updates, comments, and history for this ticket.</p>
            </div>
            <div className="ticket-detail-actions">
            <Button variant="secondary" onClick={() => navigate(-1)}>
                Back to list
            </Button>
            {role === 'user' ? (
                <Button onClick={() => setIsEditing(true)} disabled={ticket.status === STATUS.CLOSED}>
                Edit Ticket
                </Button>
            ) : null}
            <Button variant="ghost" onClick={deleteTicket}>
                Delete Ticket
            </Button>
            </div>
        </div>

        {formError ? <p className="field-error">{formError}</p> : null}

        {/* =========================
    TOP SUMMARY (HERO CARD)
    ========================= */}
    <Card className="ticket-details-card ticket-summary-hero">
    <div className="ticket-summary-top">
        <div>
        <p className="ticket-kicker">Ticket ID: {ticket.id}</p>
        <h2>{ticket.title}</h2>
        <p className="text-muted">{ticket.description}</p>
        </div>

        <span className={`ticket-status-badge ${statusClass(ticket.status)}`}>
        {formatStatus(ticket.status)}
        </span>
    </div>
    </Card>


    {/* =========================
    MIDDLE SECTION (2 COLUMN)
    ========================= */}
    <div className="ticket-detail-grid-modern">

    {/* LEFT: KEY INFO */}
    <div className="ticket-info-panel">

        <Card className="ticket-details-card">
        <h3>Ticket Info</h3>

        <div className="ticket-mini-grid">
            <div><b>Category</b><p>{ticket.category}</p></div>
            <div><b>Priority</b><p>{ticket.priority}</p></div>
            <div><b>User</b><p>{ticket.createdBy.name}</p></div>
            <div><b>Technician</b><p>{ticket.assignedTechnicianName}</p></div>
        </div>
        </Card>

        <Card className="ticket-details-card">
        <h3>Facility</h3>
        <p>{ticket.facility?.name || "Not assigned"}</p>
        <p className="text-muted">
            Status: {ticket.facility?.status || "N/A"}
        </p>
        </Card>

    </div>


    {/* RIGHT: ACTION PANEL */}
    <div className="ticket-action-panel">

        {role === 'user' && (
        <Button onClick={() => setIsEditing(true)}>
            Edit Ticket
        </Button>
        )}

        {role !== 'user' && (
        <Card className="ticket-details-card">
            <h3>Status Actions</h3>

            <div className="ticket-action-stack">
            <Button onClick={() => updateStatus(STATUS.IN_PROGRESS)}>
                In Progress
            </Button>
            <Button onClick={() => updateStatus(STATUS.RESOLVED)}>
                Resolve
            </Button>
            <Button onClick={() => updateStatus(STATUS.REJECTED)}>
                Reject
            </Button>
            </div>
        </Card>
        )}

        {role !== 'user' && (
        <Card className="ticket-details-card">
            <h3>Facility Update</h3>
            <input
            value={facilityStatus}
            onChange={(e) => setFacilityStatus(e.target.value)}
            />
            <Button onClick={updateFacility}>Update</Button>
        </Card>
        )}

        {role === 'user' && ticket.status !== STATUS.CLOSED && (
        <CancelForm
            value={cancelReason}
            onChange={setCancelReason}
            onSubmit={cancelTicket}
        />
        )}

    </div>
    </div>


    {/* =========================
    COMMENTS (FULL WIDTH TIMELINE STYLE)
    ========================= */}
    <div className="ticket-comments-section">

    <Card className="ticket-details-card">
        <h3>Activity Timeline</h3>

        <div className="ticket-timeline">
        {ticket.comments.map((comment) => (
            <div key={comment.id} className="ticket-timeline-item">
            <div className="timeline-dot" />
            <div>
                <p className="ticket-comment-meta">
                {comment.author} • {comment.createdAt}
                </p>
                <p>{comment.text}</p>
            </div>
            </div>
        ))}
        </div>

        {/* Comment box */}
        <div className="ticket-comment-box">
        <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
        />
        <Button onClick={postComment}>Post</Button>
        </div>

    </Card>

    </div>
        </section>
    )
    }
