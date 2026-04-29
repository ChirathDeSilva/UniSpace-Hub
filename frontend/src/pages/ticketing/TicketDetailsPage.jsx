import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { getProfile } from '../../services/authService'
import { getFacilities } from '../../services/facilityStorage'
import { FACILITY_STATUS_OPTIONS } from '../../services/facilityTypeConfig'
import { STATUS, categories, formatStatus, priorities, statusClass } from './ticketStore'
import {
  addTicketAttachment,
  addTicketComment,
  cancelTicketByOwner,
  claimTicket,
  deleteTicket,
  deleteTicketAttachment,
  getTicketAttachments,
  getTicketById,
  getTicketComments,
  updateTicketByOwner,
  updateTicketFacilityStatus,
  updateTicketStatus,
} from '../../services/ticketService'

const MAX_ATTACHMENTS = 3
const MAX_PHONE_DIGITS = 10

function getErrorMessage(error, fallback) {
  if (typeof error?.response?.data === 'string') {
    return error.response.data
  }

  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  return fallback
}

function formatAssignee(name, id) {
  if (!name || !id) {
    return ''
  }

  return `${name} - ${id}`
}

function DetailsCard({ role, ticket, attachments, onEdit, onCancel, onStatus, onClaim }) {
  if (!ticket) {
    return null
  }

  const isClosed = ticket.status === STATUS.CLOSED
  const isUnassignedNew = ticket.status === STATUS.NEW && !ticket.assignedTechnicianId
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
            {formatAssignee(ticket.assignedTechnicianName, ticket.assignedTechnicianId)}
          </strong>
        </div>
      </div>

      <div>
        <p className="text-muted">Description</p>
        <p>{ticket.description}</p>
      </div>

      <div>
        <p className="text-muted">Attachments</p>
        {attachments.length ? (
          <ul className="ticket-file-list">
            {attachments.map((file) => (
              <li key={file.id ?? file.fileName}>
                {file.filePath ? (
                  <button
                    type="button"
                    className="ticket-link-button"
                    onClick={() => window.open(file.filePath, '_blank', 'noopener')}
                  >
                    {file.fileName}
                  </button>
                ) : (
                  file.fileName
                )}
              </li>
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

      {role === 'technician' && ticket.status === STATUS.NEW && !ticket.assignedTechnicianId ? (
        <div className="ticket-action-row">
          <Button onClick={onClaim}>Claim Ticket</Button>
        </div>
      ) : null}

      {role !== 'user' ? (
        <div className="ticket-status-actions">
          <Button
            variant="secondary"
            onClick={() => onStatus(STATUS.IN_PROGRESS)}
            disabled={isClosed || isUnassignedNew}
          >
            IN_PROGRESS
          </Button>
          <Button
            variant="secondary"
            onClick={() => onStatus(STATUS.RESOLVED)}
            disabled={isClosed || isUnassignedNew}
          >
            RESOLVED
          </Button>
          <Button
            variant="secondary"
            onClick={() => onStatus(STATUS.REJECTED)}
            disabled={isClosed || isUnassignedNew}
          >
            REJECTED
          </Button>
          <Button onClick={() => onStatus(STATUS.CLOSED)} disabled={!canClose || isClosed || isUnassignedNew}>
            CLOSED
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

function TicketForm({
  values,
  onChange,
  onFiles,
  onSubmit,
  onCancel,
  onRemoveExistingAttachment,
  onRemoveNewAttachment,
  error,
  submitLabel,
  profile,
  facilities,
  isSaving,
}) {
  const userId = profile?.id || ''
  const userName = profile?.name || ''

  return (
    <Card className="ticket-details-card">
      <h3>{submitLabel} Ticket</h3>

      <form className="ticket-form" onSubmit={onSubmit}>
        <div className="ticket-user-grid">
          <div className="field">
            <label>User ID</label>
            <input value={userId} readOnly />
          </div>

          <div className="field">
            <label>Name</label>
            <input value={userName} readOnly />
          </div>
        </div>

        <div className="field">
          <label>Title</label>
          <input
            value={values.title}
            onChange={(e) => onChange('title', e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            rows="4"
            value={values.description}
            onChange={(e) => onChange('description', e.target.value)}
            required
          />
        </div>

        <div className="ticket-user-grid">
          <div className="field">
            <label>Category</label>
            <select
              value={values.category}
              onChange={(e) => onChange('category', e.target.value)}
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
            <label>Priority</label>
            <select
              value={values.priority}
              onChange={(e) => onChange('priority', e.target.value)}
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
          <label>Location</label>
          <input
            value={values.location}
            onChange={(e) => onChange('location', e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Contact Details (optional)</label>
          <input
            value={values.contactDetails}
            onChange={(e) => onChange('contactDetails', e.target.value)}
            inputMode="numeric"
            pattern="\d{10}"
            placeholder="10-digit phone number"
          />
        </div>

        <div className="field">
          <label>Facility (optional)</label>
          <select
            value={values.facilityId}
            onChange={(e) => onChange('facilityId', e.target.value)}
          >
            <option value="">No facility</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name} ({facility.location})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Attachments (max {MAX_ATTACHMENTS})</label>
          <input
            type="file"
            multiple
            onChange={onFiles}
            disabled={
              values.attachments.length + values.newAttachments.length >= MAX_ATTACHMENTS
            }
          />
          {[...values.attachments, ...values.newAttachments].length ? (
            <div className="ticket-file-preview">
              {values.attachments.map((attachment) => (
                <span key={attachment.id ?? attachment.fileName} className="file-chip">
                  {attachment.fileName}
                  {attachment.id ? (
                    <button
                      type="button"
                      className="file-chip-remove"
                      onClick={() => onRemoveExistingAttachment(attachment.id)}
                      aria-label={`Remove ${attachment.fileName}`}
                    >
                      x
                    </button>
                  ) : null}
                </span>
              ))}
              {values.newAttachments.map((file) => (
                <span key={file.name} className="file-chip">
                  {file.name}
                  <button
                    type="button"
                    className="file-chip-remove"
                    onClick={() => onRemoveNewAttachment(file.name)}
                    aria-label={`Remove ${file.name}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <p className="field-error">{error}</p> : null}

        <div className="ticket-modal-actions">
          <Button type="submit" disabled={isSaving}>{submitLabel}</Button>
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
  const [profile, setProfile] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [facilities, setFacilities] = useState([])
  const [isEditing, setIsEditing] = useState(location.state?.mode === 'edit')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [commentText, setCommentText] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [statusComment, setStatusComment] = useState('')
  const [facilityStatus, setFacilityStatus] = useState('')

  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    location: '',
    contactDetails: '',
    facilityId: '',
    attachments: [],
    newAttachments: [],
  })

  const ticketId = useMemo(() => (id ? Number(id) : null), [id])

  const refreshDetails = async () => {
    if (!ticketId) {
      return
    }

    const [ticketData, commentData, attachmentData] = await Promise.all([
      getTicketById(ticketId),
      getTicketComments(ticketId),
      getTicketAttachments(ticketId),
    ])

    setTicket(ticketData)
    setComments(commentData)
    setAttachments(attachmentData)
    setFacilityStatus(ticketData.facility?.status ?? '')
    setFormValues((prev) => ({
      ...prev,
      title: ticketData.title ?? '',
      description: ticketData.description ?? '',
      category: ticketData.category ?? '',
      priority: ticketData.priority ?? '',
      location: ticketData.location ?? '',
      contactDetails: ticketData.contactDetails ?? '',
      facilityId: ticketData.facility?.id ?? '',
      attachments: attachmentData,
      newAttachments: [],
    }))
  }

  useEffect(() => {
    let isActive = true

    const load = async () => {
      if (!ticketId) {
        return
      }

      setIsLoading(true)
      try {
        const [profileData, facilityData] = await Promise.all([
          getProfile(),
          getFacilities(),
        ])
        if (!isActive) {
          return
        }
        setProfile(profileData)
        setFacilities(facilityData)
        await refreshDetails()
      } catch (error) {
        if (isActive) {
          setFormError('Unable to load ticket details. Please try again.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      isActive = false
    }
  }, [ticketId])

  if (!ticketId) {
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

  if (isLoading) {
    return (
      <section className="ticket-detail-page stack reveal">
        <Card>
          <p>Loading ticket details...</p>
        </Card>
      </section>
    )
  }

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

  function updateFormValue(key, value) {
    if (key === 'contactDetails') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, MAX_PHONE_DIGITS)
      setFormValues((prev) => ({ ...prev, contactDetails: digitsOnly }))
      return
    }

    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleFiles(event) {
    const incoming = Array.from(event.target.files || [])
    const currentCount = formValues.attachments.length + formValues.newAttachments.length
    const remaining = MAX_ATTACHMENTS - currentCount

    if (remaining <= 0) {
      setFormError(`Maximum ${MAX_ATTACHMENTS} attachment files are allowed.`)
      return
    }

    const accepted = incoming.slice(0, remaining)
    if (incoming.length > remaining) {
      setFormError(`Maximum ${MAX_ATTACHMENTS} attachment files are allowed.`)
    } else {
      setFormError('')
    }

    setFormValues((prev) => ({
      ...prev,
      newAttachments: [...prev.newAttachments, ...accepted],
    }))
  }

  async function removeExistingAttachment(attachmentId) {
    setActionMessage('')
    try {
      await deleteTicketAttachment(attachmentId)
      setFormValues((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((item) => item.id !== attachmentId),
      }))
      setAttachments((prev) => prev.filter((item) => item.id !== attachmentId))
      setActionMessage('Attachment removed successfully.')
      setFormError('')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to remove attachment.'))
    }
  }

  function removeNewAttachment(name) {
    setFormValues((prev) => ({
      ...prev,
      newAttachments: prev.newAttachments.filter((file) => file.name !== name),
    }))
  }

  async function saveTicket(event) {
    event.preventDefault()
    setActionMessage('')

    if (!profile?.id) {
      setFormError('Your session is missing profile data. Please sign in again.')
      return
    }

    const {
      title,
      description,
      category,
      priority,
      location,
      contactDetails,
      facilityId,
      newAttachments,
    } = formValues

    if (!title.trim() || !description.trim() || !category || !priority || !location.trim()) {
      setFormError('Please complete all required fields (title, description, category, priority, location).')
      return
    }

    if (contactDetails && contactDetails.length !== MAX_PHONE_DIGITS) {
      setFormError('Phone number must contain exactly 10 digits.')
      return
    }

    if (description.trim().length < 10) {
      setFormError('Description should be at least 10 characters.')
      return
    }

    setIsSaving(true)
    try {
      await updateTicketByOwner(ticketId, {
        userId: profile.id,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        location: location.trim(),
        contactDetails: contactDetails.trim() || null,
        facilityId: facilityId ? Number(facilityId) : null,
      })

      if (newAttachments.length > 0) {
        await Promise.all(newAttachments.map((file) => addTicketAttachment(ticketId, file)))
      }

      await refreshDetails()
      setIsEditing(false)
      setFormError('')
      setActionMessage('Ticket updated successfully.')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to update the ticket.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function cancelTicket() {
    setActionMessage('')
    if (!cancelReason.trim()) {
      setFormError('Cancellation reason is required.')
      return
    }

    if (!profile?.id) {
      setFormError('Your session is missing profile data. Please sign in again.')
      return
    }

    try {
      await cancelTicketByOwner(ticketId, profile.id)
      await refreshDetails()
      setCancelReason('')
      setFormError('')
      setActionMessage('Ticket cancelled successfully.')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to cancel ticket.'))
    }
  }

  async function updateStatus(targetStatus) {
    setActionMessage('')
    if (!profile?.id) {
      setFormError('Your session is missing profile data. Please sign in again.')
      return
    }

    if (targetStatus === STATUS.REJECTED && !statusComment.trim()) {
      setFormError('Please enter a rejection reason before rejecting the ticket.')
      return
    }

    const reason = statusComment.trim() || null

    try {
      await updateTicketStatus(ticketId, targetStatus, profile.id, reason)
      await refreshDetails()
      setStatusComment('')
      setFormError('')
      setActionMessage('Ticket status updated successfully.')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to update status.'))
    }
  }

  async function claimTicketNow() {
    setActionMessage('')
    if (!profile?.id) {
      setFormError('Your session is missing profile data. Please sign in again.')
      return
    }

    try {
      await claimTicket(ticketId, profile.id)
      await refreshDetails()
      setFormError('')
      setActionMessage('Ticket claimed successfully.')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to claim ticket.'))
    }
  }

  async function updateFacility() {
    setActionMessage('')
    if (!profile?.id) {
      setFormError('Your session is missing profile data. Please sign in again.')
      return
    }

    if (!ticket.facility?.id) {
      setFormError('This ticket is not linked to a facility.')
      return
    }

    if (!facilityStatus) {
      setFormError('Please select a facility status before updating.')
      return
    }

    try {
      await updateTicketFacilityStatus(ticketId, profile.id, facilityStatus, null)
      await refreshDetails()
      setFormError('')
      setActionMessage('Facility status updated successfully.')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to update facility status.'))
    }
  }

  async function postComment() {
    setActionMessage('')
    if (!commentText.trim()) {
      setFormError('Comment text is required.')
      return
    }

    if (!profile?.id) {
      setFormError('Your session is missing profile data. Please sign in again.')
      return
    }

    try {
      await addTicketComment(ticketId, profile.id, commentText.trim())
      const nextComments = await getTicketComments(ticketId)
      setComments(nextComments)
      setCommentText('')
      setFormError('')
      setActionMessage('Comment added successfully.')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to add comment.'))
    }
  }

  async function removeTicket() {
    setActionMessage('')
    try {
      await deleteTicket(ticketId)
      navigate(-1)
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to delete ticket.'))
    }
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
          <Button variant="ghost" onClick={removeTicket}>
            Delete Ticket
          </Button>
        </div>
      </div>

      {formError ? <p className="field-error">{formError}</p> : null}
      {actionMessage ? <p className="field-success">{actionMessage}</p> : null}

      {role !== 'user' ? (
        <Card className="ticket-details-card">
          <h3>Status Note</h3>
          <div className="field">
            <label htmlFor="status-note">Rejection reason (required for Reject)</label>
            <textarea
              id="status-note"
              rows="3"
              value={statusComment}
              onChange={(event) => setStatusComment(event.target.value)}
              placeholder="Add a reason when rejecting the ticket."
            />
          </div>
        </Card>
      ) : null}

      <DetailsCard
        role={role}
        ticket={ticket}
        attachments={attachments}
        onEdit={() => setIsEditing(true)}
        onCancel={cancelTicket}
        onStatus={updateStatus}
        onClaim={claimTicketNow}
      />

      {isEditing ? (
        <TicketForm
          values={formValues}
          onChange={updateFormValue}
          onFiles={handleFiles}
          onSubmit={saveTicket}
          onCancel={() => setIsEditing(false)}
          onRemoveExistingAttachment={removeExistingAttachment}
          onRemoveNewAttachment={removeNewAttachment}
          error={formError}
          submitLabel={isSaving ? 'Saving...' : 'Update'}
          profile={profile}
          facilities={facilities}
          isSaving={isSaving}
        />
      ) : null}

      {role !== 'user' ? (
        <Card className="ticket-details-card">
          <h3>Facility Status</h3>
          <div className="field">
            <label htmlFor="facility-status-select">Update facility status</label>
            <select
              id="facility-status-select"
              value={facilityStatus}
              onChange={(event) => setFacilityStatus(event.target.value)}
            >
              <option value="">Select status</option>
              {FACILITY_STATUS_OPTIONS.filter((option) =>
                ['AVAILABLE', 'MAINTENANCE', 'NOT_IN_SERVICE'].includes(option.value)
              ).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={updateFacility}>Update</Button>
        </Card>
      ) : null}

      {role === 'user' && ticket.status !== STATUS.CLOSED ? (
        <CancelForm value={cancelReason} onChange={setCancelReason} onSubmit={cancelTicket} />
      ) : null}

      <div className="ticket-comments-section">
        <Card className="ticket-details-card">
          <h3>Activity Timeline</h3>

          <div className="ticket-timeline">
            {comments.map((comment) => (
              <div key={comment.id ?? comment.createdAt} className="ticket-timeline-item">
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
