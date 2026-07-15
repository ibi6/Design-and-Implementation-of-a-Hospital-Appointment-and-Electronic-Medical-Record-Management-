package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Dtos.UserPublic>> list(@RequestParam(required = false) String role) {
        return ApiResponse.ok(userService.listUsers(role));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Dtos.UserPublic> setStatus(@PathVariable Long id, @Valid @RequestBody Dtos.UserStatusRequest req) {
        return ApiResponse.ok(userService.setStatus(id, req.getStatus()));
    }
}
