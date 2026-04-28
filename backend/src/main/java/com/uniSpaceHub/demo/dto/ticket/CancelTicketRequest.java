package com.uniSpaceHub.demo.dto.ticket;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelTicketRequest {

    @NotNull
    private Long userId;
}
