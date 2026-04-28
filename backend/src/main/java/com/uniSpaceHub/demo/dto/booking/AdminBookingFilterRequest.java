package com.uniSpaceHub.demo.dto.booking;

import com.uniSpaceHub.demo.model.booking.BookingStatus;
import lombok.Data;

import java.time.LocalDate;


@Data
public class AdminBookingFilterRequest {
    private BookingStatus status;
    private LocalDate bookingDate;
    private Long facilityId;
    private Long userId;
    private Boolean checkConflict;
}
