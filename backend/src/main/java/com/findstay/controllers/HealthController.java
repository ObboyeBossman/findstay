package com.findstay.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "FindStay Backend API");
        response.put("version", "1.0.0");
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("timestamp", ZonedDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/subdomains")
    public ResponseEntity<Map<String, Object>> getPortals() {
        Map<String, Object> portals = new HashMap<>();
        portals.put("guestMarketplace", "https://app.findstay.com");
        portals.put("landlordManager", "https://host.findstay.com");
        portals.put("adminGovernance", "https://admin.findstay.com");
        portals.put("backendApi", "https://api.findstay.com");
        return ResponseEntity.ok(portals);
    }
}
