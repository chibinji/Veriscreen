package com.veriscreen.backend.service.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceImplTest {

    private static final String SECRET = "YourSuperSecretKeyAtLeast32CharactersLongChangeMe";
    private static final long EXPIRATION_MS = 86_400_000L;

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtServiceImpl(SECRET, EXPIRATION_MS);
    }

    @Test
    void generateToken_extractStudentId_roundTrip() {
        String token = jwtService.generateToken("2021465934");
        assertEquals("2021465934", jwtService.extractStudentId(token));
    }

    @Test
    void validateToken_validToken_returnsTrue() {
        String token = jwtService.generateToken("2021465934");
        assertTrue(jwtService.validateToken(token));
    }

    @Test
    void validateToken_invalidToken_returnsFalse() {
        assertFalse(jwtService.validateToken("invalid.token.value"));
    }
}
