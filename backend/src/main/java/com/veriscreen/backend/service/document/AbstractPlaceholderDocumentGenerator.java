package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;
import java.time.LocalDate;

/**
 * Base for Sprint 1 placeholder generators; PDF implementations can extend this later.
 */
public abstract class AbstractPlaceholderDocumentGenerator implements DocumentGenerator {

    private final String displayType;

    protected AbstractPlaceholderDocumentGenerator(String displayType) {
        this.displayType = displayType;
    }

    @Override
    public DocumentDto generate(String studentId) {
        return DocumentDto.builder()
                .type(displayType)
                .generatedDate(LocalDate.now().toString())
                .build();
    }
}
