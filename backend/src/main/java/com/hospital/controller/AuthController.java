package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    public ApiResponse<Dtos.LoginResponse> login(@Valid @RequestBody Dtos.LoginRequest req) {
        return ApiResponse.ok(userService.login(req));
    }

    @PostMapping("/register")
    public ApiResponse<Dtos.LoginResponse> register(@Valid @RequestBody Dtos.RegisterRequest req) {
        return ApiResponse.ok(userService.register(req));
    }

    @GetMapping("/me")
    public ApiResponse<Dtos.UserPublic> me() {
        return ApiResponse.ok(userService.me());
    }
}
