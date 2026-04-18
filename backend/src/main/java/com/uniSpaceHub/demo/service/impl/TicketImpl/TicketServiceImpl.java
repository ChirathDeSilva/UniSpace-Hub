package com.uniSpaceHub.demo.service.impl.TicketImpl;

import com.uniSpaceHub.demo.model.*;
import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;
import com.uniSpaceHub.demo.repository.Ticket.TicketRepository;
import com.uniSpaceHub.demo.service.Ticket.TicketService;
import com.uniSpaceHub.demo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    // CREATE TICKET
    // @Override
    // public Ticket createTicket(Ticket ticket) {
    // ticket.setStatus(TicketStatus.NEW);
    // return ticketRepository.save(ticket);
    // }
    @Override
    public Ticket createTicket(Ticket ticket) {

        // Fetch full user from DB using ID
        User user = userRepository.findById(ticket.getCreatedBy().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Set full user object
        ticket.setCreatedBy(user);

        // logic
        ticket.setStatus(TicketStatus.NEW);

        return ticketRepository.save(ticket);
    }

    // GET BY ID
    @Override
    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    // GET ALL IDs
    @Override
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // CLAIM TICKET (TECHNICIAN)
    @Override
    public Ticket claimTicket(Long ticketId, Long technicianId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != TicketStatus.NEW) {
            throw new RuntimeException("Only NEW tickets can be claimed");
        }

        if (ticket.getAssignedTo() != null) {
            throw new RuntimeException("Ticket already assigned");
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.OPEN);

        return ticketRepository.save(ticket);
    }

    // UPDATE STATUS (TECHNICIAN)
    @Override
    public Ticket updateStatus(Long ticketId, TicketStatus newStatus, Long technicianId, String rejectionReason) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // only assigned technician can update
        if (ticket.getAssignedTo() == null ||
                !ticket.getAssignedTo().getId().equals(technicianId)) {
            throw new RuntimeException("Only assigned technician can update this ticket");
        }

        TicketStatus currentStatus = ticket.getStatus();

        switch (currentStatus) {

            case OPEN:
                if (newStatus != TicketStatus.IN_PROGRESS) {
                    throw new RuntimeException("OPEN → only IN_PROGRESS allowed");
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
                        throw new RuntimeException("Rejection reason required");
                    }
                    ticket.setRejectionReason(rejectionReason);
                }

                if (newStatus != TicketStatus.RESOLVED &&
                        newStatus != TicketStatus.REJECTED &&
                        newStatus != TicketStatus.OPEN) {
                    throw new RuntimeException("Invalid transition from IN_PROGRESS");
                }
                break;

            case RESOLVED:
                if (newStatus != TicketStatus.CLOSED) {
                    throw new RuntimeException("RESOLVED → only CLOSED allowed");
                }
                break;

            case REJECTED:
            case CANCELLED:
            case CLOSED:
                throw new RuntimeException("No further updates allowed");
        }

        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }

    // OWNER UPDATE TICKET
    @Override
    public Ticket updateTicketByOwner(Long ticketId, Long userId, Ticket updatedTicket) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Only owner can update ticket");
        }

        if (ticket.getStatus() != TicketStatus.NEW &&
                ticket.getStatus() != TicketStatus.OPEN &&
                ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new RuntimeException("Ticket cannot be updated in current status");
        }

        ticket.setTitle(updatedTicket.getTitle());
        ticket.setDescription(updatedTicket.getDescription());
        ticket.setCategory(updatedTicket.getCategory());
        ticket.setPriority(updatedTicket.getPriority());
        ticket.setLocation(updatedTicket.getLocation());
        ticket.setContactDetails(updatedTicket.getContactDetails());

        return ticketRepository.save(ticket);
    }

    // OWNER CANCEL TICKET
    @Override
    public Ticket cancelTicketByOwner(Long ticketId, Long userId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Only owner can cancel ticket");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new RuntimeException("Closed ticket cannot be cancelled");
        }

        ticket.setStatus(TicketStatus.CANCELLED);

        return ticketRepository.save(ticket);
    }

    // DELETE
    @Override
    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("Ticket not found");
        }
        ticketRepository.deleteById(id);
    }
}
