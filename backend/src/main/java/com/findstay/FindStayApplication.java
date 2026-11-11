package com.findstay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FindStayApplication {

    public static void main(String[] args) {
        SpringApplication.run(FindStayApplication.class, args);
        System.out.println("==================================================");
        System.out.println("  FindStay Java Spring Boot Backend Initialized   ");
        System.out.println("  Portals: app.findstay.com | host.findstay.com   ");
        System.out.println("==================================================");
    }
}
