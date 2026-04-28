package com.uniSpaceHub.demo.model.FacilitiesModels;

import jakarta.persistence.Entity;

@Entity
public class ConferenceRoom extends Facility {
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