package com.uniSpaceHub.demo.exception.booking;

/**
 * Thrown when a booking operation is syntactically valid but cannot be performed
 * because the booking is in the wrong state.
 *
 * <p>Examples:</p>
 * <ul>
 *   <li>Trying to update a booking that is not in {@code PENDING} state.</li>
 *   <li>Trying to cancel a booking that is already {@code REJECTED}.</li>
 *   <li>Requesting a QR token for a booking that is not {@code APPROVED}.</li>
 * </ul>
 *
 * <p>Mapped to HTTP {@code 422 Unprocessable Entity} by
 * {@link BookingExceptionHandler#handleInvalidState}.</p>
 */
public class InvalidBookingStateException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public InvalidBookingStateException(String message) {
        super(message);
    }

    public InvalidBookingStateException(String message, Throwable cause) {
        super(message, cause);
    }
}
