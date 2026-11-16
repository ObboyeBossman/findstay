package com.findstay.shared.job;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Turns on Spring's scheduling support, which also provides the {@code TaskScheduler}
 * that {@link BackgroundJobs} uses. Feature teams can also use {@code @Scheduled}.
 */
@Configuration
@EnableScheduling
public class JobConfig {
}
