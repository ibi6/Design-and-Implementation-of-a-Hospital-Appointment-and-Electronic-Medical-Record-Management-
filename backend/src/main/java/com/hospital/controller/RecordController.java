package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.RecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class RecordController {
    private final RecordService recordService;

    @GetMapping
    public ApiResponse<List<Dtos.RecordVO>> list(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String doctorId) {
        return ApiResponse.ok(recordService.list(patientId, doctorId));
    }

    @GetMapping("/{id}")
    public ApiResponse<Dtos.RecordVO> get(@PathVariable Long id) {
        return ApiResponse.ok(recordService.get(id));
    }

    @GetMapping("/by-appointment/{appointmentId}")
    public ApiResponse<Dtos.RecordVO> byAppointment(@PathVariable Long appointmentId) {
        return ApiResponse.ok(recordService.getByAppointment(appointmentId));
    }

    @PostMapping
    public ApiResponse<Dtos.RecordVO> create(@Valid @RequestBody Dtos.RecordCreateRequest req) {
        return ApiResponse.ok(recordService.create(req));
    }
}
