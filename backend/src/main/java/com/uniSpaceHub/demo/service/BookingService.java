package com.uniSpaceHub.demo.service;

import com.uniSpaceHub.demo.dto.booking.*;

import java.util.List;

/**
 * Service interface for user-level booking operations.
 */
public interface BookingService {

    /**
     * Creates a new booking.
     * 
     * @param request Payload containing booking details
     * @return The created booking response
     */
    BookingResponse createBooking(CreateBookingRequest request);

    /**
     * Updates an existing pending booking.
     * 
     * @param bookingCode The unique booking code
     * @param request     Payload containing updated details
     * @return The updated booking response
     */
    BookingResponse updateBooking(String bookingCode, UpdateBookingRequest request);

    /**
     * Cancels an existing booking.
     * 
     * @param bookingCode The unique booking code
     * @param cancelledBy The ID of the cancelling user
     * @return The cancelled booking response
     */
    BookingResponse cancelBooking(String bookingCode, String cancelledBy);

    /**
     * Retrieves booking details by code.
     * 
     * @param bookingCode The unique booking code
     * @return The booking response
     */
    BookingResponse getBookingByCode(String bookingCode);

    /**
     * Retrieves all bookings for a user.
     * 
     * @param userId The ID of the user
     * @return List of booking summaries
     */
    List<BookingSummaryResponse> getUserBookings(String userId);

    /**
     * Retrieves the QR code token for a booking.
     * 
     * @param bookingCode The unique booking code
     * @return QR code response
     */
    BookingQrResponse getBookingQrToken(String bookingCode);

}
