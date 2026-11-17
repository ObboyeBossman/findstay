package com.findstay.shared.json;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.TimeZone;

/**
 * JSON conventions for the whole API:
 * <ul>
 *   <li>Times are UTC ISO-8601 strings, e.g. {@code 2026-11-15T21:17:00Z}, never numeric timestamps.</li>
 *   <li>Money is a whole number of pesewas. A decimal such as {@code 12.5} is rejected
 *       instead of being silently truncated.</li>
 * </ul>
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer findStayJsonConventions() {
        return builder -> builder
                .timeZone(TimeZone.getTimeZone("UTC"))
                .featuresToDisable(
                        SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
                        DeserializationFeature.ACCEPT_FLOAT_AS_INT);
    }
}
