package com.uniSpaceHub.demo.controller.Ticket;

import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.model.Ticket.TicketStatus;
import com.uniSpaceHub.demo.service.Ticket.TicketService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public Ticket create(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    @GetMapping
    public List<Ticket> getAll() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public Ticket getById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}/claim")
    public Ticket claim(@PathVariable Long id, @RequestParam Long technicianId) {
        return ticketService.claimTicket(id, technicianId);
    }

    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id,
                               @RequestParam TicketStatus status,
                               @RequestParam Long technicianId,
                               @RequestParam(required = false) String reason) {

        return ticketService.updateStatus(id, status, technicianId, reason);
    }

    @PutMapping("/{id}/update")
    public Ticket updateByOwner(@PathVariable Long id,
                               @RequestParam Long userId,
                               @RequestBody Ticket ticket) {

        return ticketService.updateTicketByOwner(id, userId, ticket);
    }

    @PutMapping("/{id}/cancel")
    public Ticket cancel(@PathVariable Long id, @RequestParam Long userId) {
        return ticketService.cancelTicketByOwner(id, userId);
    }
}