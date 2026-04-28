package com.uniSpaceHub.demo.dto.ticket;

import com.uniSpaceHub.demo.model.FacilityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTicketFacilityStatusRequest {

    @NotNull
    private Long actorUserId;

    @NotNull
    private FacilityStatus facilityStatus;

    private String note;
}
