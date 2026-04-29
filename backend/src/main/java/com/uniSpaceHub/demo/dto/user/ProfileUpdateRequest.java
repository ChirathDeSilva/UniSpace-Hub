package com.uniSpaceHub.demo.dto.user;

import lombok.Data;

/**
 * Request body for PUT /api/user/profile.
 * All fields are optional — null values mean "don't change this field".
 */
@Data
public class ProfileUpdateRequest {

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
    private String modules;   // comma-separated list of module names
}
