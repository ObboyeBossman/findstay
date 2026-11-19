package com.findstay.identity.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
}
