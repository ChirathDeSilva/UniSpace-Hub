package com.uniSpaceHub.demo.dto.booking;


import com.uniSpaceHub.demo.model.booking.BookingStatus;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingSummaryResponse {
    private Long id;
    private String bookingCode;
    private Long facilityId;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingStatus status;
    private Boolean hasConflict;
    /** QR token — only populated for APPROVED bookings. */
    private String qrToken;
    private String studentName;
    private String studentRegNumber;

    /** HATEOAS links for navigating from a collection item to the full resource. */
    @JsonProperty("_links")
    private Map<String, String> links;
}
