package com.findstay.shared.security;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Registers the access guard on every MVC route (S1-06-T2).
 *
 * <p>The {@link PermissionLookup} comes through an {@link ObjectProvider} because {@code @WebMvcTest}
 * slices load this configurer without the identity module's database beans. In the full
 * application the lookup always exists, so the guard is always registered there.
 */
@Configuration
class SecurityWebConfig implements WebMvcConfigurer {

    private final ObjectProvider<PermissionLookup> lookup;

    SecurityWebConfig(ObjectProvider<PermissionLookup> lookup) {
        this.lookup = lookup;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        PermissionLookup resolved = lookup.getIfAvailable();
        if (resolved != null) {
            registry.addInterceptor(new AccessGuardInterceptor(resolved));
        }
    }
}
