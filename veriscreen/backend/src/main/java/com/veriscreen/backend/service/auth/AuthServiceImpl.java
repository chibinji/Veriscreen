package com.veriscreen.backend.service.auth;

import com.veriscreen.backend.dto.JwtResponse;
import com.veriscreen.backend.dto.LoginRequest;
import com.veriscreen.backend.service.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public JwtResponse login(LoginRequest request) {
        log.debug("Login attempt for student id={}", request.getId());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getId(), request.getPassword()));
        String token = jwtService.generateToken(request.getId());
        return new JwtResponse(token);
    }
}
