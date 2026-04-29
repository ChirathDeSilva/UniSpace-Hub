package com.uniSpaceHub.demo.repository;

import com.uniSpaceHub.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import com.uniSpaceHub.demo.model.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole_NameIn(List<UserRole> roles);

    /** Find by the Microsoft-specific email stored at first MS OAuth login. */
    Optional<User> findByMicrosoftEmail(String microsoftEmail);

    /** Find by the Microsoft OID (object ID from Microsoft Graph). */
    Optional<User> findByMicrosoftProviderId(String microsoftProviderId);

    /** Find by Google OAuth sub/id. */
    Optional<User> findByProviderId(String providerId);
}
