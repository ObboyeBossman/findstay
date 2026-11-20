package com.findstay.identity.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByCode(String code);
}
