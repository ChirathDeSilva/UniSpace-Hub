package com.uniSpaceHub.demo.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveBookingRequest {
    
    @Size(max = 500, message = "Decision reason cannot exceed 500 characters")
    private String adminDecisionReason;
    
    @NotBlank(message = "Approved by (Admin ID) is required")
    private String approvedBy;
}
