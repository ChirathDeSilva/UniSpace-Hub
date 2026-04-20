package com.uniSpaceHub.demo.dto.booking;

import com.uniSpaceHub.demo.model.booking.CheckInStatus;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCheckInResponse {
    private Long id;
    private Long bookingId;
    private String qrTokenUsed;
    private CheckInStatus status;
    private String failureReason;
    private LocalDateTime checkInTime;
}
