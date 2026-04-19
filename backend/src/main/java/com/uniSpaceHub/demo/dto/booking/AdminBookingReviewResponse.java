package com.uniSpaceHub.demo.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingReviewResponse {
    private BookingResponse bookingDetails;
    private String resourceSummary;
    private List<BookingSummaryResponse> approvedBookingsForDate;
    private List<BookingSummaryResponse> overlappingBookings;
    private boolean canApprove;
    private String reviewMessage;
}
