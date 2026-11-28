package com.findstay.organization.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(schema = "organization", name = "invitation_property")
@IdClass(InvitationProperty.Pk.class)
class InvitationProperty {

    @Id
    @Column(name = "invitation_id", nullable = false, updatable = false)
    private UUID invitationId;

    @Id
    @Column(name = "property_id", nullable = false, updatable = false)
    private UUID propertyId;

    protected InvitationProperty() {
    }

    InvitationProperty(UUID invitationId, UUID propertyId) {
        this.invitationId = invitationId;
        this.propertyId = propertyId;
    }

    UUID getInvitationId() {
        return invitationId;
    }

    UUID getPropertyId() {
        return propertyId;
    }

    public static final class Pk implements Serializable {

        private UUID invitationId;
        private UUID propertyId;

        public Pk() {
        }

        public Pk(UUID invitationId, UUID propertyId) {
            this.invitationId = invitationId;
            this.propertyId = propertyId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Pk pk)) return false;
            return Objects.equals(invitationId, pk.invitationId)
                    && Objects.equals(propertyId, pk.propertyId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(invitationId, propertyId);
        }
    }
}
