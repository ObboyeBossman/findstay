package com.findstay.identity.internal;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Registers the access guard on every MVC route (S1-06-T2).
 *
 * <p>The repository is taken through an {@link ObjectProvider} because {@code @WebMvcTest}
 * slices load this configurer without JPA repositories. In the full application the repository
 * always exists, so the guard is always registered there.
 */
@Configuration
class AccessGuardWebConfig implements WebMvcConfigurer {

    private final ObjectProvider<UserAccountRepository> accounts;

    AccessGuardWebConfig(ObjectProvider<UserAccountRepository> accounts) {
        this.accounts = accounts;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        UserAccountRepository repository = accounts.getIfAvailable();
        if (repository != null) {
            registry.addInterceptor(new AccessGuardInterceptor(repository));
        }
    }
}
