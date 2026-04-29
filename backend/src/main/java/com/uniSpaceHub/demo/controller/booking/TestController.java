package com.uniSpaceHub.demo.controller.booking;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

/**
 * TEST CONTROLLER - DEPRECATED AND DISABLED
 * 
 * This controller contained unsafe test endpoints that exposed all bookings
 * without authentication. It has been disabled to prevent information disclosure.
 * 
 * Testing should use proper integration tests with appropriate authentication.
 * 
 * @deprecated Will be removed in version 2.0. Use integration tests instead.
 */
@RestController
@RequiredArgsConstructor
@Deprecated(since = "1.0", forRemoval = true)
public class TestController {
    
    // All endpoints removed for security reasons
    // Use SpringBootTest with @WithMockUser for unit testing instead
    
}
