package com.uniSpaceHub.demo.dto.ticket;

import com.uniSpaceHub.demo.model.Ticket.TicketCategory;
import com.uniSpaceHub.demo.model.Ticket.TicketPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTicketRequest {

    @NotNull
    private Long createdByUserId;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private TicketCategory category;

    @NotNull
    private TicketPriority priority;

    @NotBlank
    private String location;

    private String contactDetails;

    private Long facilityId;
}
