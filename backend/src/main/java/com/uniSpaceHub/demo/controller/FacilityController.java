package com.uniSpaceHub.demo.controller;

import com.uniSpaceHub.demo.dto.Facilitydtos.*;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.model.FacilityType;
import com.uniSpaceHub.demo.model.FacilitiesModels.*;
import com.uniSpaceHub.demo.service.FacilityService;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    // ---------- Generic Create ----------
    @PostMapping
    public FacilityDTO createFacility(@Valid @RequestBody FacilityDTO dto) {
        Facility facility = buildEntityFromDTO(dto);
        Facility saved = facilityService.createFacility(facility);
        return convertToDTO(saved);
    }

    // ---------- Generic Update ----------
    @PutMapping("/{id}")
    public FacilityDTO updateFacility(@PathVariable Long id, @Valid @RequestBody FacilityDTO dto) {
        Facility facility = buildEntityFromDTO(dto);
        facility.setId(id);
        Facility updated = facilityService.updateFacility(facility);
        return convertToDTO(updated);
    }

    // ---------- Delete ----------
    @DeleteMapping("/{id}")
    public void deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
    }

    // ---------- Read ----------
    @GetMapping("/{id}")
    public FacilityDTO getFacilityById(@PathVariable Long id) {
        Facility facility = facilityService.getFacilityById(id);
        return convertToDTO(facility);
    }

    @GetMapping
    public List<FacilityDTO> getAllFacilities() {
        return facilityService.getAllFacilities()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ---------- Filtering / Search ----------
    @GetMapping("/type/{type}")
    public List<FacilityDTO> getFacilitiesByType(@PathVariable FacilityType type) {
        return facilityService.getFacilitiesByType(type)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/status/{status}")
    public List<FacilityDTO> getFacilitiesByStatus(@PathVariable FacilityStatus status) {
        return facilityService.getFacilitiesByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/type/{type}/status/{status}")
    public List<FacilityDTO> getFacilitiesByTypeAndStatus(@PathVariable FacilityType type,
                                                          @PathVariable FacilityStatus status) {
        return facilityService.getFacilitiesByTypeAndStatus(type, status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/search/name")
    public List<FacilityDTO> searchFacilitiesByName(@RequestParam String name) {
        return facilityService.searchFacilitiesByName(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/search/location")
    public List<FacilityDTO> searchFacilitiesByLocation(@RequestParam String location) {
        return facilityService.searchFacilitiesByLocation(location)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ---------- Helper: Build Entity ----------
    private Facility buildEntityFromDTO(FacilityDTO dto) {
        switch (dto.getType()) {
            case LAB -> {
                Lab lab = new Lab();
                copyCommonFields(dto, lab);
                if (dto instanceof LabDTO labDTO) {
                    lab.setLabType(labDTO.getLabType());
                    lab.setCapacity(labDTO.getCapacity());
                    lab.setAvailableTime(labDTO.getAvailableTime());
                }
                return lab;
            }
            case HALL -> {
                LectureHall hall = new LectureHall();
                copyCommonFields(dto, hall);
                if (dto instanceof LectureHallDTO hallDTO) {
                    hall.setTotalSeats(hallDTO.getTotalSeats());
                    hall.setAvailableSeats(hallDTO.getAvailableSeats());
                    hall.setAvailableTime(hallDTO.getAvailableTime());
                }
                return hall;
            }
            case CONFERENCE -> {
                ConferenceRoom room = new ConferenceRoom();
                copyCommonFields(dto, room);
                if (dto instanceof ConferenceRoomDTO roomDTO) {
                    room.setCapacity(roomDTO.getCapacity());
                    room.setAvailableTime(roomDTO.getAvailableTime());
                    room.setProjectorAvailable(roomDTO.isProjectorAvailable());
                }
                return room;
            }
            case SPORTAREA -> {
                SportArea sport = new SportArea();
                copyCommonFields(dto, sport);
                if (dto instanceof SportAreaDTO sportDTO) {
                    sport.setSportType(sportDTO.getSportType());
                    sport.setCapacity(sportDTO.getCapacity());
                    sport.setAvailableTime(sportDTO.getAvailableTime());
                    sport.setBookingStatus(sportDTO.getBookingStatus());
                }
                return sport;
            }
            case EQUIPMENT -> {
                Equipment eq = new Equipment();
                copyCommonFields(dto, eq);
                if (dto instanceof EquipmentDTO eqDTO) {
                    eq.setEquipmentType(eqDTO.getEquipmentType());
                    eq.setTotalQuantity(eqDTO.getTotalQuantity());
                    eq.setAvailableQuantity(eqDTO.getAvailableQuantity());
                }
                return eq;
            }
            case AUDITORIUM -> {
                Auditorium aud = new Auditorium();
                copyCommonFields(dto, aud);
                if (dto instanceof AuditoriumDTO audDTO) {
                    aud.setSeatingCapacity(audDTO.getSeatingCapacity());
                    aud.setAvailableTime(audDTO.getAvailableTime());
                }
                return aud;
            }
            default -> throw new IllegalArgumentException("Unsupported facility type: " + dto.getType());
        }
    }

    private void copyCommonFields(FacilityDTO dto, Facility facility) {
        facility.setName(dto.getName());
        facility.setLocation(dto.getLocation());
        facility.setType(dto.getType());
        facility.setStatus(dto.getStatus());
    }

    // ---------- Helper: Convert Entity to DTO ----------
    private FacilityDTO convertToDTO(Facility facility) {
        if (facility instanceof Lab lab) {
            LabDTO dto = new LabDTO();
            copyCommonDTOFields(lab, dto);
            dto.setLabType(lab.getLabType());
            dto.setCapacity(lab.getCapacity());
            dto.setAvailableTime(lab.getAvailableTime());
            return dto;
        } else if (facility instanceof LectureHall hall) {
            LectureHallDTO dto = new LectureHallDTO();
            copyCommonDTOFields(hall, dto);
            dto.setTotalSeats(hall.getTotalSeats());
            dto.setAvailableSeats(hall.getAvailableSeats());
            dto.setAvailableTime(hall.getAvailableTime());
            return dto;
        } else if (facility instanceof ConferenceRoom room) {
            ConferenceRoomDTO dto = new ConferenceRoomDTO();
            copyCommonDTOFields(room, dto);
            dto.setCapacity(room.getCapacity());
            dto.setAvailableTime(room.getAvailableTime());
            dto.setProjectorAvailable(room.isProjectorAvailable());
            return dto;
        } else if (facility instanceof SportArea sport) {
            SportAreaDTO dto = new SportAreaDTO();
            copyCommonDTOFields(sport, dto);
            dto.setSportType(sport.getSportType());
            dto.setCapacity(sport.getCapacity());
            dto.setAvailableTime(sport.getAvailableTime());
            dto.setBookingStatus(sport.getBookingStatus());
            return dto;
        } else if (facility instanceof Equipment eq) {
            EquipmentDTO dto = new EquipmentDTO();
            copyCommonDTOFields(eq, dto);
            dto.setEquipmentType(eq.getEquipmentType());
            dto.setTotalQuantity(eq.getTotalQuantity());
            dto.setAvailableQuantity(eq.getAvailableQuantity());
            return dto;
        } else if (facility instanceof Auditorium aud) {
            AuditoriumDTO dto = new AuditoriumDTO();
            copyCommonDTOFields(aud, dto);
            dto.setSeatingCapacity(aud.getSeatingCapacity());
            dto.setAvailableTime(aud.getAvailableTime());
            return dto;
        }
        // fallback
        FacilityDTO dto = new FacilityDTO();
        copyCommonDTOFields(facility, dto);
        return dto;
    }

    private void copyCommonDTOFields(Facility facility, FacilityDTO dto) {
        dto.setId(facility.getId());
        dto.setName(facility.getName());
        dto.setLocation(facility.getLocation());
        dto.setType(facility.getType());
        dto.setStatus(facility.getStatus());
    }
}
