package com.uniSpaceHub.demo.repository;

import com.uniSpaceHub.demo.model.Booking;
import com.uniSpaceHub.demo.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Find bookings by user
    List<Booking> findByUserId(Long userId);

    // Find bookings by facility
    List<Booking> findByFacilityId(Long facilityId);

    // Find bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Find bookings for a specific facility on a specific date
    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId AND b.date = :date ORDER BY b.startTime")
    List<Booking> findByFacilityAndDate(@Param("facilityId") Long facilityId, @Param("date") LocalDate date);

    // Find bookings for a user on a specific date
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.date = :date ORDER BY b.startTime")
    List<Booking> findByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    // Find upcoming bookings for a facility
    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId AND b.date >= CURRENT_DATE AND b.status = 'APPROVED' ORDER BY b.date, b.startTime")
    List<Booking> findUpcomingBookingsByFacility(@Param("facilityId") Long facilityId);

    // Find all pending bookings (for admin review)
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    // Find bookings by date range
    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId AND b.date BETWEEN :startDate AND :endDate ORDER BY b.date, b.startTime")
    List<Booking> findByFacilityAndDateRange(@Param("facilityId") Long facilityId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
