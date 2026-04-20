package com.uniSpaceHub.demo.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddCommentRequest {

    @NotNull
    private Long ticketId;

    @NotNull
    private Long userId;

    @NotBlank
    private String message;
}
