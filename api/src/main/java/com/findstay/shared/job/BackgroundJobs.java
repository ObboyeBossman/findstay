package com.findstay.shared.job;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Component;

/**
 * Standard background jobs orchestrator for scheduled maintenance and retry sweeps.
 */
@Component
@EnableScheduling
public class BackgroundJobs {

    private static final Logger log = LoggerFactory.getLogger(BackgroundJobs.class);

    public void run(String jobName, Runnable task) {
        log.debug("Executing scheduled background job: {}", jobName);
        try {
            task.run();
        } catch (Exception e) {
            log.error("Scheduled background job failed: {}", jobName, e);
        }
    }
}
