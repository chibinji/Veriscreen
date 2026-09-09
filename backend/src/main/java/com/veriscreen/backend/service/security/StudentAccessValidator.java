package com.veriscreen.backend.service.security;

import com.veriscreen.backend.exception.OwnershipViolationException;
import org.springframework.stereotype.Component;

/**
 * Principle of least privilege: ensures users access only their own resources.
 */
@Component
public class StudentAccessValidator {

    public void ensureSelfAccess(String authenticatedStudentId, String requestedStudentId) {
        if (authenticatedStudentId == null || requestedStudentId == null) {
            throw new OwnershipViolationException("Student identity could not be verified");
        }
        if (!authenticatedStudentId.equals(requestedStudentId)) {
            throw new OwnershipViolationException("Access denied to another student's data");
        }
    }
}
