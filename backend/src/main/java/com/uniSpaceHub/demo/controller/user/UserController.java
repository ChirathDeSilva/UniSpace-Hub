package com.uniSpaceHub.demo.controller.user;

import com.uniSpaceHub.demo.controller.auth.JwtTokenProvider;
import com.uniSpaceHub.demo.dto.user.ProfileUpdateRequest;
import com.uniSpaceHub.demo.dto.user.UserProfileDto;
import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.model.booking.Booking;
import com.uniSpaceHub.demo.repository.UserRepository;
import com.uniSpaceHub.demo.repository.booking.BookingRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    // ── Helper — extract authenticated user from JWT ───────────────────────────

    private User resolveUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            Claims claims = jwtTokenProvider.getClaimsFromToken(authHeader.substring(7));
            Long userId = Long.parseLong(claims.getSubject());
            return userRepository.findById(userId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    // ── GET /api/user/me — minimal identity (legacy, kept for compatibility) ───

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User user = resolveUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("name",   user.getFullName());
        profile.put("email",  user.getEmail());
        profile.put("role",   user.getRole() != null ? user.getRole().getName().name() : null);
        profile.put("avatar", user.getPictureUrl());

        return ResponseEntity.ok(profile);
    }

    // ── GET /api/user/profile — full profile DTO ──────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User user = resolveUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        }

        return ResponseEntity.ok(toProfileDto(user));
    }

    // ── PUT /api/user/profile — update editable profile fields ───────────────

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ProfileUpdateRequest req) {

        User user = resolveUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        }

        // Apply only the non-null fields from the request (partial update)
        if (req.getContactNumber()    != null) user.setContactNumber(req.getContactNumber());
        if (req.getBio()              != null) user.setBio(req.getBio());
        if (req.getDepartment()       != null) user.setDepartment(req.getDepartment());

        // Student fields
        if (req.getStudentId()        != null) user.setStudentId(req.getStudentId());
        if (req.getDegreeProgram()    != null) user.setDegreeProgram(req.getDegreeProgram());
        if (req.getCurrentSemester()  != null) user.setCurrentSemester(req.getCurrentSemester());

        // Lecturer fields
        if (req.getTitle()            != null) user.setTitle(req.getTitle());
        if (req.getResearchInterests()!= null) user.setResearchInterests(req.getResearchInterests());
        if (req.getOfficeRoomNumber() != null) user.setOfficeRoomNumber(req.getOfficeRoomNumber());
        if (req.getModules()          != null) user.setModules(req.getModules());

        userRepository.save(user);
        return ResponseEntity.ok(toProfileDto(user));
    }

    // ── GET /api/user/bookings/recent — last 5 bookings for profile widget ────

    @GetMapping("/bookings/recent")
    public ResponseEntity<?> getRecentBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User user = resolveUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        }

        List<Booking> bookings = bookingRepository.findTop5ByUserIdOrderByCreatedAtDesc(user.getId());

        List<Map<String, Object>> result = bookings.stream().map(b -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id",          b.getId());
            map.put("bookingCode", b.getBookingCode());
            map.put("bookingDate", b.getBookingDate());
            map.put("startTime",   b.getStartTime());
            map.put("endTime",     b.getEndTime());
            map.put("status",      b.getStatus().name());
            map.put("purpose",     b.getPurpose());
            // Safely access facility name (lazy-loaded, but we're in the same transaction)
            try { map.put("facilityName", b.getFacility().getName()); }
            catch (Exception e) { map.put("facilityName", "—"); }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Private mapper ────────────────────────────────────────────────────────

    private UserProfileDto toProfileDto(User u) {
        return UserProfileDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .pictureUrl(u.getPictureUrl())
                .role(u.getRole() != null ? u.getRole().getName().name() : null)
                .createdAt(u.getCreatedAt())
                .lastLogin(u.getLastLogin())
                .microsoftEmail(u.getMicrosoftEmail())
                .contactNumber(u.getContactNumber())
                .bio(u.getBio())
                .department(u.getDepartment())
                .studentId(u.getStudentId())
                .degreeProgram(u.getDegreeProgram())
                .currentSemester(u.getCurrentSemester())
                .title(u.getTitle())
                .researchInterests(u.getResearchInterests())
                .officeRoomNumber(u.getOfficeRoomNumber())
                .modules(u.getModules())
                .build();
    }
}
