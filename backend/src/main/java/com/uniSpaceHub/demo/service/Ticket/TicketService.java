package com.uniSpaceHub.demo.service.Ticket;

import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;

import java.util.List;

public interface TicketService {

    Ticket createTicket(Ticket ticket);

    Ticket getTicketById(Long id);

    List<Ticket> getAllTickets();

    Ticket claimTicket(Long ticketId, Long technicianId);

    Ticket updateStatus(Long ticketId, TicketStatus newStatus, Long technicianId, String rejectionReason);

    Ticket updateTicketByOwner(Long ticketId, Long userId, Ticket updatedTicket);

    Ticket cancelTicketByOwner(Long ticketId, Long userId);

    void deleteTicket(Long id);
}