package com.findstay.organization.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

interface MembershipPermissionRepository
        extends JpaRepository<MembershipPermission, MembershipPermission.Pk> {

    List<MembershipPermission> findByMembershipId(UUID membershipId);

    List<MembershipPermission> findByMembershipIdIn(Collection<UUID> membershipIds);

    void deleteByMembershipId(UUID membershipId);
}
