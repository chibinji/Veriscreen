package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;

/**
 * Strategy interface: add new document types by implementing this interface (Open/Closed).
 * Liskov: any implementation (e.g. mock vs PDF) can replace another without breaking callers.
 */
public interface DocumentGenerator {

    /** Unique document type key, e.g. CONFIRMATION_SLIP */
    String getDocumentType();

    DocumentDto generate(String studentId);
}
