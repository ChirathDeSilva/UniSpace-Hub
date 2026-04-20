package com.uniSpaceHub.demo.controller;

import com.uniSpaceHub.demo.model.Timetable;
import com.uniSpaceHub.demo.service.TimetableService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    //  Get timetable entries for a specific facility
    @GetMapping("/facility/{facilityId}")
    public List<Timetable> getTimetableForFacility(@PathVariable Long facilityId) {
        return timetableService.getTimetableForFacility(facilityId);
    }

    //  Get active timetable entries at current time
    @GetMapping("/active")
    public List<Timetable> getActiveTimetableEntries() {
        LocalDateTime now = LocalDateTime.now();
        return timetableService.getActiveTimetableEntries(now);
    }

    // trigger manual status update from timetable
    @PostMapping("/update-status")
    public String updateFacilityStatusFromTimetable() {
        timetableService.updateFacilityStatusFromTimetable();
        return "Facility statuses updated based on active timetable entries.";
    }

    // trigger manual reset to NOT_IN_SERVICE (night)
    @PostMapping("/set-night-status")
    public String setFacilitiesNotInService() {
        timetableService.setFacilitiesNotInService();
        return "All facilities set to NOT_IN_SERVICE.";
    }

    // trigger manual reset to AVAILABLE (morning)
    @PostMapping("/set-morning-status")
    public String setFacilitiesAvailableMorning() {
        timetableService.setFacilitiesAvailableMorning();
        return "All facilities reset to AVAILABLE.";
    }
}
