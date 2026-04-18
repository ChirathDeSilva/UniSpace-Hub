package com.uniSpaceHub.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.uniSpaceHub.demo.model.Timetable;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    // Find timetable entries for a specific facility
    List<Timetable> findByFacilityId(Long facilityId);

    // Find active timetable entries at a given time
    List<Timetable> findByStartTimeBeforeAndEndTimeAfter(LocalDateTime now1, LocalDateTime now2);
}
