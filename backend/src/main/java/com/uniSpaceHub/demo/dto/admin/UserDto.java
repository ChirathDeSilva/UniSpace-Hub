package com.uniSpaceHub.demo.dto.admin;

public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String pictureUrl;
    private String role;
    private String providerId;

    public UserDto(Long id, String email, String fullName, String pictureUrl, String role, String providerId) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.pictureUrl = pictureUrl;
        this.role = role;
        this.providerId = providerId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
}
