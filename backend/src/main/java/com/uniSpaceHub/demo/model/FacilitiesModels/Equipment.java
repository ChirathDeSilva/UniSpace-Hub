package com.uniSpaceHub.demo.model.FacilitiesModels;


import jakarta.persistence.Entity;

@Entity
public class Equipment extends Facility {
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