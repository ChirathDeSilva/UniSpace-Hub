package com.uniSpaceHub.demo.controller;

import com.uniSpaceHub.demo.model.Booking;
import com.uniSpaceHub.demo.model.BookingStatus;
import com.uniSpaceHub.demo.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // ==================== CREATE BOOKING ====================
    /**
     * Create a new booking
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking createdBooking = bookingService.createBooking(booking);
            return ResponseEntity.status(201).body(createdBooking);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== GET ALL BOOKINGS ====================
    /**
     * Get all bookings (Admin only)
     * GET /api/bookings
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    // ==================== GET BOOKING BY ID ====================
    /**
     * Get booking by ID
     * GET /api/bookings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== GET USER BOOKINGS ====================
    /**
     * Get all bookings for a specific user
     * GET /api/bookings/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) {
        List<Booking> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    // ==================== GET FACILITY BOOKINGS ====================
    /**
     * Get all bookings for a specific facility
     * GET /api/bookings/facility/{facilityId}
     */
    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<List<Booking>> getFacilityBookings(@PathVariable Long facilityId) {
        List<Booking> bookings = bookingService.getFacilityBookings(facilityId);
        return ResponseEntity.ok(bookings);
    }

    // ==================== GET BOOKINGS BY STATUS ====================
    /**
     * Get bookings by status
     * GET /api/bookings/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getBookingsByStatus(@PathVariable String status) {
        try {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            List<Booking> bookings = bookingService.getBookingsByStatus(bookingStatus);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid booking status. Valid values: " + java.util.Arrays.toString(BookingStatus.values()));
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== GET PENDING BOOKINGS ====================
    /**
     * Get all pending bookings (for admin review)
     * GET /api/bookings/pending
     */
    @GetMapping("/admin/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        List<Booking> bookings = bookingService.getPendingBookings();
        return ResponseEntity.ok(bookings);
    }

    // ==================== GET UPCOMING BOOKINGS FOR FACILITY ====================
    /**
     * Get upcoming approved bookings for a facility
     * GET /api/bookings/upcoming/{facilityId}
     */
    @GetMapping("/upcoming/{facilityId}")
    public ResponseEntity<List<Booking>> getUpcomingBookings(@PathVariable Long facilityId) {
        List<Booking> bookings = bookingService.getUpcomingBookingsByFacility(facilityId);
        return ResponseEntity.ok(bookings);
    }

    // ==================== GET BOOKINGS BY DATE RANGE ====================
    /**
     * Get bookings for a facility within a date range
     * GET /api/bookings/facility/{facilityId}/range?startDate=2026-04-20&endDate=2026-04-30
     */
    @GetMapping("/facility/{facilityId}/range")
    public ResponseEntity<List<Booking>> getBookingsByDateRange(
            @PathVariable Long facilityId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Booking> bookings = bookingService.getBookingsByDateRange(facilityId, startDate, endDate);
        return ResponseEntity.ok(bookings);
    }

    // ==================== APPROVE BOOKING ====================
    /**
     * Approve a pending booking (Admin only)
     * PUT /api/bookings/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        try {
            Booking booking = bookingService.approveBooking(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== REJECT BOOKING ====================
    /**
     * Reject a pending booking (Admin only)
     * PUT /api/bookings/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            Booking booking = bookingService.rejectBooking(id, reason);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== CANCEL BOOKING ====================
    /**
     * Cancel a booking
     * PUT /api/bookings/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            Booking booking = bookingService.cancelBooking(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== UPDATE BOOKING ====================
    /**
     * Update a pending booking
     * PUT /api/bookings/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @RequestBody Booking booking) {
        try {
            Booking updatedBooking = bookingService.updateBooking(id, booking);
            return ResponseEntity.ok(updatedBooking);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== DELETE BOOKING ====================
    /**
     * Delete a booking (only pending or rejected bookings can be deleted)
     * DELETE /api/bookings/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==================== CHECK TIME CONFLICT ====================
    /**
     * Check if there's a time conflict for a facility on a given date
     * GET /api/bookings/check-conflict?facilityId=1&date=2026-04-20&startTime=10:00&endTime=12:00
     */
    @GetMapping("/check-conflict")
    public ResponseEntity<Boolean> checkTimeConflict(
            @RequestParam Long facilityId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        boolean hasConflict = bookingService.hasTimeConflict(facilityId, date, startTime, endTime);
        return ResponseEntity.ok(hasConflict);
    }
}
