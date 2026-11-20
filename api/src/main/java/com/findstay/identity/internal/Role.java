package com.findstay.identity.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/** Platform RBAC role from {@code identity.role} (GUEST, OWNER, STAFF, ADMIN). */
@Entity
@Table(name = "role", schema = "identity")
class Role {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    protected Role() {
    }

    UUID getId() {
        return id;
    }

    String getCode() {
        return code;
    }

    String getName() {
        return name;
    }

    String getDescription() {
        return description;
    }
}
