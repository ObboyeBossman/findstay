package com.findstay.shared.security;

import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** S1-06-T2: object-level ownership checks refuse anyone who is not the owner. */
class ObjectAccessTest {

    private static final UUID OWNER = UUID.fromString("01a16000-0000-7000-8000-000000000001");
    private static final UUID OTHER = UUID.fromString("01a16000-0000-7000-8000-000000000002");

    @Test
    void ownerIsAllowed() {
        assertThatCode(() -> ObjectAccess.requireOwner(OWNER, OWNER)).doesNotThrowAnyException();
    }

    @Test
    void anotherUserIsForbidden() {
        assertThatThrownBy(() -> ObjectAccess.requireOwner(OTHER, OWNER))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.FORBIDDEN));
    }

    @Test
    void missingCallerOrOwnerIsForbidden() {
        assertThatThrownBy(() -> ObjectAccess.requireOwner(null, OWNER)).isInstanceOf(AppException.class);
        assertThatThrownBy(() -> ObjectAccess.requireOwner(OWNER, null)).isInstanceOf(AppException.class);
    }
}
