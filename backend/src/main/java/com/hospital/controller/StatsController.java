package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {
    private final StatsService statsService;

    @GetMapping("/overview")
    public ApiResponse<Dtos.StatsOverview> overview() {
        return ApiResponse.ok(statsService.overview());
    }
}
