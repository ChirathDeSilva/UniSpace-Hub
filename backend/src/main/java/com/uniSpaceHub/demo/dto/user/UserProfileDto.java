package com.uniSpaceHub.demo.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Full profile response returned by GET /api/user/profile.
 * Contains both the base User fields and all role-specific extended fields.
 */
@Data
@Builder
public class UserProfileDto {

    // ── Core identity ─────────────────────────────────────────────────────────
    private Long id;
    private String email;
    private String fullName;
    private String pictureUrl;
    private String role;          // e.g. "ROLE_STUDENT", "ROLE_LECTURER"
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    /** Microsoft linked account email (may differ from primary email). */
    private String microsoftEmail;

    // ── Shared editable fields ────────────────────────────────────────────────
    private String contactNumber;
    private String bio;
    private String department;

    // ── Student-specific fields ───────────────────────────────────────────────
    private String studentId;
    private String degreeProgram;
    private Integer currentSemester;

    // ── Lecturer-specific fields ──────────────────────────────────────────────
    private String title;
    private String researchInterests;
    private String officeRoomNumber;
    private String modules;       // comma-separated module names
}
