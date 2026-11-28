package com.findstay.media.internal;

import com.findstay.media.api.MediaBucket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;

/**
 * Abstraction over Cloudflare R2 SigV4 pre-signed URLs and public object promotion ({@code S1-09-T2},
 * {@code T4}, {@code T5}). Uses AWS SDK v2 {@link S3Presigner} when R2 credentials are configured,
 * and falls back cleanly to a deterministic local stub in local dev / Testcontainers CI.
 */
interface StorageUrlSigner {

    SignedPut presignPut(
            MediaBucket bucket,
            String storageKey,
            String contentType,
            long contentLength,
            Instant now,
            Duration ttl
    );

    SignedGet presignGet(
            MediaBucket bucket,
            String storageKey,
            Instant now,
            Duration ttl
    );

    void promoteObjectToPublic(String sourceKey, String targetPublicKey, String contentType);

    String resolvePublicUrl(String storageKey);

    boolean verifyUrlNotExpired(Instant expiresAt, Instant now);

    record SignedPut(String url, Map<String, String> requiredHeaders, Instant expiresAt) {
    }

    record SignedGet(String url, Instant expiresAt) {
    }
}

@Configuration
class StorageSignerConfig {

    private static final Logger log = LoggerFactory.getLogger(StorageSignerConfig.class);

    @Bean
    StorageUrlSigner storageUrlSigner(R2Properties properties) {
        if (properties.isR2Configured()) {
            log.info("Initialising Cloudflare R2 S3Presigner against endpoint {}", properties.getEndpoint());
            return new R2S3StorageUrlSigner(properties);
        }
        log.info("R2 credentials not configured — using LocalStubStorageUrlSigner for media presigning");
        return new LocalStubStorageUrlSigner(properties);
    }
}

class R2S3StorageUrlSigner implements StorageUrlSigner, AutoCloseable {

    private static final Logger log = LoggerFactory.getLogger(R2S3StorageUrlSigner.class);

    private final R2Properties properties;
    private final S3Presigner presigner;
    private final S3Client s3Client;

    R2S3StorageUrlSigner(R2Properties properties) {
        this.properties = properties;
        URI endpoint = URI.create(properties.getEndpoint());
        StaticCredentialsProvider credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(properties.getAccessKeyId(), properties.getSecretAccessKey())
        );
        S3Configuration s3Config = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();

        this.presigner = S3Presigner.builder()
                .endpointOverride(endpoint)
                .region(Region.of("auto"))
                .credentialsProvider(credentials)
                .serviceConfiguration(s3Config)
                .build();

        this.s3Client = S3Client.builder()
                .endpointOverride(endpoint)
                .region(Region.of("auto"))
                .credentialsProvider(credentials)
                .serviceConfiguration(s3Config)
                .build();
    }

    @Override
    public SignedPut presignPut(
            MediaBucket bucket,
            String storageKey,
            String contentType,
            long contentLength,
            Instant now,
            Duration ttl
    ) {
        String bucketName = bucketName(bucket);
        PutObjectRequest.Builder putBuilder = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .contentType(contentType)
                .contentLength(contentLength);

        if (bucket == MediaBucket.PUBLIC_IMAGES) {
            putBuilder.cacheControl("public, max-age=31536000, immutable");
        }

        PresignedPutObjectRequest presigned = presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(ttl)
                        .putObjectRequest(putBuilder.build())
                        .build()
        );

        Map<String, String> headers = bucket == MediaBucket.PUBLIC_IMAGES
                ? Map.of(
                        "Content-Type", contentType,
                        "Cache-Control", "public, max-age=31536000, immutable"
                )
                : Map.of("Content-Type", contentType);

        return new SignedPut(presigned.url().toString(), headers, now.plus(ttl));
    }

    @Override
    public SignedGet presignGet(MediaBucket bucket, String storageKey, Instant now, Duration ttl) {
        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(bucketName(bucket))
                .key(storageKey)
                .build();

        PresignedGetObjectRequest presigned = presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(ttl)
                        .getObjectRequest(getRequest)
                        .build()
        );
        return new SignedGet(presigned.url().toString(), now.plus(ttl));
    }

    @Override
    public void promoteObjectToPublic(String sourceKey, String targetPublicKey, String contentType) {
        if (sourceKey.equals(targetPublicKey)) {
            return;
        }
        String publicBucket = properties.getPublicBucket();
        try {
            s3Client.copyObject(CopyObjectRequest.builder()
                    .sourceBucket(publicBucket)
                    .sourceKey(sourceKey)
                    .destinationBucket(publicBucket)
                    .destinationKey(targetPublicKey)
                    .contentType(contentType)
                    .cacheControl("public, max-age=31536000, immutable")
                    .metadataDirective("REPLACE")
                    .build());
        } catch (RuntimeException ex) {
            log.warn("R2 object copy from {} to {} failed (source may not yet exist): {}",
                    sourceKey, targetPublicKey, ex.getMessage());
            throw ex;
        }
    }

    @Override
    public String resolvePublicUrl(String storageKey) {
        String base = properties.getPublicCdnUrl();
        if (base == null || base.isBlank()) {
            base = properties.getEndpoint().replaceAll("/+$", "") + "/" + properties.getPublicBucket();
        }
        return base.replaceAll("/+$", "") + "/" + storageKey;
    }

    @Override
    public boolean verifyUrlNotExpired(Instant expiresAt, Instant now) {
        return expiresAt != null && now.isBefore(expiresAt);
    }

    private String bucketName(MediaBucket bucket) {
        return bucket == MediaBucket.PUBLIC_IMAGES
                ? properties.getPublicBucket()
                : properties.getPrivateBucket();
    }

    @Override
    public void close() {
        presigner.close();
        s3Client.close();
    }
}

