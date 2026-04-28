package com.uniSpaceHub.demo.controller.auth;

import com.uniSpaceHub.demo.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expirationMs:86400000}") // 1 day in milliseconds
    private int jwtExpirationMs;

    /**
     * Generates a signed JWT token containing the user's ID, email, and role.
     * The token is signed using HMAC-SHA256 with the secret key from application.properties.
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        // Derive a secure HMAC-SHA key from the secret string
        SecretKey signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                // The 'subject' is the user's DB ID (primary key)
                .subject(Long.toString(user.getId()))
                // Custom claims: embed email and role directly in the token
                .claim("email", user.getEmail())
                .claim("role", user.getRole() != null ? user.getRole().getName().name() : "")
                .issuedAt(now)
                .expiration(expiryDate)
                // Sign the JWT with HS256 algorithm
                .signWith(signingKey)
                .compact();
    }

    public io.jsonwebtoken.Claims getClaimsFromToken(String token) {
        SecretKey signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }
}
