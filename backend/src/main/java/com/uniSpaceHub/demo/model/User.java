package com.uniSpaceHub.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;

    private String pictureUrl;

    @Column(unique = true)
    private String providerId; // Google OAuth2 'sub' ID

    /**
     * Microsoft OAuth2 account object ID (OID from Microsoft Graph).
     * Stored separately from Google's providerId so both providers can coexist
     * on the same user account without overwriting each other.
     */
    @Column(name = "microsoft_provider_id", unique = true)
    private String microsoftProviderId;

    /**
     * The Microsoft account email (mail or userPrincipalName from Graph API).
     * A user's Microsoft email may differ from their primary registered email
     * (e.g. primary = university email, Microsoft = personal outlook.com).
     * Stored so we can look up a user by their Microsoft identity.
     */
    @Column(name = "microsoft_email")
    private String microsoftEmail;

    /**
     * BCrypt-hashed password.
     * Only set for ROLE_ADMIN and ROLE_TECHNICIAN (credential-based login).
     * Null for lecturers and students who use OAuth only.
     */
    @Column(name = "password_hash")
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;

    // ── Shared profile fields ─────────────────────────────────────────────────

    /** Contact / mobile number — editable by the user. */
    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    /** Short personal/professional bio. */
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    /** Faculty or department (shared by both students and lecturers). */
    @Column(name = "department", length = 150)
    private String department;

    // ── Student-specific fields ───────────────────────────────────────────────

    /** University student registration number (e.g. "IT21234567"). */
    @Column(name = "student_id", length = 30)
    private String studentId;

    /** Degree programme name (e.g. "BSc (Hons) Computer Science"). */
    @Column(name = "degree_program", length = 200)
    private String degreeProgram;

    /** Current academic semester (1-8 for a 4-year programme). */
    @Column(name = "current_semester")
    private Integer currentSemester;

    // ── Lecturer-specific fields ──────────────────────────────────────────────

    /** Academic title prefix (e.g. "Dr.", "Prof.", "Mr.", "Ms."). */
    @Column(name = "title", length = 20)
    private String title;

    /** Research interests, stored as free text (comma-separated keywords). */
    @Column(name = "research_interests", columnDefinition = "TEXT")
    private String researchInterests;

    /** Physical office room identifier (e.g. "Block A – Room 204"). */
    @Column(name = "office_room_number", length = 100)
    private String officeRoomNumber;

    /**
     * Modules/units currently being taught, stored as a comma-separated list
     * (e.g. "Software Engineering,Database Systems,Algorithms").
     * A separate join-table would be overkill for a simple display requirement.
     */
    @Column(name = "modules", columnDefinition = "TEXT")
    private String modules;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters and Setters ───────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getMicrosoftProviderId() { return microsoftProviderId; }
    public void setMicrosoftProviderId(String microsoftProviderId) { this.microsoftProviderId = microsoftProviderId; }

    public String getMicrosoftEmail() { return microsoftEmail; }
    public void setMicrosoftEmail(String microsoftEmail) { this.microsoftEmail = microsoftEmail; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getDegreeProgram() { return degreeProgram; }
    public void setDegreeProgram(String degreeProgram) { this.degreeProgram = degreeProgram; }

    public Integer getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(Integer currentSemester) { this.currentSemester = currentSemester; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getResearchInterests() { return researchInterests; }
    public void setResearchInterests(String researchInterests) { this.researchInterests = researchInterests; }

    public String getOfficeRoomNumber() { return officeRoomNumber; }
    public void setOfficeRoomNumber(String officeRoomNumber) { this.officeRoomNumber = officeRoomNumber; }

    public String getModules() { return modules; }
    public void setModules(String modules) { this.modules = modules; }
}

