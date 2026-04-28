package com.uniSpaceHub.demo.controller.admin;

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
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream().map(user -> new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPictureUrl(),
                user.getRole().getName().name(),
                user.getProviderId()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(userDtos);
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
