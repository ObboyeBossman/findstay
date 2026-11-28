package com.findstay.media.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "findstay.r2")
class R2Properties {

    private String endpoint = "";
    private String accessKeyId = "";
    private String secretAccessKey = "";
    private String publicBucket = "findstay-property-images";
    private String privateBucket = "findstay-verification-docs";
    private String publicCdnUrl = "";
    private long presignUploadTtlSeconds = 600;
    private long presignDownloadTtlSeconds = 300;

    boolean isR2Configured() {
        return endpoint != null && !endpoint.isBlank()
                && accessKeyId != null && !accessKeyId.isBlank()
                && secretAccessKey != null && !secretAccessKey.isBlank();
    }

    String getEndpoint() {
        return endpoint;
    }

    void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    String getAccessKeyId() {
        return accessKeyId;
    }

    void setAccessKeyId(String accessKeyId) {
        this.accessKeyId = accessKeyId;
    }

    String getSecretAccessKey() {
        return secretAccessKey;
    }

    void setSecretAccessKey(String secretAccessKey) {
        this.secretAccessKey = secretAccessKey;
    }

    String getPublicBucket() {
        return publicBucket;
    }

    void setPublicBucket(String publicBucket) {
        this.publicBucket = publicBucket;
    }

    String getPrivateBucket() {
        return privateBucket;
    }

    void setPrivateBucket(String privateBucket) {
        this.privateBucket = privateBucket;
    }

    String getPublicCdnUrl() {
        return publicCdnUrl;
    }

    void setPublicCdnUrl(String publicCdnUrl) {
        this.publicCdnUrl = publicCdnUrl;
    }

    long getPresignUploadTtlSeconds() {
        return presignUploadTtlSeconds;
    }

    void setPresignUploadTtlSeconds(long presignUploadTtlSeconds) {
        this.presignUploadTtlSeconds = presignUploadTtlSeconds;
    }

    long getPresignDownloadTtlSeconds() {
        return presignDownloadTtlSeconds;
    }

    void setPresignDownloadTtlSeconds(long presignDownloadTtlSeconds) {
        this.presignDownloadTtlSeconds = presignDownloadTtlSeconds;
    }
}
