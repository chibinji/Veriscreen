package com.veriscreen.backend.service.security;

/**
 * Abstraction for JWT operations (Dependency Inversion).
 */
public interface JwtService {

    String generateToken(String studentId);

    String extractStudentId(String token);

    boolean validateToken(String token);
}
