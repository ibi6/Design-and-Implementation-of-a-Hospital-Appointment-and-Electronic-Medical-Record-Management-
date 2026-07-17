package com.hospital.controller;

import com.hospital.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Exposes a minimal liveness response for local and container orchestration. */
@RestController
@RequestMapping("/api/health")
public class HealthController {
    /** Returns no build, database, host, or secret metadata. */
    @GetMapping
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of("status", "UP"));
    }
}
