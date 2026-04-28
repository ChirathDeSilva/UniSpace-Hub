package com.uniSpaceHub.demo.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * Deserializes the user profile returned by Microsoft Graph API.
 * Endpoint: https://graph.microsoft.com/v1.0/me
 *
 * Note: Microsoft Graph uses different field names compared to Google's userinfo endpoint.
 * - "id"          -> unique Microsoft account identifier (equivalent to Google's "sub"/"id")
 * - "mail"        -> primary email (may be null for some MSA accounts, fallback: userPrincipalName)
 * - "displayName" -> full display name
 * - "givenName"   -> first name
 * - "surname"     -> last name
 */
@Data
public class MicrosoftUserInfo {

    /** Unique Microsoft account object ID — used as providerId */
    private String id;

    /**
     * Primary email address.
     * For personal Outlook/Hotmail accounts this is usually populated,
     * but "userPrincipalName" is a reliable fallback.
     */
    private String mail;

    @JsonProperty("displayName")
    private String displayName;

    @JsonProperty("givenName")
    private String givenName;

    @JsonProperty("surname")
    private String surname;

    /**
     * The UPN is always present for MSA accounts and is in email format.
     * Used as a fallback when "mail" is null.
     */
    @JsonProperty("userPrincipalName")
    private String userPrincipalName;

    /**
     * Returns the best available email address.
     * Prefers "mail"; falls back to "userPrincipalName".
     */
    public String getEmail() {
        return (mail != null && !mail.isBlank()) ? mail : userPrincipalName;
    }
}
