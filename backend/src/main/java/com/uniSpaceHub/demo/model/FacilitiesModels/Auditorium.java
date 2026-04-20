package com.uniSpaceHub.demo.model.FacilitiesModels;

import jakarta.persistence.Entity;

@Entity
public class Auditorium extends Facility {
    private int seatingCapacity;
    private String availableTime;

    public int getSeatingCapacity() { return seatingCapacity; }
    public void setSeatingCapacity(int seatingCapacity) { this.seatingCapacity = seatingCapacity; }

    public String getAvailableTime() { return availableTime; }
    public void setAvailableTime(String availableTime) { this.availableTime = availableTime; }
}