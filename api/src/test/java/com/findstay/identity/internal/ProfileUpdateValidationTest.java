package com.findstay.identity.internal;

import com.findstay.identity.internal.IdentityDtos.ProfileUpdateRequest;
import com.findstay.testing.Req;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/** S1-06-T3: profile payloads reject script markup in the name and unsafe avatar URLs. */
@Req("NFR-23")
class ProfileUpdateValidationTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void javascriptAvatarUrlIsRejectedOnTheAvatarField() {
        var violations = VALIDATOR.validate(new ProfileUpdateRequest(null, null, null, "javascript:alert(1)"));

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getPropertyPath().toString()).isEqualTo("avatarUrl");
    }

    @Test
    void scriptTagInFullNameIsRejected() {
        var violations = VALIDATOR.validate(
                new ProfileUpdateRequest("<script>alert(1)</script>", null, null, null));

        assertThat(violations).isNotEmpty().allSatisfy(v ->
                assertThat(v.getPropertyPath().toString()).isEqualTo("fullName"));
    }

    @Test
    void validProfileUpdatePasses() {
        assertThat(VALIDATOR.validate(new ProfileUpdateRequest(
                "Ama Mensah", "+233241234567", "en", "https://cdn.findstay.example/ama.png"))).isEmpty();
        assertThat(VALIDATOR.validate(new ProfileUpdateRequest(null, null, null, null))).isEmpty();
    }
}
