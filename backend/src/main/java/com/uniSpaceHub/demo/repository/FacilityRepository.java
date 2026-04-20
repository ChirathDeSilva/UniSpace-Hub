package com.uniSpaceHub.demo.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uniSpaceHub.demo.model.FacilitiesModels.Facility;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.model.FacilityType;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    // Find all facilities by type (Lab, LectureHall, etc.)
    List<Facility> findByType(FacilityType type);

    // Find all facilities by status (Available, Booked, etc.)
    List<Facility> findByStatus(FacilityStatus status);

    // Find facilities by both type and status
    List<Facility> findByTypeAndStatus(FacilityType type, FacilityStatus status);

        List<Facility> findByNameContainingIgnoreCase(String name);

    // Optional: search by location
    List<Facility> findByLocationContainingIgnoreCase(String location);
}
