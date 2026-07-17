package com.hospital.controller;

import com.hospital.common.ApiResponse;
import com.hospital.dto.Dtos;
import com.hospital.service.UserService;
import com.hospital.security.AuthCookieService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthCookieService authCookieService;

    @PostMapping("/login")
    public ApiResponse<Dtos.LoginResponse> login(
            @Valid @RequestBody Dtos.LoginRequest req,
            HttpServletResponse response) {
        Dtos.LoginResponse result = userService.login(req);
        authCookieService.write(response, result.getToken());
        return ApiResponse.ok(result);
    }

    @PostMapping("/register")
    public ApiResponse<Dtos.LoginResponse> register(
            @Valid @RequestBody Dtos.RegisterRequest req,
            HttpServletResponse response) {
        Dtos.LoginResponse result = userService.register(req);
        authCookieService.write(response, result.getToken());
        return ApiResponse.ok(result);
    }

    @GetMapping("/me")
    public ApiResponse<Dtos.UserPublic> me() {
        return ApiResponse.ok(userService.me());
    }

    /** Clears the browser session. The endpoint is idempotent by design. */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {
        authCookieService.clear(response);
        return ApiResponse.ok(null);
    }
}
