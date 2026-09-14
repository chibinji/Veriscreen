package com.veriscreen.backend.entity;

import com.veriscreen.backend.exception.InvalidRequestException;

/**
 * Official student document types that can be generated as PDFs.
 */
public enum OfficialDocumentType {
    CONFIRMATION_SLIP("CS", "CONFIRMATION SLIP", "confirmation"),
    RESULTS("RES", "ACADEMIC RESULTS", "results"),
    EXAMINATION_SLIP("EXM", "EXAMINATION SLIP", "examination"),
    PAYMENT_HISTORY("PAY", "PAYMENT HISTORY", "payment");

    private final String code;
    private final String title;
    private final String storageFolder;

    OfficialDocumentType(String code, String title, String storageFolder) {
        this.code = code;
        this.title = title;
        this.storageFolder = storageFolder;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getStorageFolder() {
        return storageFolder;
    }

    public static OfficialDocumentType fromPath(String path) {
        if (path == null || path.isBlank()) {
            throw new InvalidRequestException("Document type is required");
        }
        String normalized = path.trim().toLowerCase().replace('_', '-');
        return switch (normalized) {
            case "confirmation", "confirmation-slip" -> CONFIRMATION_SLIP;
            case "results", "academic-results" -> RESULTS;
            case "examination", "examination-slip", "exam-slip" -> EXAMINATION_SLIP;
            case "payment-history", "payment", "fee-statement" -> PAYMENT_HISTORY;
            default -> throw new InvalidRequestException("Unknown document type: " + path);
        };
    }
}
