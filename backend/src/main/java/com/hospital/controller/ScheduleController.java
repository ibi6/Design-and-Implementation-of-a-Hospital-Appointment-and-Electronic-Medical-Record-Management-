package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;

    @GetMapping
    public ApiResponse<List<Dtos.ScheduleVO>> list(
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate) {
        return ApiResponse.ok(scheduleService.list(doctorId, fromDate));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Dtos.ScheduleVO> create(@Valid @RequestBody Dtos.ScheduleRequest req) {
        return ApiResponse.ok(scheduleService.save(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Dtos.ScheduleVO> update(@PathVariable String id, @Valid @RequestBody Dtos.ScheduleRequest req) {
        req.setId(id);
        return ApiResponse.ok(scheduleService.save(req));
    }
}
