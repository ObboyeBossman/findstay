package com.findstay.shared.json;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.shared.money.Money;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Proves the JSON conventions in {@link JacksonConfig}: money as integers, UTC timestamps. */
class JsonConventionsTest {

    public record Invoice(Money total, Instant issuedAt) {
    }

    private ObjectMapper mapper;

    @BeforeEach
    void setUp() {
        Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.json();
        new JacksonConfig().findStayJsonConventions().customize(builder);
        mapper = builder.build();
    }

    @Test
    void moneyAndTimeSerializeAsPesewaIntegerAndUtcIsoString() throws Exception {
        Invoice invoice = new Invoice(Money.ofPesewas(1250), Instant.parse("2026-11-15T21:17:00Z"));
        assertThat(mapper.writeValueAsString(invoice))
                .isEqualTo("{\"total\":1250,\"issuedAt\":\"2026-11-15T21:17:00Z\"}");
    }

    @Test
    void readsThemBack() throws Exception {
        Invoice invoice = mapper.readValue(
                "{\"total\":1250,\"issuedAt\":\"2026-11-15T21:17:00Z\"}", Invoice.class);
        assertThat(invoice.total()).isEqualTo(Money.ofPesewas(1250));
        assertThat(invoice.issuedAt()).isEqualTo(Instant.parse("2026-11-15T21:17:00Z"));
    }

    @Test
    void decimalMoneyIsRejected() {
        assertThatThrownBy(() -> mapper.readValue(
                "{\"total\":12.5,\"issuedAt\":\"2026-11-15T21:17:00Z\"}", Invoice.class))
                .isInstanceOf(JsonProcessingException.class);
    }
}
