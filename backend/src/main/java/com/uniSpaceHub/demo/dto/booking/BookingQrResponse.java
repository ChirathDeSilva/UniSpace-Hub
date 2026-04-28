package com.uniSpaceHub.demo.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingQrResponse {
    private String bookingCode;
    private String qrToken;
}
