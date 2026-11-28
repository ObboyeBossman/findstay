package com.findstay.admin.internal;

import com.findstay.shared.privacy.PrivacyPolicyVersionLookup;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adapter exposing {@code admin.platform_setting['privacy.policy_version']} through the shared
 * {@link PrivacyPolicyVersionLookup} SPI ({@code S1-11}, {@code NFR-36}).
 */
@Component
class PlatformSettingPolicyVersionAdapter implements PrivacyPolicyVersionLookup {

    private static final String PRIVACY_POLICY_VERSION_KEY = "privacy.policy_version";

    private final PlatformSettingRepository settingRepository;

    PlatformSettingPolicyVersionAdapter(PlatformSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public String currentPolicyVersion() {
        return settingRepository.findById(PRIVACY_POLICY_VERSION_KEY)
                .map(PlatformSetting::getValue)
                .filter(v -> v != null && !v.isBlank())
                .orElse(DEFAULT_VERSION);
    }
}