class LocalStubStorageUrlSigner implements StorageUrlSigner {

    private final R2Properties properties;

    LocalStubStorageUrlSigner(R2Properties properties) {
        this.properties = properties;
    }

    @Override
    public SignedPut presignPut(
            MediaBucket bucket,
            String storageKey,
            String contentType,
            long contentLength,
            Instant now,
            Duration ttl
    ) {
        Instant expiresAt = now.plus(ttl);
        String bucketName = bucketName(bucket);
        String sig = signature("PUT", bucketName, storageKey, expiresAt.getEpochSecond());
        String url = String.format(
                "https://r2-stub.findstay.local/%s/%s?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=%d&X-Amz-Expires-At=%d&X-Amz-Signature=%s",
                bucketName,
                encodeKey(storageKey),
                ttl.toSeconds(),
                expiresAt.getEpochSecond(),
                sig
        );
        Map<String, String> headers = Map.of("Content-Type", contentType);
        return new SignedPut(url, headers, expiresAt);
    }

    @Override
    public SignedGet presignGet(MediaBucket bucket, String storageKey, Instant now, Duration ttl) {
        Instant expiresAt = now.plus(ttl);
        String bucketName = bucketName(bucket);
        String sig = signature("GET", bucketName, storageKey, expiresAt.getEpochSecond());
        String url = String.format(
                "https://r2-stub.findstay.local/%s/%s?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=%d&X-Amz-Expires-At=%d&X-Amz-Signature=%s",
                bucketName,
                encodeKey(storageKey),
                ttl.toSeconds(),
                expiresAt.getEpochSecond(),
                sig
        );
        return new SignedGet(url, expiresAt);
    }

    @Override
    public void promoteObjectToPublic(String sourceKey, String targetPublicKey, String contentType) {
        // No-op in local stub mode; DB key and CDN URL are promoted cleanly.
    }

    @Override
    public String resolvePublicUrl(String storageKey) {
        String base = properties.getPublicCdnUrl();
        if (base == null || base.isBlank()) {
            base = "https://cdn-stub.findstay.local/" + properties.getPublicBucket();
        }
        return base.replaceAll("/+$", "") + "/" + storageKey;
    }

    @Override
    public boolean verifyUrlNotExpired(Instant expiresAt, Instant now) {
        return expiresAt != null && now.isBefore(expiresAt);
    }

    private String bucketName(MediaBucket bucket) {
        return bucket == MediaBucket.PUBLIC_IMAGES
                ? properties.getPublicBucket()
                : properties.getPrivateBucket();
    }

    private static String encodeKey(String storageKey) {
        String[] segments = storageKey.split("/");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < segments.length; i++) {
            if (i > 0) sb.append('/');
            sb.append(URLEncoder.encode(segments[i], StandardCharsets.UTF_8));
        }
        return sb.toString();
    }

    private static String signature(String method, String bucket, String key, long expEpoch) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((method + ":" + bucket + ":" + key + ":" + expEpoch)
                    .getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 32);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }
}
