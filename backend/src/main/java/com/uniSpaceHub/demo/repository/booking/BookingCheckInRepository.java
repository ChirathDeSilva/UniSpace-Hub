package com.uniSpaceHub.demo.repository.booking;

import com.uniSpaceHub.demo.model.booking.BookingCheckIn;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface BookingCheckInRepository extends JpaRepository<BookingCheckIn, Long> {
    
    List<BookingCheckIn> findByBookingIdOrderByCheckInTimeDesc(Long bookingId);
}
