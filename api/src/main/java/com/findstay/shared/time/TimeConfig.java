package com.findstay.shared.time;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class TimeConfig {

    /** The application clock, always UTC. Inject it; in tests replace it with a fixed clock. */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
