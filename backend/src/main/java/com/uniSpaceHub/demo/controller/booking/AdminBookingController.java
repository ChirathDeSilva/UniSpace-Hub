package com.uniSpaceHub.demo.controller.booking;

import com.uniSpaceHub.demo.dto.booking.*;
import com.uniSpaceHub.demo.service.AdminBookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * REST controller for administrator-level booking management
 * ({@code /api/admin/bookings}).
 *
 * <p>
 * Applies the same six REST architectural constraints as
 * {@link BookingController}:
 * </p>
 * <ul>
 * <li><b>Stateless</b> — JWT-authenticated; no server session.</li>
 * <li><b>Cacheable</b> — GET responses carry {@code Cache-Control: max-age};
 * state-mutating PATCH/POST carry {@code no-store}.</li>
 * <li><b>Uniform Interface / HATEOAS</b> — {@code _links} in responses + RFC
 * 8288
 * {@code Link} headers for navigation from both collection and item views.</li>
 * <li><b>Layered System</b> — Additional ROLE_ADMIN security layer enforced
 * before
 * reaching this controller.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private Map<String, String> adminBookingLinks(String bookingId) {
        Map<String, String> links = new LinkedHashMap<>();
        links.put("self", "/api/admin/bookings/" + bookingId + "/review");
        links.put("approve", "/api/admin/bookings/" + bookingId + "/approve");
        links.put("reject", "/api/admin/bookings/" + bookingId + "/reject");
        links.put("collection", "/api/admin/bookings");
        return links;
    }

    private String adminLinkHeader(String bookingId) {
        return String.format("</api/admin/bookings/%s/review>; rel=\"self\"", bookingId) + ", " +
                String.format("</api/admin/bookings/%s/approve>; rel=\"approve\"", bookingId) + ", " +
                String.format("</api/admin/bookings/%s/reject>; rel=\"reject\"", bookingId) + ", " +
                "</api/admin/bookings>; rel=\"collection\"";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — collection (GET /api/admin/bookings)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves all bookings for admin review, supporting optional filtering.
     *
     * <ul>
     * <li>{@code Cache-Control: max-age=30, private} (Cacheable).</li>
     * <li>Each item includes {@code _links} to its review, approve, and reject
     * actions
     * (Uniform Interface — HATEOAS).</li>
     * </ul>
     *
     * @param filter Criteria to filter by status, date, or resource
     * @return 200 OK with a list of booking summaries and navigation links
     */

    @GetMapping
    public ResponseEntity<List<BookingSummaryResponse>> getAllBookings(
            @Valid @ModelAttribute AdminBookingFilterRequest filter) {

        List<BookingSummaryResponse> list = adminBookingService.getAllBookings(filter);

        list.forEach(b -> {
            Map<String, String> links = new LinkedHashMap<>();
            links.put("self", "/api/admin/bookings/" + b.getBookingCode() + "/review");
            links.put("approve", "/api/admin/bookings/" + b.getBookingCode() + "/approve");
            links.put("reject", "/api/admin/bookings/" + b.getBookingCode() + "/reject");
            b.setLinks(links);
        });

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .header("Link", "</api/admin/bookings>; rel=\"self\"")
                .body(list);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — single item review (GET /api/admin/bookings/{bookingId}/review)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retrieves detailed booking information for administrative review.
     *
     * <ul>
     * <li>{@code Cache-Control: max-age=30, private} (Cacheable).</li>
     * <li>RFC 8288 {@code Link} header exposes available state-transition actions
     * (HATEOAS — the engine of application state).</li>
     * </ul>
     *
     * @param bookingId The unique booking code
     * @return 200 OK with full review details
     */

    @GetMapping("/{bookingId}/review")
    public ResponseEntity<AdminBookingReviewResponse> getBookingReviewDetails(
            @PathVariable("bookingId") String bookingId) {

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate())
                .header("Link", adminLinkHeader(bookingId))
                .body(adminBookingService.getBookingReviewDetails(bookingId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE TRANSITION (PATCH /api/admin/bookings/{bookingId}/approve)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Approves a pending booking (state: PENDING → APPROVED).
     *
     * <p>
     * {@code Cache-Control: no-store} — state mutations must never be cached.
     * </p>
     *
     * @param bookingId The unique booking code
     * @param request   Admin remarks/notes
     * @return 200 OK with updated booking in APPROVED state
     */

    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable("bookingId") String bookingId,
            @Valid @RequestBody ApproveBookingRequest request) {

        BookingResponse body = adminBookingService.approveBooking(bookingId, request);
        body.setLinks(adminBookingLinks(bookingId));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("Link", adminLinkHeader(bookingId))
                .body(body);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STATE TRANSITION (PATCH /api/admin/bookings/{bookingId}/reject)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Rejects a pending booking (state: PENDING → REJECTED).
     *
     * <p>
     * {@code Cache-Control: no-store} — state mutations must never be cached.
     * </p>
     *
     * @param bookingId The unique booking code
     * @param request   Rejection reason
     * @return 200 OK with updated booking in REJECTED state
     */

    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable("bookingId") String bookingId,
            @Valid @RequestBody RejectBookingRequest request) {

        BookingResponse body = adminBookingService.rejectBooking(bookingId, request);
        body.setLinks(adminBookingLinks(bookingId));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("Link", adminLinkHeader(bookingId))
                .body(body);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Records a facility check-in by verifying the scanned QR token.
     *
     * <p>
     * A check-in is a <em>resource</em> — {@code POST} to a collection creates a
     * new
     * subordinate record. {@code Cache-Control: no-store} prevents caching of the
     * newly created check-in event.
     * </p>
     *
     * @param request Payload containing the QR token scanned at the facility
     *                entrance
     * @return 200 OK with check-in confirmation and booking details
     */

    @PostMapping("/check-ins")
    public ResponseEntity<BookingCheckInResponse> createCheckIn(
            @Valid @RequestBody VerifyBookingQrRequest request) {

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("Link",
                        "</api/admin/bookings/check-ins>; rel=\"self\", </api/admin/bookings>; rel=\"collection\"")
                .body(adminBookingService.verifyQrToken(request));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @deprecated Retained for backward compatibility.
     *             Use {@link #createCheckIn} ({@code POST /check-ins}) instead.
     */
    @Deprecated
    @PostMapping("/verify-qr")
    public ResponseEntity<BookingCheckInResponse> verifyQrToken(
            @Valid @RequestBody VerifyBookingQrRequest request) {

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(adminBookingService.verifyQrToken(request));
    }
}
