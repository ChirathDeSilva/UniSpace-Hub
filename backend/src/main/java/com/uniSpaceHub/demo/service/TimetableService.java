package com.uniSpaceHub.demo.service;

import com.uniSpaceHub.demo.model.FacilitiesModels.Facility;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.model.Timetable;
import com.uniSpaceHub.demo.repository.FacilityRepository;
import com.uniSpaceHub.demo.repository.TimetableRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TimetableService {

    private final FacilityRepository facilityRepository;
    private final TimetableRepository timetableRepository;

    public TimetableService(FacilityRepository facilityRepository,
                            TimetableRepository timetableRepository) {
        this.facilityRepository = facilityRepository;
        this.timetableRepository = timetableRepository;
    }

    // Update facility statuses based on timetable entries
    @Scheduled(fixedRate = 60000) // every minute
    public void updateFacilityStatusFromTimetable() {
        LocalDateTime now = LocalDateTime.now();
        List<Timetable> activeEntries = timetableRepository
                .findByStartTimeBeforeAndEndTimeAfter(now, now);

        for (Timetable entry : activeEntries) {
            Facility facility = entry.getFacility();
            if (facility.getStatus() != FacilityStatus.BOOKED) {
                facility.setStatus(FacilityStatus.BOOKED);
                facilityRepository.save(facility);
            }
        }
    }

    // Set all facilities to NOT_IN_SERVICE (or MAINTENANCE) at night
    @Scheduled(cron = "0 0 20 * * ?") // 8 PM daily
    public void setFacilitiesNotInService() {
        List<Facility> facilities = facilityRepository.findAll();
        for (Facility facility : facilities) {
            facility.setStatus(FacilityStatus.NOT_IN_SERVICE); // or NOT_IN_SERVICE if you add enum
            facilityRepository.save(facility);
        }
    }

    // Reset facilities to AVAILABLE in the morning
    @Scheduled(cron = "0 0 8 * * ?") // 8 AM daily
    public void setFacilitiesAvailableMorning() {
        List<Facility> facilities = facilityRepository.findAll();
        for (Facility facility : facilities) {
            facility.setStatus(FacilityStatus.AVAILABLE);
            facilityRepository.save(facility);
        }
    }

    // Optional: expose timetable queries
    public List<Timetable> getTimetableForFacility(Long facilityId) {
        return timetableRepository.findByFacilityId(facilityId);
    }

    public List<Timetable> getActiveTimetableEntries(LocalDateTime now) {
        return timetableRepository.findByStartTimeBeforeAndEndTimeAfter(now, now);
    }
}
