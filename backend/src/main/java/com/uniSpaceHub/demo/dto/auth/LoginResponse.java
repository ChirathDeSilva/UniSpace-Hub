package com.uniSpaceHub.demo.dto.auth;

/**
 * Response body returned after a successful credential-based login.
 * Contains the JWT token plus basic user info for the frontend.
 */
public class LoginResponse {

    private String token;
    private String email;
    private String fullName;
    private String role;

    public LoginResponse(String token, String email, String fullName, String role) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
