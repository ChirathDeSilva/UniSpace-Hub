package com.uniSpaceHub.demo.dto.ticket;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClaimTicketRequest {

    @NotNull
    private Long technicianId;
}
