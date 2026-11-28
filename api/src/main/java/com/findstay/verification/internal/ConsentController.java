package com.findstay.verification.internal;

import com.findstay.shared.security.OrgScope;
import com.findstay.shared.security.RequiresPermission;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Ghana Act 843 Privacy Notice &amp; Consent endpoints ({@code S1-11-T3}).
 * Supports both OpenAPI paths ({@code /api/v1/consents*}) and {@code /api/v1/me/consents*}.
 */
@RestController
@RequestMapping("/api/v1")
class ConsentController {

    private final ConsentService consentService;

    ConsentController(ConsentService consentService) {
        this.consentService = consentService;
    }

    @GetMapping("/privacy-notice")
    ConsentDtos.PrivacyNoticeMetadata getPrivacyNotice() {
        return consentService.getPrivacyNoticeMetadata();
    }

    @GetMapping({"/consents/latest", "/me/consents/latest", "/me/consents"})
    @RequiresPermission("consent.read")
    ConsentDtos.ConsentStateView getLatestConsent(@AuthenticationPrincipal Jwt jwt) {
        return consentService.getLatestConsentState(OrgScope.requireUserId(jwt));
    }

    @PostMapping({"/consents", "/me/consents"})
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission("consent.write")
    ConsentDtos.ConsentRecordView recordConsent(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ConsentDtos.RecordConsentRequest request,
            HttpServletRequest httpRequest
    ) {
        String forwarded = httpRequest.getHeader("X-Forwarded-For");
        String clientIp = (forwarded != null && !forwarded.isBlank())
                ? forwarded
                : httpRequest.getRemoteAddr();
        return consentService.recordConsent(OrgScope.requireUserId(jwt), request, clientIp);
    }
}
