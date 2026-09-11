package com.veriscreen.backend.service.document;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.springframework.stereotype.Service;

@Service
public class DocumentHashService {

    public String sha256(byte[] content) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(content);
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    public boolean matches(byte[] content, String expectedHex) {
        if (expectedHex == null || expectedHex.isBlank()) {
            return false;
        }
        return sha256(content).equalsIgnoreCase(expectedHex);
    }
}
