package com.uniSpaceHub.demo.dto.Facilitydtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.uniSpaceHub.demo.model.FacilityStatus;
import com.uniSpaceHub.demo.model.FacilityType;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type",
    visible = true
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = LabDTO.class, name = "LAB"),
    @JsonSubTypes.Type(value = LectureHallDTO.class, name = "HALL"),
    @JsonSubTypes.Type(value = ConferenceRoomDTO.class, name = "CONFERENCE"),
    @JsonSubTypes.Type(value = SportAreaDTO.class, name = "SPORTAREA"),
    @JsonSubTypes.Type(value = EquipmentDTO.class, name = "EQUIPMENT"),
    @JsonSubTypes.Type(value = AuditoriumDTO.class, name = "AUDITORIUM")
})
public class FacilityDTO {
    private Long id;
    private String name;
    private String location;
    private FacilityType type;
    private FacilityStatus status;

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