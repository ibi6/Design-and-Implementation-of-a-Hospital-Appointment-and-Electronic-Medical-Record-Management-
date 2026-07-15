package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @GetMapping
    public ApiResponse<List<Dtos.AppointmentVO>> list(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) String status) {
        return ApiResponse.ok(appointmentService.list(patientId, doctorId, status));
    }

    @GetMapping("/{id}")
    public ApiResponse<Dtos.AppointmentVO> get(@PathVariable Long id) {
        return ApiResponse.ok(appointmentService.get(id));
    }

    @PostMapping
    public ApiResponse<Dtos.AppointmentVO> create(@Valid @RequestBody Dtos.AppointmentCreateRequest req) {
        return ApiResponse.ok(appointmentService.create(req));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<Dtos.AppointmentVO> cancel(@PathVariable Long id) {
        return ApiResponse.ok(appointmentService.cancel(id));
    }
}
