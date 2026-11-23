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
@Table(schema = "organization", name = "membership_permission")
@IdClass(MembershipPermission.Pk.class)
class MembershipPermission {

    @Id
    @Column(name = "membership_id", nullable = false, updatable = false)
    private UUID membershipId;

    @Id
    @Column(name = "property_id", nullable = false, updatable = false)
    private UUID propertyId;

    protected MembershipPermission() {
    }

    MembershipPermission(UUID membershipId, UUID propertyId) {
        this.membershipId = membershipId;
        this.propertyId = propertyId;
    }

    UUID getMembershipId() {
        return membershipId;
    }

    UUID getPropertyId() {
        return propertyId;
    }

    public static final class Pk implements Serializable {

        private UUID membershipId;
        private UUID propertyId;

        public Pk() {
        }

        public Pk(UUID membershipId, UUID propertyId) {
            this.membershipId = membershipId;
            this.propertyId = propertyId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Pk pk)) return false;
            return Objects.equals(membershipId, pk.membershipId)
                    && Objects.equals(propertyId, pk.propertyId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(membershipId, propertyId);
        }
    }
}
