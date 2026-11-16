package com.findstay.shared.error;

import com.findstay.shared.json.JacksonConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Runs the handler against a plain MockMvc, with no Spring context, so this test needs
 * no database, no JWT setup and no security filters.
 */
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-11-15T21:17:00Z"), ZoneOffset.UTC);
        Jackson2ObjectMapperBuilder json = Jackson2ObjectMapperBuilder.json();
        new JacksonConfig().findStayJsonConventions().customize(json);

        mockMvc = MockMvcBuilders.standaloneSetup(new ErrorTestController())
                .setControllerAdvice(new GlobalExceptionHandler(clock))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(json.build()))
                .build();
    }

    @Test
    void notFoundHasStandardShape() throws Exception {
        mockMvc.perform(get("/test-errors/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Order 42 was not found"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.timestamp").value("2026-11-15T21:17:00Z"))
                .andExpect(jsonPath("$.path").value("/test-errors/not-found"))
                .andExpect(jsonPath("$.details").doesNotExist());
    }

    @Test
    void businessRuleViolationIs422() throws Exception {
        mockMvc.perform(get("/test-errors/business-rule"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"))
                .andExpect(jsonPath("$.message").value("Wallet balance is too low for this transfer"));
    }

    @Test
    void validationFailureListsEachBadField() throws Exception {
        mockMvc.perform(post("/test-errors/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"amount\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details[*].field", containsInAnyOrder("name", "amount")));
    }

    @Test
    void malformedJsonIs400WithoutLeakingParserInternals() throws Exception {
        mockMvc.perform(post("/test-errors/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Request body is missing or malformed"));
    }

    @Test
    void moneyAsDecimalIsRejectedNotTruncated() throws Exception {
        mockMvc.perform(post("/test-errors/price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"price\":12.5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void moneyAsWholePesewasIsAccepted() throws Exception {
        mockMvc.perform(post("/test-errors/price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"price\":1250}"))
                .andExpect(status().isOk());
    }

    @Test
    void unknownRouteUsesTheSameShape() throws Exception {
        mockMvc.perform(get("/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                .andExpect(jsonPath("$.path").value("/does-not-exist"));
    }

    @Test
    void wrongHttpMethodUsesTheSameShape() throws Exception {
        mockMvc.perform(post("/test-errors/not-found"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().exists("Allow"))
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
    }

    @Test
    void accessDeniedFromAControllerIs403NotA500() throws Exception {
        mockMvc.perform(get("/test-errors/forbidden"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(content().string(not(containsString("internal reason"))));
    }

    @Test
    void authenticationFailureFromAControllerIs401NotA500() throws Exception {
        mockMvc.perform(get("/test-errors/unauthenticated"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"))
                .andExpect(content().string(not(containsString("internal reason"))));
    }

    @Test
    void unexpectedErrorsAre500WithAGenericMessage() throws Exception {
        mockMvc.perform(get("/test-errors/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(content().string(not(containsString("secret internal detail"))));
    }
}
