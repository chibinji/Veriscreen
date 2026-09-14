package com.veriscreen.helsb.controller;

import com.veriscreen.helsb.dto.JwtResponse;
import com.veriscreen.helsb.dto.LoginRequest;
import com.veriscreen.helsb.entity.HelsbOfficer;
import com.veriscreen.helsb.repository.HelsbOfficerRepository;
import com.veriscreen.helsb.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final HelsbOfficerRepository officerRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            HelsbOfficerRepository officerRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.officerRepository = officerRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        String username = request.getId() == null ? "" : request.getId().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.getPassword()));
        HelsbOfficer officer = officerRepository.findByUsernameIgnoreCase(username).orElseThrow();
        return ResponseEntity.ok(new JwtResponse(
                jwtService.generateToken(officer.getUsername()),
                officer.getFullName(),
                officer.getRole(),
                officer.getUsername()));
    }
}
