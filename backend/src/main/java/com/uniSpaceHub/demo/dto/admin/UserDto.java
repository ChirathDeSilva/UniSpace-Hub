package com.uniSpaceHub.demo.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String pictureUrl;
    private String role;
    private String providerId;
    
    // Additional fields for completeness
    private String contactNumber;
    private String department;
    private String studentId;
}
