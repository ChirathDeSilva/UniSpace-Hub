package com.uniSpaceHub.demo.controller.admin;

import com.uniSpaceHub.demo.dto.admin.CreateUserRequest;
import com.uniSpaceHub.demo.dto.admin.RoleChangeRequest;
import com.uniSpaceHub.demo.dto.admin.UserDto;
import com.uniSpaceHub.demo.model.Role;
import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.model.UserRole;
import com.uniSpaceHub.demo.repository.RoleRepository;
import com.uniSpaceHub.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream().map(user -> UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .pictureUrl(user.getPictureUrl())
                .role(user.getRole().getName().name())
                .providerId(user.getProviderId())
                .contactNumber(user.getContactNumber())
                .department(user.getDepartment())
                .studentId(user.getStudentId())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(userDtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User with this email already exists");
        }

        try {
            // Validate and convert role string to UserRole enum
            UserRole newUserRole = UserRole.valueOf(request.getRole());
            Optional<Role> roleOpt = roleRepository.findByName(newUserRole);
            
            if (roleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role");
            }

            // Create new user
            User newUser = new User();
            newUser.setEmail(request.getEmail());
            newUser.setFullName(request.getFullName());
            newUser.setRole(roleOpt.get());
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setLastLogin(null);
            
            // Set password if provided
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                newUser.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            // Set common fields
            newUser.setContactNumber(request.getContactNumber());
            newUser.setBio(request.getBio());
            newUser.setDepartment(request.getDepartment());

            // Set role-specific fields
            if (newUserRole == UserRole.ROLE_STUDENT) {
                newUser.setStudentId(request.getStudentId());
                newUser.setDegreeProgram(request.getDegreeProgram());
                newUser.setCurrentSemester(request.getCurrentSemester());
            } else if (newUserRole == UserRole.ROLE_LECTURER) {
                newUser.setTitle(request.getTitle());
                newUser.setResearchInterests(request.getResearchInterests());
                newUser.setOfficeRoomNumber(request.getOfficeRoomNumber());
                newUser.setModules(request.getModules());
            }

            User savedUser = userRepository.save(newUser);

            // Return created user as DTO
            UserDto userDto = UserDto.builder()
                    .id(savedUser.getId())
                    .email(savedUser.getEmail())
                    .fullName(savedUser.getFullName())
                    .pictureUrl(savedUser.getPictureUrl())
                    .role(savedUser.getRole().getName().name())
                    .providerId(savedUser.getProviderId())
                    .contactNumber(savedUser.getContactNumber())
                    .department(savedUser.getDepartment())
                    .studentId(savedUser.getStudentId())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role format");
        }
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeUserRole(@PathVariable Long userId, @RequestBody RoleChangeRequest request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        try {
            UserRole newUserRole = UserRole.valueOf(request.getNewRole());
            Optional<Role> roleOpt = roleRepository.findByName(newUserRole);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role");
            }
            user.setRole(roleOpt.get());
            userRepository.save(user);
            return ResponseEntity.ok("Role updated successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid role format");
        }
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
