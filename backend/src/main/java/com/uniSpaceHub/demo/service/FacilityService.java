package com.uniSpaceHub.demo.service;

import com.uniSpaceHub.demo.model.FacilityType;
import com.uniSpaceHub.demo.model.FacilitiesModels.Facility;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.repository.FacilityRepository;
import com.uniSpaceHub.demo.service.NotificationService;
import com.uniSpaceHub.demo.model.NotificationType;
import com.uniSpaceHub.demo.model.NotificationSeverity;
import com.uniSpaceHub.demo.model.UserRole;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final NotificationService notificationService;

    public FacilityService(FacilityRepository facilityRepository, NotificationService notificationService) {
        this.facilityRepository = facilityRepository;
        this.notificationService = notificationService;
    }

    //  CRUD Operations
    public Facility createFacility(Facility facility) {
        Facility saved = facilityRepository.save(facility);
        String msg = "New Facility Added: " + saved.getName() + " is now available!";
        notificationService.sendToAllUsers(msg, NotificationType.FACILITY, NotificationSeverity.SUCCESS, saved.getId().toString());
        return saved;
    }

    public Facility updateFacility(Facility facility) {
        Facility existing = getFacilityById(facility.getId());
        Facility saved = facilityRepository.save(facility);

        if (existing.getStatus() != FacilityStatus.MAINTENANCE && saved.getStatus() == FacilityStatus.MAINTENANCE) {
            String msg = "Notice: " + saved.getName() + " is under maintenance.";
            notificationService.sendToUsersByRoles(
                List.of(UserRole.ROLE_STUDENT, UserRole.ROLE_LECTURER), 
                msg, 
                NotificationType.FACILITY, 
                NotificationSeverity.WARNING, 
                saved.getId().toString()
            );
        }

        return saved;
    }

    public void deleteFacility(Long id) {
        facilityRepository.deleteById(id);
    }

    public Facility getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found with id: " + id));
    }

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    // ✅ Filtering / Search
    public List<Facility> getFacilitiesByType(FacilityType type) {
        return facilityRepository.findByType(type);
    }

    public List<Facility> getFacilitiesByStatus(FacilityStatus status) {
        return facilityRepository.findByStatus(status);
    }

    public List<Facility> getFacilitiesByTypeAndStatus(FacilityType type, FacilityStatus status) {
        return facilityRepository.findByTypeAndStatus(type, status);
    }

    public List<Facility> searchFacilitiesByName(String name) {
        return facilityRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Facility> searchFacilitiesByLocation(String location) {
        return facilityRepository.findByLocationContainingIgnoreCase(location);
    }
}
