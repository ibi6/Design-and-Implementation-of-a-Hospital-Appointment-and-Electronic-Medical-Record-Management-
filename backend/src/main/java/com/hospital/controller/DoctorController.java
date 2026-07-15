package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    private final DoctorService doctorService;

    @GetMapping
    public ApiResponse<List<Dtos.DoctorVO>> list(
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "false") boolean includeDisabled) {
        return ApiResponse.ok(doctorService.list(departmentId, keyword, includeDisabled));
    }

    @GetMapping("/{id}")
    public ApiResponse<Dtos.DoctorVO> get(@PathVariable Long id) {
        return ApiResponse.ok(doctorService.get(id));
    }

    @GetMapping("/by-user/{userId}")
    public ApiResponse<Dtos.DoctorVO> byUser(@PathVariable Long userId) {
        return ApiResponse.ok(doctorService.getByUserId(userId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Dtos.DoctorVO> create(@Valid @RequestBody Dtos.DoctorRequest req) {
        return ApiResponse.ok(doctorService.save(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Dtos.DoctorVO> update(@PathVariable String id, @Valid @RequestBody Dtos.DoctorRequest req) {
        req.setId(id);
        return ApiResponse.ok(doctorService.save(req));
    }
}
