package com.findstay.identity.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    /**
     * The permission codes granted to the account's role (S1-06-T2). Parameterised, never
     * string-built. Revoking a row in {@code identity.role_permission} changes this result at once.
     */
    @Query(value = """
            select p.code
            from identity.role_permission rp
            join identity.permission p on p.id = rp.permission_id
            join identity.user_account ua on ua.role_id = rp.role_id
            where ua.id = :userId
            """, nativeQuery = true)
    List<String> findPermissionCodes(@Param("userId") UUID userId);
}
