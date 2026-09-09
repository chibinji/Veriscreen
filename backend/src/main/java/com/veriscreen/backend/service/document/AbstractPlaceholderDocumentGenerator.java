package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;
import java.time.LocalDate;

/**
 * Shared builder helpers for document generators.
 */
public abstract class AbstractPlaceholderDocumentGenerator implements DocumentGenerator {

    private final String displayType;

    protected AbstractPlaceholderDocumentGenerator(String displayType) {
        this.displayType = displayType;
    }

    protected String displayType() {
        return displayType;
    }

    protected DocumentDto buildDocument(String summary) {
        return DocumentDto.builder()
                .type(displayType)
                .summary(summary)
                .generatedDate(LocalDate.now().toString())
                .build();
    }
}
