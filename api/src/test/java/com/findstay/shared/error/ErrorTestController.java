package com.findstay.shared.error;

import com.findstay.shared.money.Money;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Test-only endpoints that raise each kind of error. Lives in test sources, not shipped. */
@RestController
@RequestMapping("/test-errors")
class ErrorTestController {

    record Payload(@NotBlank String name, @Positive long amount) {
    }

    record PricePayload(Money price) {
    }

    @GetMapping("/not-found")
    void notFound() {
        throw AppException.notFound("Order", 42);
    }

    @GetMapping("/business-rule")
    void businessRule() {
        throw AppException.businessRule("Wallet balance is too low for this transfer");
    }

    @GetMapping("/forbidden")
    void forbidden() {
        throw new AccessDeniedException("internal reason");
    }

    @GetMapping("/unauthenticated")
    void unauthenticated() {
        throw new BadCredentialsException("internal reason");
    }

    @GetMapping("/boom")
    void boom() {
        throw new IllegalStateException("secret internal detail");
    }

    @PostMapping("/validate")
    void validate(@Valid @RequestBody Payload payload) {
    }

    @PostMapping("/price")
    void price(@RequestBody PricePayload payload) {
    }
}
