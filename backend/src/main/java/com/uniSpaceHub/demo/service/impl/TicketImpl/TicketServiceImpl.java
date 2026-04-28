package com.uniSpaceHub.demo.service.impl.TicketImpl;

import com.uniSpaceHub.demo.exception.Ticket.InvalidTicketStateException;
import com.uniSpaceHub.demo.exception.Ticket.ResourceNotFoundException;
import com.uniSpaceHub.demo.exception.Ticket.UnauthorizedActionException;
import com.uniSpaceHub.demo.model.FacilitiesModels.Facility;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.model.UserRole;
import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;
import com.uniSpaceHub.demo.model.Ticket.TicketWorkflowEvent;
import com.uniSpaceHub.demo.model.Ticket.SlaStatus;
import com.uniSpaceHub.demo.model.Ticket.TicketPriority;
import com.uniSpaceHub.demo.repository.FacilityRepository;
import com.uniSpaceHub.demo.repository.Ticket.TicketRepository;
import com.uniSpaceHub.demo.repository.Ticket.TicketWorkflowEventRepository;
import com.uniSpaceHub.demo.service.Ticket.TicketService;
import com.uniSpaceHub.demo.repository.UserRepository;
import com.uniSpaceHub.demo.service.NotificationService;
import com.uniSpaceHub.demo.model.NotificationType;
import com.uniSpaceHub.demo.model.NotificationSeverity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private TicketWorkflowEventRepository ticketWorkflowEventRepository;

    @Autowired
    private NotificationService notificationService;

    // CREATE TICKET
    // @Override
    // public Ticket createTicket(Ticket ticket) {
    // ticket.setStatus(TicketStatus.NEW);
    // return ticketRepository.save(ticket);
    // }
    @Override
    public Ticket createTicket(Ticket ticket) {

        User user = userRepository.findById(ticket.getCreatedBy().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ticket.setCreatedBy(user);
        if (ticket.getFacility() != null && ticket.getFacility().getId() != null) {
            ticket.setFacility(resolveFacility(ticket.getFacility().getId()));
        }

        ticket.setStatus(TicketStatus.NEW);
        initializeSla(ticket, LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);
        logWorkflow(saved, user, "TICKET_CREATED", null, TicketStatus.NEW, null, null, null);

        String msgUser = "Ticket #" + saved.getId() + " raised successfully.";
        String msgAdmin = "New Ticket #" + saved.getId() + ": " + saved.getTitle();
        notificationService.createNotification(user, msgUser, NotificationType.TICKET, NotificationSeverity.INFO,
                saved.getId().toString());
        notificationService.sendToUsersByRoles(List.of(UserRole.ROLE_ADMIN), msgAdmin, NotificationType.TICKET,
                NotificationSeverity.INFO, saved.getId().toString());

        return saved;
    }

    // GET BY ID
    @Override
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    // GET ALL IDs
    @Override
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @Override
    public List<Ticket> getSlaDashboardTickets(Long userId) {
        resolveUser(userId, "User not found");
        List<SlaStatus> dashboardStatuses = List.of(SlaStatus.SLA_AT_RISK, SlaStatus.SLA_BREACHED);
        return ticketRepository.findBySlaStatusIn(dashboardStatuses);
    }

    // CLAIM TICKET (TECHNICIAN)
    @Override
    public Ticket claimTicket(Long ticketId, Long technicianId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.NEW) {
            throw new InvalidTicketStateException("Only NEW tickets can be claimed");
        }

        if (ticket.getAssignedTo() != null) {
            throw new InvalidTicketStateException("Ticket already assigned");
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        TicketStatus previousStatus = ticket.getStatus();
        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.OPEN);

        Ticket saved = ticketRepository.save(ticket);
        logWorkflow(saved, technician, "TICKET_CLAIMED", previousStatus, TicketStatus.OPEN, null, null, null);

        String msg = "Your ticket is now OPEN. Technician " + technician.getFullName() + " has been assigned.";
        notificationService.createNotification(saved.getCreatedBy(), msg, NotificationType.TICKET,
                NotificationSeverity.INFO, saved.getId().toString());

        return saved;
    }

    // UPDATE STATUS (ASSIGNED TECHNICIAN OR ADMIN)
    @Override
    public Ticket updateStatus(Long ticketId, TicketStatus newStatus, Long technicianId, String rejectionReason) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User actor = resolveUser(technicianId, "Actor not found");
        ensureAssignedTechnicianOrAdmin(ticket, actor);

        TicketStatus currentStatus = ticket.getStatus();

        switch (currentStatus) {

            case OPEN:
                if (newStatus != TicketStatus.IN_PROGRESS) {
                    throw new InvalidTicketStateException("OPEN to IN_PROGRESS only");
                }
                break;

            case IN_PROGRESS:

                // allow going back to OPEN
                if (newStatus == TicketStatus.OPEN) {
                    break;
                }

                // rejection rule
                if (newStatus == TicketStatus.REJECTED) {
                    if (rejectionReason == null || rejectionReason.isEmpty()) {
                        throw new InvalidTicketStateException("Rejection reason required");
                    }
                    ticket.setRejectionReason(rejectionReason);
                } else {
                    ticket.setRejectionReason(null);
                }

                if (newStatus != TicketStatus.RESOLVED &&
                        newStatus != TicketStatus.REJECTED &&
                        newStatus != TicketStatus.OPEN) {
                    throw new InvalidTicketStateException("Invalid transition from IN_PROGRESS");
                }
                break;

            case RESOLVED:
                if (newStatus != TicketStatus.CLOSED) {
                    throw new InvalidTicketStateException("RESOLVED to CLOSED only");
                }
                break;

            case REJECTED:
            case CANCELLED:
            case CLOSED:
                throw new InvalidTicketStateException("No further updates allowed");
        }

        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);
        logWorkflow(saved, actor, "TICKET_STATUS_UPDATED", currentStatus, newStatus, null, null, rejectionReason);

        if (newStatus == TicketStatus.REJECTED) {
            String msg = "Ticket Rejected: " + rejectionReason + ".";
            notificationService.createNotification(saved.getCreatedBy(), msg, NotificationType.TICKET,
                    NotificationSeverity.ERROR, saved.getId().toString());
        } else if (newStatus == TicketStatus.IN_PROGRESS) {
            String msg = "Your ticket is processing.";
            notificationService.createNotification(saved.getCreatedBy(), msg, NotificationType.TICKET,
                    NotificationSeverity.INFO, saved.getId().toString());
        } else if (newStatus == TicketStatus.RESOLVED) {
            String msg = "Your issue is resolved.";
            notificationService.createNotification(saved.getCreatedBy(), msg, NotificationType.TICKET,
                    NotificationSeverity.SUCCESS, saved.getId().toString());
        }

        return saved;
    }

    @Override
    public Ticket updateFacilityStatusForTicket(Long ticketId, Long actorUserId, FacilityStatus newStatus,
            String note) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User actor = resolveUser(actorUserId, "Actor not found");

        ensureAssignedTechnicianOrAdmin(ticket, actor);

        if (ticket.getFacility() == null || ticket.getFacility().getId() == null) {
            throw new InvalidTicketStateException("Ticket is not linked to a facility/resource");
        }

        Facility facility = resolveFacility(ticket.getFacility().getId());
        validateFacilityStatusTransition(ticket, newStatus);

        FacilityStatus previousStatus = facility.getStatus();
        facility.setStatus(newStatus);
        facilityRepository.save(facility);

        ticket.setFacility(facility);
        Ticket saved = ticketRepository.save(ticket);
        logWorkflow(saved, actor, "FACILITY_STATUS_UPDATED", saved.getStatus(), saved.getStatus(), previousStatus,
                newStatus,
                note);

        return saved;
    }

    // OWNER UPDATE TICKET
    @Override
    public Ticket updateTicketByOwner(Long ticketId, Long userId, Ticket updatedTicket) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!ticket.getCreatedBy().getId().equals(userId)) {
            throw new UnauthorizedActionException("Only owner can update ticket");
        }

        if (ticket.getStatus() != TicketStatus.NEW &&
                ticket.getStatus() != TicketStatus.OPEN &&
                ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new InvalidTicketStateException("Ticket cannot be updated in current status");
        }

        ticket.setTitle(updatedTicket.getTitle());
        ticket.setDescription(updatedTicket.getDescription());
        ticket.setCategory(updatedTicket.getCategory());
        ticket.setPriority(updatedTicket.getPriority());
        ticket.setLocation(updatedTicket.getLocation());
        ticket.setContactDetails(updatedTicket.getContactDetails());
        if (updatedTicket.getFacility() != null && updatedTicket.getFacility().getId() != null) {
            ticket.setFacility(resolveFacility(updatedTicket.getFacility().getId()));
        }

        Ticket saved = ticketRepository.save(ticket);
        logWorkflow(saved, ticket.getCreatedBy(), "TICKET_UPDATED_BY_OWNER", saved.getStatus(), saved.getStatus(), null,
                null,
                "Owner updated ticket fields");
        return saved;
    }

    // OWNER CANCEL TICKET
    @Override
    public Ticket cancelTicketByOwner(Long ticketId, Long userId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!ticket.getCreatedBy().getId().equals(userId)) {
            throw new UnauthorizedActionException("Only owner can cancel ticket");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new InvalidTicketStateException("Closed ticket cannot be cancelled");
        }

        TicketStatus previousStatus = ticket.getStatus();
        ticket.setStatus(TicketStatus.CANCELLED);

        Ticket saved = ticketRepository.save(ticket);
        logWorkflow(saved, ticket.getCreatedBy(), "TICKET_CANCELLED_BY_OWNER", previousStatus, TicketStatus.CANCELLED,
                null,
                null, null);
        return saved;
    }

    // DELETE
    @Override
    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found");
        }
        ticketRepository.deleteById(id);
    }

    private User resolveUser(Long userId, String notFoundMessage) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(notFoundMessage));
    }

    private Facility resolveFacility(Long facilityId) {
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null && user.getRole().getName() == UserRole.ROLE_ADMIN;
    }

    private void ensureAssignedTechnicianOrAdmin(Ticket ticket, User actor) {
        // Authorization checks disabled for demo mode.
    }

    private void validateFacilityStatusTransition(Ticket ticket, FacilityStatus newStatus) {
        TicketStatus ticketStatus = ticket.getStatus();

        if (newStatus == FacilityStatus.AVAILABLE) {
            if (ticketStatus != TicketStatus.RESOLVED && ticketStatus != TicketStatus.CLOSED) {
                throw new InvalidTicketStateException(
                        "Facility can be set to AVAILABLE only when ticket is RESOLVED or CLOSED");
            }
            return;
        }

        if (newStatus == FacilityStatus.MAINTENANCE
                || newStatus == FacilityStatus.NOT_IN_SERVICE) {
            if (ticketStatus != TicketStatus.OPEN && ticketStatus != TicketStatus.IN_PROGRESS) {
                throw new InvalidTicketStateException(
                        "Facility can be set to MAINTENANCE/NOT_IN_SERVICE only when ticket is OPEN or IN_PROGRESS");
            }
            return;
        }

        throw new InvalidTicketStateException(
                "Unsupported facility status for ticket workflow. Use MAINTENANCE, NOT_IN_SERVICE, or AVAILABLE");
    }

    private void logWorkflow(
            Ticket ticket,
            User actor,
            String actionType,
            TicketStatus previousTicketStatus,
            TicketStatus newTicketStatus,
            FacilityStatus previousFacilityStatus,
            FacilityStatus newFacilityStatus,
            String note) {
        TicketWorkflowEvent event = new TicketWorkflowEvent();
        event.setTicket(ticket);
        event.setActor(actor);
        event.setActionType(actionType);
        event.setPreviousTicketStatus(previousTicketStatus);
        event.setNewTicketStatus(newTicketStatus);
        event.setPreviousFacilityStatus(previousFacilityStatus);
        event.setNewFacilityStatus(newFacilityStatus);
        event.setNote(note);
        ticketWorkflowEventRepository.save(event);
    }

    private void initializeSla(Ticket ticket, LocalDateTime startTime) {
        ticket.setSlaStartTime(startTime);
        ticket.setSlaDeadline(startTime.plus(resolveSlaDuration(ticket.getPriority())));
        ticket.setSlaStatus(SlaStatus.SLA_OK);
        ticket.setBreachedAt(null);
    }

    private Duration resolveSlaDuration(TicketPriority priority) {
        if (priority == null) {
            return Duration.ofHours(24);
        }

        switch (priority) {
            case HIGH:
            case URGENT:
                return Duration.ofHours(4);
            case MEDIUM:
                return Duration.ofHours(24);
            case LOW:
                return Duration.ofHours(72);
            default:
                return Duration.ofHours(24);
        }
    }
}
