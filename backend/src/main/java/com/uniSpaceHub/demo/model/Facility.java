package com.uniSpaceHub.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;



@Entity
@Inheritance(strategy = InheritanceType.JOINED) // Each subclass gets its own table
@Data
@NoArgsConstructor
@AllArgsConstructor


public abstract class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;        // Facility name
    private String location;    // Facility location

    @Enumerated(EnumType.STRING)
    private FacilityType type;  // Enum: HALL, LAB, SPORTAREA, EQUIPMENT, LIBRARY, CONFERENCE, AUDITORIUM, MAINHALL

    @Enumerated(EnumType.STRING)
    private FacilityStatus status; // Available, Booked, Maintenance, Not in Service

     // Explicit getters/setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}

// Academic Facilities
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
class LectureHall extends Facility {
    private int totalSeats;
    private int availableSeats;
    private String availableTime;
}

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
class Lab extends Facility {
    private String labType; // Chemistry, Computer, etc.
    private int capacity;
    private String availableTime;
}

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
class LibraryArea extends Facility {
    private int totalSeats;
    private int availableSeats;
    private String areaType; // Group study, quiet zone
}

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
class ConferenceRoom extends Facility {
    private int capacity;
    private boolean projectorAvailable;
    private String availableTime;
}

// Sports & Recreation Facilities
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
class SportArea extends Facility {
    private String sportType; // Football, Basketball, Tennis, Swimming, Badminton, etc.
    private int capacity;
    private String availableTime;
    private String bookingStatus;
}

// Equipment Facilities
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
class Equipment extends Facility {
    private String equipmentType;   // e.g., Projector, Basketball, Laptop
    private int totalQuantity;      // total items available
    private int availableQuantity;  // items currently available
}

// Administrative / Utility Facilities
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
class Auditorium extends Facility {
    private int seatingCapacity;
    private String availableTime;
}
