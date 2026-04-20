package com.uniSpaceHub.demo.dto.booking;

import com.uniSpaceHub.demo.model.booking.BookingStatus;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long facilityId;
    private Long userId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String adminDecisionReason;
    private String qrToken;
    private LocalDateTime checkedInAt;
    private LocalDateTime approvedAt;
    private String approvedBy;
    private LocalDateTime rejectedAt;
    private String rejectedBy;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String studentName;
    private String studentRegNumber;

    /**
     * HATEOAS hypermedia links — Uniform Interface constraint (REST Constraint 4).
     * Allows clients to navigate related resources without hardcoding URLs.
     * Follows the HAL-inspired {@code _links} convention.
     */
    @JsonProperty("_links")
    private Map<String, String> links;
}
