package com.findstay.shared.security;

import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.testing.Req;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Req("S1-07-AC3")
class OrgScopeTest {

    @Test
    void rejectsUsersWithNoMembershipAndCrossOrgAccessAndStaffPropertyScope() {
        UUID userNoOrg = UUID.randomUUID();
        UUID ownerA = UUID.randomUUID();
        UUID staffA = UUID.randomUUID();
        UUID orgA = UUID.randomUUID();
        UUID orgB = UUID.randomUUID();
        UUID propAllowed = UUID.randomUUID();
        UUID propDenied = UUID.randomUUID();

        OrgScope orgScope = new OrgScope(userId -> {
            if (ownerA.equals(userId)) {
                return List.of(new OrgMembership(orgA, "Org A", OrgRole.OWNER, true, Set.of()));
            }
            if (staffA.equals(userId)) {
                return List.of(new OrgMembership(orgA, "Org A", OrgRole.STAFF, false, Set.of(propAllowed)));
            }
            return List.of();
        });

        // No membership -> 403 FORBIDDEN
        assertThatThrownBy(() -> orgScope.requireActive(userNoOrg))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).code())
                .isEqualTo(ErrorCode.FORBIDDEN);

        // Cross-org access -> 404 NOT_FOUND
        assertThatThrownBy(() -> orgScope.requireOrganization(ownerA, orgB))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).code())
                .isEqualTo(ErrorCode.NOT_FOUND);

        // Owner can access any property in their own org
        assertThat(orgScope.requirePropertyAccess(ownerA, orgA, propDenied, "Property").organizationId())
                .isEqualTo(orgA);

        // Staff can access granted property, gets 403 on ungranted property, and 403 on requireOwner
        assertThat(orgScope.requirePropertyAccess(staffA, orgA, propAllowed, "Property").organizationId())
                .isEqualTo(orgA);

        assertThatThrownBy(() -> orgScope.requirePropertyAccess(staffA, orgA, propDenied, "Property"))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).code())
                .isEqualTo(ErrorCode.FORBIDDEN);

        assertThatThrownBy(() -> orgScope.requireOwner(staffA))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).code())
                .isEqualTo(ErrorCode.FORBIDDEN);
    }
}
