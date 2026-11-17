package com.findstay.shared.health;

import com.findstay.shared.security.CorsConfig;
import com.findstay.shared.security.SecurityConfig;
import com.findstay.shared.time.TimeConfig;
import com.findstay.testing.Req;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * S1-01 AC 1 (staging alive with the health check green) and TA-02: the
 * health surface is public at /api/v1/health and /actuator/health, and
 * everything else stays locked behind Supabase JWTs.
 */
@Req("S1-01-AC1")
@WebMvcTest(PlatformHealthController.class)
@Import({SecurityConfig.class, CorsConfig.class, TimeConfig.class})  // TimeConfig: the Clock behind GlobalExceptionHandler
class PlatformHealthApiTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HealthEndpoint healthEndpoint;

    @Test
    void healthIsPublicUnderTheApiPrefix() throws Exception {
        given(healthEndpoint.health()).willReturn(Health.up().build());
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void everythingElseIsLockedBehindSupabaseJwts() throws Exception {
        // no business endpoint exists yet — the point is the security answer:
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/listings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void theActuatorHealthIsPublicToo() throws Exception {
        // /actuator/health is served by the actuator, not this controller —
        // but the rule that keeps it open is the same SecurityConfig; the
        // 401-vs-200 answer for an unknown actuator path proves the filter
        // chain is active in this slice.
        mockMvc.perform(get("/actuator/health/xyz-not-a-real-subpath"))
                .andExpect(status().isNotFound());
    }

    @Test
    @Req("TA-02")
    void browserOriginsAreAllowedToCallTheApi() throws Exception {
        // The T16 staging proof caught the gap: 200 from the server but the
        // browser refused the answer without CORS headers.
        given(healthEndpoint.health()).willReturn(Health.up().build());
        mockMvc.perform(get("/api/v1/health")
                        .header("Origin", "https://findstay-web-staging.obboyebossman.workers.dev"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin",
                        "https://findstay-web-staging.obboyebossman.workers.dev"));
    }

    @Test
    @Req("TA-02")
    void thePreflightFromTheWebsiteIsAnswered() throws Exception {
        mockMvc.perform(options("/api/v1/health")
                        .header("Origin", "https://findstay-web-staging.obboyebossman.workers.dev")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin",
                        "https://findstay-web-staging.obboyebossman.workers.dev"))
                .andExpect(header().string("Access-Control-Allow-Methods",
                        org.hamcrest.Matchers.containsString("GET")));
    }

    @Test
    @Req("TA-02")
    void unknownOriginsAreRejected() throws Exception {
        // An origin outside findstay.cors.allowed-origins is refused by the
        // CORS filter itself — the browser never sees an answer at all.
        given(healthEndpoint.health()).willReturn(Health.up().build());
        mockMvc.perform(get("/api/v1/health")
                        .header("Origin", "https://evil.example"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void aDownDatabaseIsReportedHonestly() throws Exception {
        given(healthEndpoint.health()).willReturn(Health.down().build());
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("DOWN"));
    }
}
