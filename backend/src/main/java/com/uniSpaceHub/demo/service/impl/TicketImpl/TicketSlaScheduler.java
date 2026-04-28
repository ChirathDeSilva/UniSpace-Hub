package com.uniSpaceHub.demo.service.impl.TicketImpl;

import com.uniSpaceHub.demo.exception.Ticket.ResourceNotFoundException;
import com.uniSpaceHub.demo.model.Ticket.SlaStatus;
import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;
import com.uniSpaceHub.demo.model.Ticket.TicketWorkflowEvent;
import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.repository.Ticket.TicketRepository;
import com.uniSpaceHub.demo.repository.Ticket.TicketWorkflowEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

//service level agreement scheduler to evaluate SLA status of tickets every minute and log breaches as workflow events
@Service
public class TicketSlaScheduler {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketWorkflowEventRepository ticketWorkflowEventRepository;

    @Scheduled(fixedRate = 60000)
    public void evaluateSlaStatuses() {
        List<TicketStatus> closedStatuses = List.of(TicketStatus.CLOSED, TicketStatus.CANCELLED);
        List<Ticket> activeTickets = ticketRepository.findByStatusNotIn(closedStatuses);
        LocalDateTime now = LocalDateTime.now();

        for (Ticket ticket : activeTickets) {
            if (ticket.getSlaStartTime() == null || ticket.getSlaDeadline() == null) {
                continue;
            }

            SlaStatus newStatus = evaluateStatus(ticket.getSlaStartTime(), ticket.getSlaDeadline(), now);
            if (ticket.getSlaStatus() == newStatus) {
                continue;
            }

            ticket.setSlaStatus(newStatus);
            if (newStatus == SlaStatus.SLA_BREACHED && ticket.getBreachedAt() == null) {
                ticket.setBreachedAt(now);
                logBreach(ticket, resolveActor(ticket), now);
            }

            ticketRepository.save(ticket);
        }
    }

    private SlaStatus evaluateStatus(LocalDateTime startTime, LocalDateTime deadline, LocalDateTime now) {
        Duration total = Duration.between(startTime, deadline);
        Duration elapsed = Duration.between(startTime, now);

        if (total.isZero() || total.isNegative()) {
            return SlaStatus.SLA_BREACHED;
        }

        double ratio = (double) elapsed.toMillis() / (double) total.toMillis();
        if (ratio >= 1.0) {
            return SlaStatus.SLA_BREACHED;
        }
        if (ratio >= 0.75) {
            return SlaStatus.SLA_AT_RISK;
        }
        return SlaStatus.SLA_OK;
    }

    private void logBreach(Ticket ticket, User actor, LocalDateTime now) {
        TicketWorkflowEvent event = new TicketWorkflowEvent();
        event.setTicket(ticket);
        event.setActor(actor);
        event.setActionType("SLA_BREACH");
        event.setPreviousTicketStatus(ticket.getStatus());
        event.setNewTicketStatus(ticket.getStatus());
        event.setNote("SLA exceeded automatically");
        ticketWorkflowEventRepository.save(event);
    }

    private User resolveActor(Ticket ticket) {
        if (ticket.getAssignedTo() != null) {
            return ticket.getAssignedTo();
        }
        if (ticket.getCreatedBy() != null) {
            return ticket.getCreatedBy();
        }
        throw new ResourceNotFoundException("No actor available for SLA breach event");
    }
}
