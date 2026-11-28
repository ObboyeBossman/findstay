package com.findstay.shared.security;

import com.findstay.shared.time.TimeConfig;
import com.findstay.testing.Req;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * S1-06-T3: with the {@code prod} rule on ({@code findstay.security.require-https=true}), plain HTTP
 * is redirected to HTTPS, and a request the proxy marks {@code X-Forwarded-Proto: https} is served.
 * The local and test profiles keep the rule off, so the headers-only tests run over plain HTTP.
 */
@Req("NFR-21")
@WebMvcTest(controllers = RequireHttpsTest.ProbeController.class)
@Import({SecurityConfig.class, CorsConfig.class, TimeConfig.class, RequireHttpsTest.ProbeController.class})
@TestPropertySource(properties = {
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://127.0.0.1:9/auth/v1/.well-known/jwks.json",
        "findstay.security.require-https=true"
})
class RequireHttpsTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void plainHttpRequestIsRedirectedToHttps() throws Exception {
        mvc.perform(get("/api/v1/health"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", org.hamcrest.Matchers.startsWith("https://")));
    }

    @Test
    void proxiedHttpsRequestIsServed() throws Exception {
        // The proxy-to-app mapping of X-Forwarded-Proto is Spring's job (forward-headers-strategy=framework,
        // set in application-prod.yml) and is not re-tested here; this proves a secure request is served.
        mvc.perform(get("/api/v1/health").secure(true).header("X-Forwarded-Proto", "https"))
                .andExpect(status().isOk());
    }

    @RestController
    static class ProbeController {

        @GetMapping("/api/v1/health")
        String health() {
            return "ok";
        }
    }
}
