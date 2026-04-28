package com.uniSpaceHub.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS
            .cors(cors -> {})

            // Disable CSRF for REST API
            .csrf(AbstractHttpConfigurer::disable)

            // Stateless session (JWT)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Authorization rules
            .authorizeHttpRequests(auth -> auth

                // Allow preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public auth endpoints
                .requestMatchers("/api/auth/**").permitAll()

                // Public facility endpoints
                .requestMatchers(HttpMethod.GET, "/api/facilities").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/facilities/**").permitAll()

                // Public booking endpoints
                .requestMatchers(HttpMethod.POST, "/api/bookings").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/bookings").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/bookings/**").permitAll()
                // Allow admin bookings read for local/dev debugging (remove in production)
                .requestMatchers(HttpMethod.GET, "/api/admin/bookings").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/admin/bookings/**").permitAll()
                
     
               

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            // Disable default Spring OAuth login redirect
            .oauth2Login(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}