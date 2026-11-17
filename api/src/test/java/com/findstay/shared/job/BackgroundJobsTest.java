package com.findstay.shared.job;

import com.findstay.testing.Req;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

@Req("S1-01-T7")
class BackgroundJobsTest {

    private ThreadPoolTaskScheduler scheduler;
    private BackgroundJobs jobs;

    @BeforeEach
    void setUp() {
        scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.initialize();
        jobs = new BackgroundJobs(scheduler, Clock.systemUTC());
    }

    @AfterEach
    void tearDown() {
        scheduler.shutdown();
    }

    @Test
    void runOnceExecutesTheJobAndTagsItWithItsName() throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> jobNameInLogs = new AtomicReference<>();

        jobs.runOnce("send-receipts", () -> {
            jobNameInLogs.set(MDC.get("job"));
            done.countDown();
        });

        assertThat(done.await(5, TimeUnit.SECONDS)).isTrue();
        assertThat(jobNameInLogs.get()).isEqualTo("send-receipts");
    }

    @Test
    void runAfterWaitsForTheDelay() throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        long start = System.nanoTime();

        jobs.runAfter("delayed", Duration.ofMillis(200), done::countDown);

        assertThat(done.await(5, TimeUnit.SECONDS)).isTrue();
        assertThat(Duration.ofNanos(System.nanoTime() - start)).isGreaterThanOrEqualTo(Duration.ofMillis(150));
    }

    @Test
    void aFailingJobDoesNotStopLaterRunsOrTheScheduler() throws Exception {
        AtomicInteger runs = new AtomicInteger();
        CountDownLatch threeRuns = new CountDownLatch(3);

        jobs.runEvery("flaky", Duration.ofMillis(20), () -> {
            int run = runs.incrementAndGet();
            threeRuns.countDown();
            if (run == 1) {
                throw new IllegalStateException("first run fails");
            }
        });

        assertThat(threeRuns.await(5, TimeUnit.SECONDS)).isTrue();
        assertThat(runs.get()).isGreaterThanOrEqualTo(3);
    }

    @Test
    void aFailingOneOffJobDoesNotPoisonTheSchedulerEither() throws Exception {
        CountDownLatch next = new CountDownLatch(1);

        jobs.runOnce("fails", () -> {
            throw new IllegalStateException("boom");
        });
        jobs.runOnce("works", next::countDown);

        assertThat(next.await(5, TimeUnit.SECONDS)).isTrue();
    }
}
