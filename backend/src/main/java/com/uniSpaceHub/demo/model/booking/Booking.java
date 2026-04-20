package com.uniSpaceHub.demo.model.booking;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.uniSpaceHub.demo.model.FacilitiesModels.Facility;
import com.uniSpaceHub.demo.model.User;

@Builder
@Getter
@Setter
@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_facility_date", columnList = "facility_id, booking_date"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_qr_token", columnList = "qr_token")
})
@AllArgsConstructor
@NoArgsConstructor
public class Booking {
    //  Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 30)
    private String bookingCode;

   
    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    @Column(nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(nullable = false)
    private LocalTime endTime;

    @Column(length = 500)
    private String purpose;

    @Column(name = "expected_attendees")
    private int expectedAttendees;

    // Status (ENUM)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "admin_decision_reason", length = 500)
    private String adminDecisionReason;

    // Facility and User IDs for convenient access
    @Column(name = "facility_id", insertable = false, updatable = false)
    private Long facilityId;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;

    // Relationships (PROPER FOREIGN KEYS)
    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Facility is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(name = "student_name", length = 200)
    private String studentName;

    @Column(name = "student_reg_number", length = 50)
    private String studentRegNumber;

    @Column(name = "qr_token", unique = true, length = 255)
    private String qrToken;

    // Audit Fields
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;


    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejected_by")
    private String rejectedBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private String cancelledBy;

   

    //  Auto Timestamp Handling
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingStatus.PENDING;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}