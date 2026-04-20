package com.uniSpaceHub.demo.exception.booking;

/**
 * Thrown when a booking request conflicts with an existing approved or pending
 * booking for the same resource and time slot.
 *
 * <p>Mapped to HTTP {@code 409 Conflict} by
 * {@link BookingExceptionHandler#handleBookingConflict}.</p>
 */
public class BookingConflictException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public BookingConflictException(String message) {
        super(message);
    }

    public BookingConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
