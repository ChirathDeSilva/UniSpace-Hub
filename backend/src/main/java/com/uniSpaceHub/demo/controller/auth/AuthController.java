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

    // ─── Google OAuth credentials ────────────────────────────────────────────

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Value("${app.oauth2.redirect-uri:http://localhost:8081/api/auth/google/callback}")
    private String googleRedirectUri;

    // ─── Microsoft OAuth credentials ─────────────────────────────────────────

    @Value("${app.oauth2.microsoft.client-id}")
    private String microsoftClientId;

    @Value("${app.oauth2.microsoft.client-secret}")
    private String microsoftClientSecret;

    @Value("${app.oauth2.microsoft.redirect-uri:http://localhost:8081/api/auth/microsoft/callback}")
    private String microsoftRedirectUri;

    // ─── Shared frontend redirect URLs ───────────────────────────────────────

    @Value("${app.frontend.success-url:http://localhost:3000/oauth2/redirect}")
    private String frontendSuccessUrl;

    @Value("${app.frontend.error-url:http://localhost:3000/login?error=access_denied}")
    private String frontendErrorUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final RestTemplate restTemplate = new RestTemplate();

    // =========================================================================
    // GOOGLE OAuth 2.0
    // =========================================================================

    /**
     * Step 1 – Redirect the browser to Google's authorization page.
     * Frontend calls: GET /api/auth/google/login
     */
    @GetMapping("/google/login")
    public RedirectView googleLogin() {
        String authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + googleClientId +
                "&redirect_uri=" + googleRedirectUri +
                "&response_type=code" +
                "&scope=openid%20email%20profile" +
                "&access_type=offline";
        return new RedirectView(authorizationUrl);
    }

    /**
     * Step 2 – Google redirects back here with an authorization code.
     * Exchanges the code for tokens, fetches user info, validates the user
     * exists in the DB, then issues a JWT and redirects to the frontend.
     */
    @GetMapping("/google/callback")
    public RedirectView googleCallback(@RequestParam("code") String code) {
        try {
            // 1. Exchange authorization code for access token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("code", code);
            params.add("redirect_uri", googleRedirectUri);
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

            // 2. Fetch user profile from Google
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

            // 3. Validate user exists in DB
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return new RedirectView(frontendErrorUrl);
            }

            User user = userOptional.get();

            // 4. Update provider info and last-login timestamp
            user.setProviderId(googleUserInfo.getId());
            user.setLastLogin(LocalDateTime.now());

            boolean isFirstTime = (user.getFullName() == null || user.getFullName().trim().isEmpty());

            if (user.getPictureUrl() == null) {
                user.setPictureUrl(googleUserInfo.getPicture());
            }

            userRepository.save(user);

            // 5. Generate JWT and redirect to frontend
            String jwtToken = jwtTokenProvider.generateToken(user);
            String finalRedirectUrl = frontendSuccessUrl + "?token=" + jwtToken + "&isNew=" + isFirstTime;
            return new RedirectView(finalRedirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            return new RedirectView(frontendErrorUrl + "&reason=internal_server_error");
        }
    }

    // =========================================================================
    // MICROSOFT OAuth 2.0  (personal @outlook.com / Hotmail / Live accounts)
    // Uses the "consumers" tenant which restricts login to personal MSA only.
    // =========================================================================

    /**
     * Step 1 – Redirect the browser to Microsoft's authorization page.
     * Frontend calls: GET /api/auth/microsoft/login
     */
    @GetMapping("/microsoft/login")
    public RedirectView microsoftLogin() {
        // "consumers" tenant = personal Microsoft accounts only (@outlook.com, @hotmail.com, @live.com)
        String authorizationUrl = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?" +
                "client_id=" + microsoftClientId +
                "&redirect_uri=" + microsoftRedirectUri +
                "&response_type=code" +
                "&scope=openid%20email%20profile%20User.Read" +
                "&response_mode=query";
        return new RedirectView(authorizationUrl);
    }

    /**
     * Step 2 – Microsoft redirects back here with an authorization code.
     * Exchanges the code for tokens, fetches user info from Microsoft Graph,
     * validates the user exists in the DB, then issues a JWT and redirects
     * to the frontend — identical flow to the Google callback.
     */
    @GetMapping("/microsoft/callback")
    public RedirectView microsoftCallback(@RequestParam("code") String code) {
        try {
            // 1. Exchange authorization code for access token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", microsoftClientId);
            params.add("client_secret", microsoftClientSecret);
            params.add("code", code);
            params.add("redirect_uri", microsoftRedirectUri);
            params.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, headers);

            ResponseEntity<MicrosoftTokenResponse> tokenResponse = restTemplate.postForEntity(
                    "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
                    tokenRequest,
                    MicrosoftTokenResponse.class
            );

            if (!tokenResponse.getStatusCode().is2xxSuccessful() || tokenResponse.getBody() == null) {
                return new RedirectView(frontendErrorUrl + "&reason=token_exchange_failed");
            }

            String accessToken = tokenResponse.getBody().getAccessToken();

            // 2. Fetch user profile from Microsoft Graph API
            HttpHeaders graphHeaders = new HttpHeaders();
            graphHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> graphRequest = new HttpEntity<>(graphHeaders);

            ResponseEntity<MicrosoftUserInfo> userInfoResponse = restTemplate.exchange(
                    "https://graph.microsoft.com/v1.0/me",
                    HttpMethod.GET,
                    graphRequest,
                    MicrosoftUserInfo.class
            );

            if (!userInfoResponse.getStatusCode().is2xxSuccessful() || userInfoResponse.getBody() == null) {
                return new RedirectView(frontendErrorUrl + "&reason=user_info_failed");
            }

            MicrosoftUserInfo msUserInfo = userInfoResponse.getBody();

            // getEmail() returns "mail" field; falls back to "userPrincipalName" if null
            String email = msUserInfo.getEmail();

            if (email == null || email.isBlank()) {
                return new RedirectView(frontendErrorUrl + "&reason=email_not_available");
            }

            // 3. Validate user exists in DB (same rule as Google – pre-registered only)
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return new RedirectView(frontendErrorUrl);
            }

            User user = userOptional.get();

            // 4. Update provider info and last-login timestamp
            user.setProviderId(msUserInfo.getId());
            user.setLastLogin(LocalDateTime.now());

            boolean isFirstTime = (user.getFullName() == null || user.getFullName().trim().isEmpty());

            // Persist display name on first login if not already set
            if (isFirstTime && msUserInfo.getDisplayName() != null) {
                user.setFullName(msUserInfo.getDisplayName());
            }

            userRepository.save(user);

            // 5. Generate JWT and redirect to frontend
            String jwtToken = jwtTokenProvider.generateToken(user);
            String finalRedirectUrl = frontendSuccessUrl + "?token=" + jwtToken + "&isNew=" + isFirstTime;
            return new RedirectView(finalRedirectUrl);

        } catch (Exception e) {
            e.printStackTrace();
            return new RedirectView(frontendErrorUrl + "&reason=internal_server_error");
        }
    }
}

