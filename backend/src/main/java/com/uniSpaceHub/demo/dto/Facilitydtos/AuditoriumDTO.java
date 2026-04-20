package com.uniSpaceHub.demo.dto.Facilitydtos;

public class AuditoriumDTO extends FacilityDTO {
    private int seatingCapacity;
    private String availableTime;

    public int getSeatingCapacity() { return seatingCapacity; }
    public void setSeatingCapacity(int seatingCapacity) { this.seatingCapacity = seatingCapacity; }

    public String getAvailableTime() { return availableTime; }
    public void setAvailableTime(String availableTime) { this.availableTime = availableTime; }
}