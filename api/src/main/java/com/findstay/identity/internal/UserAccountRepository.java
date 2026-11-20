package com.findstay.identity.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);
}
