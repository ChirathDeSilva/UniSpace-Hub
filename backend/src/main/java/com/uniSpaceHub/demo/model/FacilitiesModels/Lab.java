package com.uniSpaceHub.demo.model.FacilitiesModels;


import jakarta.persistence.Entity;

@Entity
public class Lab extends Facility {
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