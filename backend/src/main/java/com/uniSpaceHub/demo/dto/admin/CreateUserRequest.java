package com.uniSpaceHub.demo.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new user (admin panel).
 * Contains all necessary fields to populate the User table.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    private String password; // Optional for OAuth users, required for Admin/Technician
    
    @NotBlank(message = "Role is required")
    private String role; // ROLE_STUDENT, ROLE_LECTURER, ROLE_ADMIN, ROLE_TECHNICIAN
    
    private String contactNumber;
    private String bio;
    private String department;
    
    // Student-specific fields
    private String studentId;
    private String degreeProgram;
    private Integer currentSemester;
    
    // Lecturer-specific fields
    private String title;
    private String researchInterests;
    private String officeRoomNumber;
    private String modules;
}
