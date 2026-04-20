package com.uniSpaceHub.demo.dto.ticket;

import com.uniSpaceHub.demo.model.Ticket.TicketStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTicketStatusRequest {

    @NotNull
    private TicketStatus status;

    @NotNull
    private Long technicianId;

    private String reason;
}
