package com.veriscreen.backend.service.auth;

import com.veriscreen.backend.dto.JwtResponse;
import com.veriscreen.backend.dto.LoginRequest;

public interface AuthService {

    JwtResponse login(LoginRequest request);
}
