package com.uniSpaceHub.demo.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Deserializes the token response from Microsoft's OAuth 2.0 token endpoint.
 * Endpoint: https://login.microsoftonline.com/consumers/oauth2/v2.0/token
 */
@Data
public class MicrosoftTokenResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("expires_in")
    private Integer expiresIn;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("scope")
    private String scope;

    @JsonProperty("token_type")
    private String tokenType;

    @JsonProperty("id_token")
    private String idToken;
}
