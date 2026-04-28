package com.uniSpaceHub.demo.dto.booking;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "Facility ID is required")
    private Long facilityId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(max = 150, message = "Purpose cannot exceed 150 characters")
    private String purpose;

    @Min(value = 1, message = "Expected attendees must be at least 1")
    private Integer expectedAttendees;

    @NotBlank(message = "Student name is required")
    @Size(max = 200, message = "Student name cannot exceed 200 characters")
    private String studentName;

    @NotBlank(message = "Student registration number is required")
    @Size(max = 50, message = "Registration number cannot exceed 50 characters")
    private String studentRegNumber;
}
