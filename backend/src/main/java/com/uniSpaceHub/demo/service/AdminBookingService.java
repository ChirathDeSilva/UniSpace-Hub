package com.uniSpaceHub.demo.service;

import com.uniSpaceHub.demo.dto.booking.*;

import java.util.List;

/**
 * Service interface for admin-level booking operations.
 */
public interface AdminBookingService {

    /**
     * Retrieves all bookings matching the filter.
     * 
     * @param filter Criteria to filter
     * @return List of bookings
     */
    List<BookingSummaryResponse> getAllBookings(AdminBookingFilterRequest filter);

    /**
     * Retrieves details for reviewing a booking.
     * 
     * @param bookingCode The unique booking code
     * @return Admin review response
     */
    AdminBookingReviewResponse getBookingReviewDetails(String bookingCode);

    /**
     * Approves a booking.
     * 
     * @param bookingCode The unique booking code
     * @param request     Approval details
     * @return The updated booking response
     */
    BookingResponse approveBooking(String bookingCode, ApproveBookingRequest request);

    /**
     * Rejects a booking.
     * 
     * @param bookingCode The unique booking code
     * @param request     Rejection details
     * @return The updated booking response
     */
    BookingResponse rejectBooking(String bookingCode, RejectBookingRequest request);

    /**
     * Verifies a QR token.
     * 
     * @param request Verify QR payload
     * @return Check-in result
     */
    BookingCheckInResponse verifyQrToken(VerifyBookingQrRequest request);

}
