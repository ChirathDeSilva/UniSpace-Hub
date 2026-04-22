package com.uniSpaceHub.demo.controller.auth;

import com.uniSpaceHub.demo.model.User;
import com.uniSpaceHub.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${app.oauth2.redirect-uri:http://localhost:8081/api/auth/google/callback}")
    private String redirectUri;

    @Value("${app.frontend.success-url:http://localhost:3000/oauth2/redirect}")
    private String frontendSuccessUrl;

    @Value("${app.frontend.error-url:http://localhost:3000/login?error=access_denied}")
    private String frontendErrorUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/google/login")
    public RedirectView googleLogin() {
        String authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=openid%20email%20profile" +
                "&access_type=offline";
        return new RedirectView(authorizationUrl);
    }

    @GetMapping("/google/callback")
    public RedirectView googleCallback(@RequestParam("code") String code) {
        try {
            // 1. Exchange code for token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("code", code);
            params.add("redirect_uri", redirectUri);
            params.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<GoogleTokenResponse> tokenResponse = restTemplate.postForEntity(
                    "https://oauth2.googleapis.com/token",
                    request,
                    GoogleTokenResponse.class
            );

            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                return new RedirectView(frontendErrorUrl + "&reason=token_exchange_failed");
            }

            String accessToken = tokenResponse.getBody().getAccessToken();

            // 2. Get User Info
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userInfoRequest = new HttpEntity<>(userInfoHeaders);

            ResponseEntity<GoogleUserInfo> userInfoResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    userInfoRequest,
                    GoogleUserInfo.class
            );

            if (!userInfoResponse.getStatusCode().is2xxSuccessful() || userInfoResponse.getBody() == null) {
                return new RedirectView(frontendErrorUrl + "&reason=user_info_failed");
            }

            GoogleUserInfo googleUserInfo = userInfoResponse.getBody();
            String email = googleUserInfo.getEmail();

            // 3. Check if user exists in DB
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                // User not found in DB -> Access Denied
                return new RedirectView(frontendErrorUrl);
            }

            User user = userOptional.get();

            // 4. Update user info if necessary
            user.setProviderId(googleUserInfo.getId());
            user.setLastLogin(LocalDateTime.now());
            
            // Check if it's the first time login
            boolean isFirstTime = (user.getFullName() == null || user.getFullName().trim().isEmpty());
            
            // Only update picture if it's not set, or you can update it every time
            if (user.getPictureUrl() == null) {
                user.setPictureUrl(googleUserInfo.getPicture());
            }

            userRepository.save(user);

            // 5. Generate JWT token
            String jwtToken = jwtTokenProvider.generateToken(user);

            // 6. Redirect to frontend with token and firstTime flag
            String finalRedirectUrl = frontendSuccessUrl + "?token=" + jwtToken + "&isNew=" + isFirstTime;
            return new RedirectView(finalRedirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            return new RedirectView(frontendErrorUrl + "&reason=internal_server_error");
        }
    }
}
