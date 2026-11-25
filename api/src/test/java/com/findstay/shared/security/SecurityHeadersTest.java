package com.findstay.shared.security;

import com.findstay.shared.time.TimeConfig;
import com.findstay.shared.validation.SafeHttpUrl;
import com.findstay.shared.validation.SafeText;
import com.findstay.testing.Req;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * S1-06-T3: every API response carries the security headers, and unsafe input returns a
 * structured 400 VALIDATION_FAILED. HTTPS enforcement is covered in {@link RequireHttpsTest}.
 */
@Req("NFR-23")
@WebMvcTest(controllers = SecurityHeadersTest.ProbeController.class)
@Import({SecurityConfig.class, CorsConfig.class, TimeConfig.class, SecurityHeadersTest.ProbeController.class})
@TestPropertySource(properties = {
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://127.0.0.1:9/auth/v1/.well-known/jwks.json"
})
class SecurityHeadersTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void responsesCarryTheApiSecurityHeaders() throws Exception {
        mvc.perform(get("/api/v1/health").secure(true))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("Content-Security-Policy",
                        org.hamcrest.Matchers.containsString("default-src 'none'")))
                .andExpect(header().string("Strict-Transport-Security",
                        org.hamcrest.Matchers.containsString("max-age=31536000")));
    }

    @Test
    void securityHeadersAreSentOnRejectedRequestsToo() throws Exception {
        mvc.perform(get("/api/v1/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"));
    }

    @Test
    void scriptMarkupInTextReturnsValidationFailed() throws Exception {
        mvc.perform(post("/api/v1/probe").with(jwt())
                        .contentType("application/json")
                        .content("{\"name\":\"<script>alert(1)</script>\",\"avatarUrl\":\"https://cdn.example.com/a.png\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void javascriptAvatarUrlReturnsValidationFailed() throws Exception {
        mvc.perform(post("/api/v1/probe").with(jwt())
                        .contentType("application/json")
                        .content("{\"name\":\"Ama Mensah\",\"avatarUrl\":\"javascript:alert(1)\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void safePayloadIsAccepted() throws Exception {
        mvc.perform(post("/api/v1/probe").with(jwt())
                        .contentType("application/json")
                        .content("{\"name\":\"Ama Mensah\",\"avatarUrl\":\"https://cdn.example.com/a.png\"}"))
                .andExpect(status().isOk());
    }

    record ProbeBody(@SafeText String name, @SafeHttpUrl String avatarUrl) {
    }

    @RestController
    static class ProbeController {

        @GetMapping("/api/v1/health")
        String health() {
            return "ok";
        }

        @GetMapping("/api/v1/me")
        String me() {
            return "me";
        }

        @PostMapping("/api/v1/probe")
        String probe(@Valid @RequestBody ProbeBody body) {
            return "ok";
        }
    }
}
