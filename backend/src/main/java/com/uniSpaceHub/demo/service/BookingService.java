package com.uniSpaceHub.demo.service;

import com.uniSpaceHub.demo.model.Booking;
import com.uniSpaceHub.demo.model.BookingStatus;
import com.uniSpaceHub.demo.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    // ==================== CREATE BOOKING ====================
    public Booking createBooking(Booking booking) {
        // Validation: Check if time range is valid
        if (!booking.isTimeSlotValid()) {
            throw new RuntimeException("Invalid time range: Start time must be before end time");
        }

        // Validation: Check attendees count
        if (booking.getAttendeesCount() < 1) {
            throw new RuntimeException("Attendees count must be at least 1");
        }

        // Validation: Check for time conflicts
        List<Booking> conflictingBookings = bookingRepository.findByFacilityAndDate(
                booking.getFacility().getId(), 
                booking.getDate()
        );

        for (Booking existing : conflictingBookings) {
            if (existing.getStatus() == BookingStatus.APPROVED && booking.hasTimeConflict(existing)) {
                throw new RuntimeException("Time slot conflict: This facility is already booked during the requested time");
            }
        }

        // Set default status
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    // ==================== GET ALL BOOKINGS ====================
    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ==================== GET BOOKING BY ID ====================
    @Transactional(readOnly = true)
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    // ==================== GET USER BOOKINGS ====================
    @Transactional(readOnly = true)
    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    // ==================== GET FACILITY BOOKINGS ====================
    @Transactional(readOnly = true)
    public List<Booking> getFacilityBookings(Long facilityId) {
        return bookingRepository.findByFacilityId(facilityId);
    }

    // ==================== GET BOOKINGS BY STATUS ====================
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    // ==================== GET PENDING BOOKINGS (FOR ADMIN) ====================
    @Transactional(readOnly = true)
    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.PENDING);
    }

    // ==================== GET UPCOMING BOOKINGS FOR FACILITY ====================
    @Transactional(readOnly = true)
    public List<Booking> getUpcomingBookingsByFacility(Long facilityId) {
        return bookingRepository.findUpcomingBookingsByFacility(facilityId);
    }

    // ==================== GET BOOKINGS BY DATE RANGE ====================
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByDateRange(Long facilityId, LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findByFacilityAndDateRange(facilityId, startDate, endDate);
    }

    // ==================== APPROVE BOOKING ====================
    public Booking approveBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    // ==================== REJECT BOOKING ====================
    public Booking rejectBooking(Long bookingId, String reason) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return bookingRepository.save(booking);
    }

    // ==================== CANCEL BOOKING ====================
    public Booking cancelBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        /*if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }*/

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    // ==================== UPDATE BOOKING ====================
    public Booking updateBooking(Long bookingId, Booking updatedBooking) {
        Booking booking = getBookingById(bookingId);

        // Only allow updates for PENDING bookings
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be updated");
        }

        // Validation: Check if time range is valid
        if (!updatedBooking.isTimeSlotValid()) {
            throw new RuntimeException("Invalid time range: Start time must be before end time");
        }

        // Update fields
        booking.setDate(updatedBooking.getDate());
        booking.setStartTime(updatedBooking.getStartTime());
        booking.setEndTime(updatedBooking.getEndTime());
        booking.setPurpose(updatedBooking.getPurpose());
        booking.setAttendeesCount(updatedBooking.getAttendeesCount());

        return bookingRepository.save(booking);
    }

    // ==================== DELETE BOOKING ====================
    public void deleteBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);

        // Only allow deletion for PENDING and REJECTED bookings
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.REJECTED) {
            throw new RuntimeException("Only pending or rejected bookings can be deleted");
        }

        bookingRepository.deleteById(bookingId);
    }

    // ==================== CHECK TIME CONFLICT ====================
    @Transactional(readOnly = true)
    public boolean hasTimeConflict(Long facilityId, LocalDate date, String startTime, String endTime) {
        List<Booking> bookings = bookingRepository.findByFacilityAndDate(facilityId, date);
        
        LocalTime reqStartTime = LocalTime.parse(startTime);
        LocalTime reqEndTime = LocalTime.parse(endTime);
        
        // Check if any approved booking has a time conflict
        for (Booking booking : bookings) {
            if (booking.getStatus() == BookingStatus.APPROVED) {
                // Check for actual time conflict
                if (reqStartTime.isBefore(booking.getEndTime()) && 
                    reqEndTime.isAfter(booking.getStartTime())) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
