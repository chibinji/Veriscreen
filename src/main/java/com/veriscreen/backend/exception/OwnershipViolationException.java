package com.veriscreen.backend.exception;

/**
 * Thrown when an authenticated user attempts to access another user's data.
 */
public class OwnershipViolationException extends RuntimeException {

    public OwnershipViolationException(String message) {
        super(message);
    }
}
