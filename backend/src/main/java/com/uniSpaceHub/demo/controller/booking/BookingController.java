package com.uniSpaceHub.demo.controller.booking;

import com.uniSpaceHub.demo.dto.booking.*;
import com.uniSpaceHub.demo.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * REST controller exposing the student Booking resource
 * ({@code /api/bookings}).
 *
 * <h3>REST Architectural Constraints demonstrated in this controller:</h3>
 * <ol>
 * <li><b>Client-Server</b> — UI (React) and data (Spring Boot) are completely
 * decoupled;
 * all interaction is over HTTP.</li>
 * <li><b>Stateless</b> — Every request carries a self-contained JWT token; the
 * server
 * holds no session. Mutating responses carry {@code Cache-Control: no-store} to
 * prevent intermediaries from caching them.</li>
 * <li><b>Cacheable</b> — GET responses declare explicit
 * {@code Cache-Control: max-age}
 * directives so clients and proxies can cache safely. POST/PUT/PATCH responses
 * use {@code no-store} to prevent stale mutations.</li>
 * <li><b>Uniform Interface</b>:
 * <ul>
 * <li>Resources identified by URI ({@code /api/bookings/{id}}).</li>
 * <li>Manipulation through JSON representations.</li>
 * <li>Self-descriptive messages: 201 Created + Location for creation,
 * 200 OK for reads/updates, appropriate 4xx for errors.</li>
 * <li>HATEOAS: every response includes a {@code _links} object and
 * RFC 8288 {@code Link} headers so clients can navigate without
 * hardcoding URLs.</li>
 * </ul>
 * </li>
 * <li><b>Layered System</b> — Requests pass through a JWT security filter, then
 * this controller, then the service layer, then the repository — each layer
 * unaware of layers above it.</li>
 * <li><b>Code-on-Demand</b> (optional) — The React SPA is executable JavaScript
 * delivered to the browser from a static server.</li>
 * </ol>
 */

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** Builds the standard HATEOAS _links map for a single booking. */
    private Map<String, String> bookingLinks(String bookingId, Long facilityId) {
        Map<String, String> links = new LinkedHashMap<>();
        links.put("self", "/api/bookings/" + bookingId);
        links.put("update", "/api/bookings/" + bookingId);
        links.put("cancel", "/api/bookings/" + bookingId + "/cancel");
        links.put("qr-token", "/api/bookings/" + bookingId + "/qr");
        if (facilityId != null) {
            links.put("facility", "/facilities/" + facilityId);
        }
        links.put("collection", "/api/bookings");
        return links;
    }

    /** Builds the RFC 8288 Link header value for a booking. */
    private String linkHeader(String bookingId, Long facilityId) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("</api/bookings/%s>; rel=\"self\"", bookingId)).append(", ");
        sb.append(String.format("</api/bookings/%s/cancel>; rel=\"cancel\"", bookingId)).append(", ");
        sb.append(String.format("</api/bookings/%s/qr>; rel=\"qr-token\"", bookingId)).append(", ");
        if (facilityId != null) {
            sb.append(String.format("</facilities/%s>; rel=\"facility\"", facilityId)).append(", ");
        }
        sb.append("</api/bookings>; rel=\"collection\"");
        return sb.toString();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE (POST /api/bookings)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new booking.
     *
     * <ul>
     * <li><b>201 Created</b> with a {@code Location} header pointing to the new
     * resource
     * (Uniform Interface — self-descriptive messages).</li>
     * <li>{@code Cache-Control: no-store} prevents the creation response from being
     * cached (Stateless / Cacheable constraints).</li>
     * <li>{@code _links} in the body enables client navigation without URL coupling
     * (Uniform Interface — HATEOAS).</li>
     * </ul>
     *
     * @param request The booking creation payload
     * @return 201 Created with Location header and the new booking representation
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {

        BookingResponse response = bookingService.createBooking(request);
        response.setLinks(bookingLinks(response.getBookingCode(), response.getFacilityId()));

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getBookingCode())
                .toUri();

        return ResponseEntity.created(location)
                .cacheControl(CacheControl.noStore())
                .header("Link", linkHeader(response.getBookingCode(), response.getFacilityId()))
                .body(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — collection (GET /api/bookings?userId={userId})
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves all bookings for a specific user (query-parameter filter pattern).
     *
     * <ul>
     * <li>{@code Cache-Control: max-age=30, private} — response may be cached by
     * the
     * client for 30 seconds (Cacheable constraint).</li>
     * <li>Each item in the returned list includes a {@code _links} object so the
     * client
     * can navigate to individual bookings without constructing URLs (HATEOAS).</li>
     * </ul>
     *
     * @param userId The unique identifier of the user whose bookings to retrieve
     * @return 200 OK with list of booking summaries, each containing navigation
     *         links
     */
    @GetMapping
    public ResponseEntity<List<BookingSummaryResponse>> getBookingsByUser(
            @RequestParam(name = "userId", required = true) String userId) {

        List<BookingSummaryResponse> list = bookingService.getUserBookings(userId);

        // Attach HATEOAS links to each summary item
        list.forEach(b -> {
            Map<String, String> links = new LinkedHashMap<>();
            links.put("self", "/api/bookings/" + b.getBookingCode());
            links.put("facility", "/facilities/" + b.getFacilityId());
            links.put("cancel", "/api/bookings/" + b.getBookingCode() + "/cancel");
            b.setLinks(links);
        });

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .header("Link", "</api/bookings>; rel=\"self\"")
                .body(list);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — single item (GET /api/bookings/{bookingId})
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves detailed information of a specific booking.
     *
     * <ul>
     * <li>{@code Cache-Control: max-age=60, private} — cache for 60 seconds.</li>
     * <li>{@code _links} includes self, update, cancel, qr-token, and the linked
     * resource — full HATEOAS navigation graph for this resource.</li>
     * </ul>
     *
     * @param bookingId The unique booking code
     * @return 200 OK with full booking representation and navigation links
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBooking(
            @PathVariable("bookingId") String bookingId) {

        BookingResponse body = bookingService.getBookingByCode(bookingId);
        body.setLinks(bookingLinks(bookingId, body.getFacilityId()));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePrivate())
                .header("Link", linkHeader(bookingId, body.getFacilityId()))
                .body(body);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE (PUT /api/bookings/{bookingId})
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Updates an existing booking.
     *
     * <p>
     * {@code Cache-Control: no-store} prevents the mutated response from being
     * cached.
     * </p>
     *
     * @param bookingId The unique booking code
     * @param request   The updated booking details
     * @return 200 OK with updated booking representation
     */
    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable("bookingId") String bookingId,
            @Valid @RequestBody UpdateBookingRequest request) {

        BookingResponse body = bookingService.updateBooking(bookingId, request);
        body.setLinks(bookingLinks(bookingId, body.getFacilityId()));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("Link", linkHeader(bookingId, body.getFacilityId()))
                .body(body);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE TRANSITION (PATCH /api/bookings/{bookingId}/cancel)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Cancels a specific booking (state transition).
     *
     * <p>
     * {@code Cache-Control: no-store} — state-mutating operations must not be
     * cached.
     * </p>
     *
     * @param bookingId   The unique booking code
     * @param cancelledBy The ID of the user requesting cancellation
     * @return 200 OK with updated booking representation (status = CANCELLED)
     */

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable("bookingId") String bookingId,
            @RequestParam("cancelledBy") String cancelledBy) {

        BookingResponse body = bookingService.cancelBooking(bookingId, cancelledBy);
        body.setLinks(bookingLinks(bookingId, body.getFacilityId()));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("Link", linkHeader(bookingId, body.getFacilityId()))
                .body(body);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves the QR token sub-resource for an approved booking check-in.
     *
     * <p>
     * {@code Cache-Control: max-age=60, private} — QR tokens are stable for the
     * lifetime of an approved booking.
     * </p>
     *
     * @param bookingId The unique booking code
     * @return 200 OK with the QR token
     */

    @GetMapping("/{bookingId}/qr")
    public ResponseEntity<BookingQrResponse> getBookingQrToken(
            @PathVariable("bookingId") String bookingId) {

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePrivate())
                .header("Link",
                        String.format("</api/bookings/%s>; rel=\"booking\"", bookingId),
                        String.format("</api/bookings/%s/qr>; rel=\"self\"", bookingId))
                .body(bookingService.getBookingQrToken(bookingId));
    }
}
