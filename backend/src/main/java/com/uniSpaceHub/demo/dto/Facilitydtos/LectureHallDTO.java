package com.uniSpaceHub.demo.dto.Facilitydtos;

public class LectureHallDTO extends FacilityDTO {
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