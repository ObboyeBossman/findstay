package com.findstay.organization.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

interface InvitationPropertyRepository
        extends JpaRepository<InvitationProperty, InvitationProperty.Pk> {

    List<InvitationProperty> findByInvitationId(UUID invitationId);

    List<InvitationProperty> findByInvitationIdIn(Collection<UUID> invitationIds);
}
