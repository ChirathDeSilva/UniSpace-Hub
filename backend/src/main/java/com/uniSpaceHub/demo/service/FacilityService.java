package com.uniSpaceHub.demo.service;

import com.uniSpaceHub.demo.model.FacilityType;
import com.uniSpaceHub.demo.model.FacilitiesModels.Facility;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.repository.FacilityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    //  CRUD Operations
    public Facility createFacility(Facility facility) {
        return facilityRepository.save(facility);
    }

    public Facility updateFacility(Facility facility) {
        return facilityRepository.save(facility);
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
