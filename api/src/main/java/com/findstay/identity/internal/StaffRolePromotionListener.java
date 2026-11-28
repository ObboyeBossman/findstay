package com.findstay.identity.internal;

import com.findstay.organization.api.StaffInviteAcceptedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;

/**
 * Upgrades a {@code GUEST} platform account to {@code STAFF} when they accept a staff
 * invitation ({@code S1-07-T4}). Existing {@code OWNER} or {@code ADMIN} accounts retain
 * their higher platform role.
 */
@Component
class StaffRolePromotionListener {

    private final UserAccountRepository accounts;
    private final RoleRepository roles;
    private final Clock clock;

    StaffRolePromotionListener(
            UserAccountRepository accounts,
            RoleRepository roles,
            Clock clock) {
        this.accounts = accounts;
        this.roles = roles;
        this.clock = clock;
    }

    @EventListener
    @Transactional
    public void onStaffInviteAccepted(StaffInviteAcceptedEvent event) {
        accounts.findById(event.userId()).ifPresent(account -> {
            if ("GUEST".equals(account.getRole().getCode())) {
                roles.findByCode("STAFF").ifPresent(staffRole -> {
                    account.promoteRole(staffRole, clock.instant());
                    accounts.saveAndFlush(account);
                });
            }
        });
    }
}
