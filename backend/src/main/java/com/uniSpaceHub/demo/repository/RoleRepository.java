package com.uniSpaceHub.demo.repository;

import com.uniSpaceHub.demo.model.Role;
import com.uniSpaceHub.demo.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(UserRole name);
}
