package com.findstay.shared.privacy;

/**
 * Shared read-only SPI exposing the active Ghana Act 843 privacy policy version (backed by
 * {@code admin.platform_setting['privacy.policy_version']}) so {@code verification} and
 * {@code identity} can check re-consent without creating a circular dependency on {@code admin}.
 */
public interface PrivacyPolicyVersionLookup {

    String DEFAULT_VERSION = "1";

    String currentPolicyVersion();
}
