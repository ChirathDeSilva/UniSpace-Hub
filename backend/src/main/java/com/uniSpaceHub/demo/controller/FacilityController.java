package com.uniSpaceHub.demo.controller;

import com.uniSpaceHub.demo.model.Facility;
import com.uniSpaceHub.demo.model.FacilityType;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.service.FacilityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    // CRUD Endpoints
    @PostMapping
    public Facility createFacility(@RequestBody Facility facility) {
        return facilityService.createFacility(facility);
    }

    @PutMapping("/{id}")
    public Facility updateFacility(@PathVariable Long id, @RequestBody Facility facility) {
        facility.setId(id);
        return facilityService.updateFacility(facility);
    }

    @DeleteMapping("/{id}")
    public void deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
    }

    @GetMapping("/{id}")
    public Facility getFacilityById(@PathVariable Long id) {
        return facilityService.getFacilityById(id);
    }

    @GetMapping
    public List<Facility> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    // Filtering / Search Endpoints
    @GetMapping("/type/{type}")
    public List<Facility> getFacilitiesByType(@PathVariable FacilityType type) {
        return facilityService.getFacilitiesByType(type);
    }

    @GetMapping("/status/{status}")
    public List<Facility> getFacilitiesByStatus(@PathVariable FacilityStatus status) {
        return facilityService.getFacilitiesByStatus(status);
    }

    @GetMapping("/type/{type}/status/{status}")
    public List<Facility> getFacilitiesByTypeAndStatus(@PathVariable FacilityType type,
                                                       @PathVariable FacilityStatus status) {
        return facilityService.getFacilitiesByTypeAndStatus(type, status);
    }

    @GetMapping("/search/name")
    public List<Facility> searchFacilitiesByName(@RequestParam String name) {
        return facilityService.searchFacilitiesByName(name);
    }

    @GetMapping("/search/location")
    public List<Facility> searchFacilitiesByLocation(@RequestParam String location) {
        return facilityService.searchFacilitiesByLocation(location);
    }
}

