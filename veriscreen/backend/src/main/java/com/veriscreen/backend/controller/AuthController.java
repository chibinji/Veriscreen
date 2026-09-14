package com.veriscreen.backend.controller;

import com.veriscreen.backend.constants.ApiPaths;
import com.veriscreen.backend.dto.JwtResponse;
import com.veriscreen.backend.dto.LoginRequest;
import com.veriscreen.backend.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({ApiPaths.AUTH, ApiPaths.LEGACY_AUTH})
@Tag(name = "Authentication", description = "Student login and JWT issuance")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login with student ID and password")
    public ResponseEntity<JwtResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
