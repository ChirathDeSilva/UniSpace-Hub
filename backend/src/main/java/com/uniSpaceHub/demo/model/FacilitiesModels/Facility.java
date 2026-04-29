package com.uniSpaceHub.demo.model.FacilitiesModels;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.model.FacilityType;
import com.fasterxml.jackson.annotation.JsonSubTypes;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "facilityType")
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

    private String name;
    private String location;

    @Enumerated(EnumType.STRING)
    private FacilityType type;

    @Enumerated(EnumType.STRING)
    private FacilityStatus status;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public FacilityType getType() {
        return type;
    }

    public void setType(FacilityType type) {
        this.type = type;
    }

    public FacilityStatus getStatus() {
        return status;
    }

    public void setStatus(FacilityStatus status) {
        this.status = status;
    }
}