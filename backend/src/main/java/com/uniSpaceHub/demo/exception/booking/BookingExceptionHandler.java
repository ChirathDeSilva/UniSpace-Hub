package com.uniSpaceHub.demo.exception.booking;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for the Booking module.
 *
 * <p>Scoped to {@code com.uniSpaceHub.demo} so it does not
 * interfere with other team members' exception handling.</p>
 *
 * <h3>HTTP Status Code Mapping (Proper usage of HTTP methods and status codes):</h3>
 * <ul>
 *   <li>{@code 400 Bad Request} — {@link MethodArgumentNotValidException}:
 *       Request body failed {@code @Valid} bean validation. Returns a list of
 *       field-level error messages so the client knows exactly what to fix.</li>
 *   <li>{@code 404 Not Found} — {@link BookingNotFoundException}:
 *       The requested booking code does not exist in the system.</li>
 *   <li>{@code 409 Conflict} — {@link BookingConflictException}:
 *       The requested time slot overlaps with an existing APPROVED or PENDING
 *       booking for the same resource.</li>
 *   <li>{@code 422 Unprocessable Entity} — {@link InvalidBookingStateException}:
 *       The request is syntactically valid but cannot be processed because the
 *       booking is in the wrong state (e.g., trying to cancel a REJECTED booking,
 *       or updating a non-PENDING booking).</li>
 *   <li>{@code 500 Internal Server Error} — Unhandled {@link Exception}:
 *       Catch-all for unexpected errors; returns a safe error message without
 *       exposing internal stack traces to the client.</li>
 * </ul>
 */
@Slf4j
@RestControllerAdvice(basePackages = "com.uniSpaceHub.demo")
public class BookingExceptionHandler {

    /**
     * 404 Not Found — booking code does not exist.
     *
     * <p>Correct HTTP semantics: the identified resource does not exist on the server.
     * The client should not retry with the same booking code.</p>
     */
    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBookingNotFound(BookingNotFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), "BOOKING_NOT_FOUND");
    }

    /**
     * 409 Conflict — requested time slot overlaps an existing booking.
     *
     * <p>HTTP 409 is the correct code when the request cannot be completed due to a
     * conflict with the current state of the target resource (RFC 9110 §15.5.10).</p>
     */
    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<Map<String, Object>> handleBookingConflict(BookingConflictException ex) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage(), "BOOKING_CONFLICT");
    }

    /**
     * 422 Unprocessable Entity — valid request but illegal state transition.
     *
     * <p>Used when the request body is well-formed but the operation cannot be
     * performed due to business logic constraints (e.g., cancelling an already
     * REJECTED booking, updating a non-PENDING booking).</p>
     */
    @ExceptionHandler(InvalidBookingStateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidState(InvalidBookingStateException ex) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), "INVALID_BOOKING_STATE");
    }

    /**
     * 400 Bad Request — {@code @Valid} bean validation failure.
     *
     * <p>Spring automatically throws {@link MethodArgumentNotValidException} when a
     * {@code @RequestBody} annotated with {@code @Valid} fails validation. This handler
     * returns a structured list of field errors so the client can identify and fix
     * invalid fields without inspecting raw Spring error output.</p>
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 400);
        body.put("error", "BAD_REQUEST");
        body.put("message", "Request validation failed. Please check the fields below.");
        body.put("fieldErrors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    /**
     * 500 Internal Server Error — unexpected runtime exception.
     *
     * <p>Catch-all that prevents stack traces from leaking to the client while still
     * returning a structured JSON error body (not an HTML error page).</p>
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again or contact support.",
                "INTERNAL_ERROR"
        );
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String message, String errorCode) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", errorCode);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
