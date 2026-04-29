package com.uniSpaceHub.demo.controller.Ticket;

import com.uniSpaceHub.demo.dto.ticket.CancelTicketRequest;
import com.uniSpaceHub.demo.dto.ticket.ClaimTicketRequest;
import com.uniSpaceHub.demo.dto.ticket.CreateTicketRequest;
import com.uniSpaceHub.demo.dto.ticket.UpdateTicketFacilityStatusRequest;
import com.uniSpaceHub.demo.dto.ticket.UpdateTicketRequest;
import com.uniSpaceHub.demo.dto.ticket.UpdateTicketStatusRequest;
import com.uniSpaceHub.demo.mapper.Ticket.TicketMapper;
import com.uniSpaceHub.demo.model.Ticket.Ticket;
import com.uniSpaceHub.demo.service.Ticket.TicketService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketMapper ticketMapper;

    @PostMapping
    public Ticket create(@Valid @RequestBody CreateTicketRequest request) {
        return ticketService.createTicket(ticketMapper.toEntity(request));
    }

    @GetMapping
    public List<Ticket> getAll() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/sla-dashboard")
    public List<Ticket> getSlaDashboard(@RequestParam("userId") Long userId) {
        return ticketService.getSlaDashboardTickets(userId);
    }

    @GetMapping("/{id}")
    public Ticket getById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}/claim")
    public Ticket claim(@PathVariable Long id, @Valid @RequestBody ClaimTicketRequest request) {
        return ticketService.claimTicket(id, request.getTechnicianId());
    }

    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {

        return ticketService.updateStatus(id, request.getStatus(), request.getTechnicianId(), request.getReason());
    }

    @PutMapping("/{id}/facility-status")
    public Ticket updateFacilityStatus(@PathVariable Long id,
            @Valid @RequestBody UpdateTicketFacilityStatusRequest request) {
        return ticketService.updateFacilityStatusForTicket(
                id,
                request.getActorUserId(),
                request.getFacilityStatus(),
                request.getNote());
    }

    @PutMapping("/{id}/update")
    public Ticket updateByOwner(@PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request) {
        return ticketService.updateTicketByOwner(id, request.getUserId(), ticketMapper.toEntity(request));
    }

    @PutMapping("/{id}/cancel")
    public Ticket cancel(@PathVariable Long id, @Valid @RequestBody CancelTicketRequest request) {
        return ticketService.cancelTicketByOwner(id, request.getUserId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ticketService.deleteTicket(id);
    }
}