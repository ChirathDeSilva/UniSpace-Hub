package com.uniSpaceHub.demo.repository.booking;

import com.uniSpaceHub.demo.model.booking.Booking;
import com.uniSpaceHub.demo.model.booking.BookingStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    // Find bookings by user
    List<Booking> findByUserId(Long userId);

    // Find bookings by facility
    List<Booking> findByFacilityId(Long facilityId);

    // Find bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Find bookings for a specific facility on a specific date
    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId AND b.bookingDate = :date ORDER BY b.startTime")
    List<Booking> findByFacilityAndDate(@Param("facilityId") Long facilityId, @Param("date") LocalDate date);

    // Find bookings for a user on a specific date
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.bookingDate = :date ORDER BY b.startTime")
    List<Booking> findByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    // Find upcoming bookings for a facility
    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId AND b.bookingDate >= CURRENT_DATE AND b.status = :status ORDER BY b.bookingDate, b.startTime")
    List<Booking> findUpcomingBookingsByFacility(@Param("facilityId") Long facilityId, @Param("status") BookingStatus status);

    // Find all pending bookings (for admin review)
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    // Find bookings by date range
    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId AND b.bookingDate BETWEEN :startDate AND :endDate ORDER BY b.bookingDate, b.startTime")
    List<Booking> findByFacilityAndDateRange(@Param("facilityId") Long facilityId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Find booking by booking code
    Optional<Booking> findByBookingCode(String bookingCode);

        Optional<Booking> findByQrToken(String qrToken);

    // Find conflicting bookings (time overlap detection)
        // Logic: (newStart < existingEnd) AND (newEnd > existingStart)
    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId " +
           "AND b.bookingDate = :bookingDate " +
           "AND b.status IN :statuses " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime " +
           "AND (:excludeId IS NULL OR b.id != :excludeId)")
    List<Booking> findConflictingBookings(@Param("facilityId") Long facilityId,
                                          @Param("bookingDate") LocalDate bookingDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("statuses") List<BookingStatus> statuses,
                                          @Param("excludeId") Long excludeId);
}
