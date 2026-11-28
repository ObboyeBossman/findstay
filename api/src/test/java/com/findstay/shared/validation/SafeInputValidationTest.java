package com.findstay.shared.validation;

import com.findstay.testing.Req;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/** S1-06-T3: unsafe URLs and markup in text are rejected; ordinary values pass. */
@Req("NFR-23")
class SafeInputValidationTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    record UrlHolder(@SafeHttpUrl String url) {
    }

    record TextHolder(@SafeText String text) {
    }

    @Test
    void javascriptAndDataUrlsAreRejected() {
        assertThat(urlViolations("javascript:alert(1)")).hasSize(1);
        assertThat(urlViolations("JaVaScRiPt:alert(1)")).hasSize(1);
        assertThat(urlViolations("data:text/html;base64,PHNjcmlwdD4=")).hasSize(1);
        assertThat(urlViolations("ftp://files.example.com/a.png")).hasSize(1);
    }

    @Test
    void urlsWithWhitespaceControlCharactersOrNoHostAreRejected() {
        assertThat(urlViolations("https://example.com/a b.png")).hasSize(1);
        assertThat(urlViolations("https://example.com/a\u0007.png")).hasSize(1);
        assertThat(urlViolations("https://")).hasSize(1);
        assertThat(urlViolations("not a url")).hasSize(1);
    }

    @Test
    void httpAndHttpsUrlsAndBlankValuesPass() {
        assertThat(urlViolations("https://cdn.findstay.example/avatars/ama.png")).isEmpty();
        assertThat(urlViolations("http://localhost:8080/avatar.png")).isEmpty();
        assertThat(urlViolations(null)).isEmpty();
        assertThat(urlViolations("")).isEmpty();
    }

    @Test
    void markupAndControlCharactersInTextAreRejected() {
        assertThat(textViolations("<script>alert(1)</script>")).hasSize(1);
        assertThat(textViolations("Ama <b>Mensah</b>")).hasSize(1);
        assertThat(textViolations("Ama\u0000Mensah")).hasSize(1);
        assertThat(textViolations("Ama\nMensah")).hasSize(1);
    }

    @Test
    void ordinaryTextPassesIncludingApostrophesAndAccents() {
        assertThat(textViolations("Ama Mensah")).isEmpty();
        assertThat(textViolations("Kofi O'Brien-Adjei")).isEmpty();
        assertThat(textViolations("Akosua Ntim, Esq.")).isEmpty();
        assertThat(textViolations(null)).isEmpty();
    }

    private static Set<ConstraintViolation<UrlHolder>> urlViolations(String url) {
        return VALIDATOR.validate(new UrlHolder(url));
    }

    private static Set<ConstraintViolation<TextHolder>> textViolations(String text) {
        return VALIDATOR.validate(new TextHolder(text));
    }
}
