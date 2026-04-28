package com.uniSpaceHub.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @Column(nullable = true, unique = false)
    private Integer id;

    @Enumerated(EnumType.STRING) // Stores "ROLE_ADMIN" as a string in SQL
    @Column(nullable = true, unique = false, length = 20)
    private UserRole name; 

    public Role() {}

    public Role(UserRole name) {
        this.name = name;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public UserRole getName() { return name; }
    public void setName(UserRole name) { this.name = name; }

    @Override
    public String toString() { 
        return name.name(); 
    }
}