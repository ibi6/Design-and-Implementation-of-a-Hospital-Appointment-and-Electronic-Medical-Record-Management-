package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("!#includeDisabled or hasRole('ADMIN')")
    public ApiResponse<List<Dtos.DepartmentVO>> list(
            @RequestParam(defaultValue = "false") boolean includeDisabled) {
        return ApiResponse.ok(departmentService.list(includeDisabled));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Dtos.DepartmentVO> save(@Valid @RequestBody Dtos.DepartmentRequest req) {
        return ApiResponse.ok(departmentService.save(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Dtos.DepartmentVO> update(@PathVariable String id, @Valid @RequestBody Dtos.DepartmentRequest req) {
        req.setId(id);
        return ApiResponse.ok(departmentService.save(req));
    }
}
