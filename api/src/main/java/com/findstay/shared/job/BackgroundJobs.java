package com.findstay.shared.job;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.ScheduledFuture;

/**
 * Runs work outside the request thread. Every job gets a name (shown in logs as {@code job=...}),
 * and a failing job is logged without ever killing the scheduler or later runs of the same job.
 *
 * <p>Jobs may run more than once or overlap after a restart, so write them to be idempotent.
 * Executions run on virtual threads when {@code spring.threads.virtual.enabled=true}.
 */
@Component
public class BackgroundJobs {

    private static final Logger log = LoggerFactory.getLogger(BackgroundJobs.class);

    private final TaskScheduler scheduler;
    private final Clock clock;

    public BackgroundJobs(TaskScheduler scheduler, Clock clock) {
        this.scheduler = scheduler;
        this.clock = clock;
    }

    /** Runs the job once, as soon as possible. */
    public ScheduledFuture<?> runOnce(String name, Runnable job) {
        return scheduler.schedule(wrap(name, job), clock.instant());
    }

    /** Runs the job once after {@code delay}. */
    public ScheduledFuture<?> runAfter(String name, Duration delay, Runnable job) {
        return scheduler.schedule(wrap(name, job), clock.instant().plus(delay));
    }

    /** Runs the job repeatedly, waiting {@code delay} after each run finishes. */
    public ScheduledFuture<?> runEvery(String name, Duration delay, Runnable job) {
        return scheduler.scheduleWithFixedDelay(wrap(name, job), delay);
    }

    private Runnable wrap(String name, Runnable job) {
        return () -> {
            MDC.put("job", name);
            try {
                log.debug("Job started");
                job.run();
                log.debug("Job finished");
            } catch (Exception ex) {
                log.error("Job failed", ex);
            } finally {
                MDC.remove("job");
            }
        };
    }
}
