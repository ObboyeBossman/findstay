package com.findstay.shared.health;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.actuate.health.CompositeHealth;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The public health surface under the API's own prefix (TA-02 — the browser
 * talks to the backend through {@code /api/v1/...}): {@code GET /api/v1/health}.
 *
 * <p>The website's SystemStatus (S1-01-T5) and the CI deploy verification
 * (S1-01-T11) call this instead of the actuator path, so "the website can
 * reach the server" (S1-01-T16, TA-02) is proven over the same route family
 * the business API will use. Statuses only — component details stay private.
 */
@RestController
@RequestMapping("/api/v1/health")
public class PlatformHealthController {

    private final HealthEndpoint healthEndpoint;

    public PlatformHealthController(HealthEndpoint healthEndpoint) {
        this.healthEndpoint = healthEndpoint;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = describe(healthEndpoint.health());
        // Actuator semantics: UP (and UNKNOWN) answer 200, anything else 503 —
        // the CI deploy check and the website's SystemStatus rely on it.
        Status status = healthEndpoint.health().getStatus();
        boolean ok = Status.UP.equals(status) || Status.UNKNOWN.equals(status);
        return ResponseEntity.status(ok ? 200 : 503).body(body);
    }

    private static Map<String, Object> describe(HealthComponent component) {
        Map<String, Object> described = new LinkedHashMap<>();
        described.put("status", component.getStatus().getCode());
        if (component instanceof CompositeHealth composite) {
            Map<String, Object> components = new LinkedHashMap<>();
            composite.getComponents().forEach((name, child) -> components.put(name, describe(child)));
            if (!components.isEmpty()) {
                described.put("components", components);
            }
        } else if (component instanceof Health health && !health.getDetails().isEmpty()) {
            described.put("details", health.getDetails());
        }
        return described;
    }
}
