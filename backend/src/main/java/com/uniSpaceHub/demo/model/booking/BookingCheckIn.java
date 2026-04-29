package com.uniSpaceHub.demo.model.booking;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "booking_check_ins")
public class BookingCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "qr_token_used")
    private String qrTokenUsed;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CheckInStatus status;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @PrePersist
    public void onCreate() {
        if (this.checkInTime == null) {
            this.checkInTime = LocalDateTime.now();
        }
    }
}
