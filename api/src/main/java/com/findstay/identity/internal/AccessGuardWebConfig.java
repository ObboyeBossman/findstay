package com.findstay.identity.internal;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Registers the access guard on every MVC route (S1-06-T2). */
@Configuration
class AccessGuardWebConfig implements WebMvcConfigurer {

    private final UserAccountRepository accounts;

    AccessGuardWebConfig(UserAccountRepository accounts) {
        this.accounts = accounts;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AccessGuardInterceptor(accounts));
    }
}
