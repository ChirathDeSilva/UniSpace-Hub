package com.uniSpaceHub.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Custom Spring Security configuration.
 *
 * Why this class is needed:
 * - spring-boot-starter-oauth2-client is on the classpath with Google registered.
 * - Without this config, Spring Security's default behaviour intercepts ALL
 *   unauthenticated requests and redirects them to the Google OAuth2 flow —
 *   even a request to /api/auth/microsoft/login — before the controller runs.
 * - This config disables that auto-redirect and opens /api/auth/** so our
 *   AuthController can handle both Google and Microsoft flows manually.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            // ── CSRF ──────────────────────────────────────────────────────────
            // Disabled for stateless REST API (JWT-based, no session cookies).
            .csrf(AbstractHttpConfigurer::disable)

            // ── Session management ────────────────────────────────────────────
            // STATELESS: no server-side session; every request must carry a JWT.
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── Authorization rules ───────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                // OAuth2 login/callback endpoints must be publicly accessible
                // (the browser is not authenticated at this point)
                .requestMatchers("/api/auth/**").permitAll()
                // Facility CRUD is used directly by the public facility pages.
                .requestMatchers("/api/facilities/**").permitAll()
                // All other endpoints require a valid JWT (enforced elsewhere)
                .anyRequest().authenticated()
            )

            // ── Disable Spring's built-in OAuth2 login redirect ───────────────
            // Spring Security would otherwise hijack unauthenticated requests
            // and redirect them to /oauth2/authorization/google automatically.
            // Our AuthController owns the full OAuth2 flow for both providers.
            .oauth2Login(AbstractHttpConfigurer::disable);

        return http.build();
    }

    /**
     * BCrypt password encoder bean.
     * Used by AuthController to verify hashed passwords for Admin and Technician logins.
     * Strength factor 12 is a good balance of security vs. performance.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:4173"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/facilities/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
