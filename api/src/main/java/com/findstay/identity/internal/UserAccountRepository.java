package com.findstay.identity.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    /**
     * Table-driven permission check (S1-06-T2): true when the account's role holds the code in
     * {@code identity.role_permission}. Parameterised, never string-built.
     */
    @Query(value = """
            select exists (
                select 1
                from identity.role_permission rp
                join identity.permission p on p.id = rp.permission_id
                join identity.user_account ua on ua.role_id = rp.role_id
                where ua.id = :userId and p.code = :code)
            """, nativeQuery = true)
    boolean hasPermission(@Param("userId") UUID userId, @Param("code") String code);
}
