package com.uniSpaceHub.demo.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;

@Entity
@Inheritance(strategy = InheritanceType.JOINED) // Each subclass gets its own table
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "facilityType"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = LectureHall.class, name = "lectureHall"),
    @JsonSubTypes.Type(value = Lab.class, name = "lab"),
    @JsonSubTypes.Type(value = ConferenceRoom.class, name = "conferenceRoom"),
    @JsonSubTypes.Type(value = SportArea.class, name = "sportArea"),
    @JsonSubTypes.Type(value = Equipment.class, name = "equipment"),
    @JsonSubTypes.Type(value = Auditorium.class, name = "auditorium")
})
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

    // Manual getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public FacilityType getType() { return type; }
    public void setType(FacilityType type) { this.type = type; }

    public FacilityStatus getStatus() { return status; }
    public void setStatus(FacilityStatus status) { this.status = status; }
}

// Academic Facilities
@Entity
class LectureHall extends Facility {
    private int totalSeats;
    private int availableSeats;
    private String availableTime;

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }

    public String getAvailableTime() { return availableTime; }
    public void setAvailableTime(String availableTime) { this.availableTime = availableTime; }
}

@Entity
class Lab extends Facility {
    private String labType; 
    private int capacity;
    private String availableTime;

    public String getLabType() { return labType; }
    public void setLabType(String labType) { this.labType = labType; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getAvailableTime() { return availableTime; }
    public void setAvailableTime(String availableTime) { this.availableTime = availableTime; }
}

@Entity
class ConferenceRoom extends Facility {
    private int capacity;
    private boolean projectorAvailable;
    private String availableTime;

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public boolean isProjectorAvailable() { return projectorAvailable; }
    public void setProjectorAvailable(boolean projectorAvailable) { this.projectorAvailable = projectorAvailable; }

    public String getAvailableTime() { return availableTime; }
    public void setAvailableTime(String availableTime) { this.availableTime = availableTime; }
}

@Entity
class SportArea extends Facility {
    private String sportType;
    private int capacity;
    private String availableTime;
    private String bookingStatus;

    public String getSportType() { return sportType; }
    public void setSportType(String sportType) { this.sportType = sportType; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getAvailableTime() { return availableTime; }
    public void setAvailableTime(String availableTime) { this.availableTime = availableTime; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
}

@Entity
class Equipment extends Facility {
    private String equipmentType;
    private int totalQuantity;
    private int availableQuantity;

    public String getEquipmentType() { return equipmentType; }
    public void setEquipmentType(String equipmentType) { this.equipmentType = equipmentType; }

    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

    public int getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }
}

@Entity
class Auditorium extends Facility {
    private int seatingCapacity;
    private String availableTime;

    public int getSeatingCapacity() { return seatingCapacity; }
    public void setSeatingCapacity(int seatingCapacity) { this.seatingCapacity = seatingCapacity; }

    public String getAvailableTime() { return availableTime; }
    public void setAvailableTime(String availableTime) { this.availableTime = availableTime; }
}
