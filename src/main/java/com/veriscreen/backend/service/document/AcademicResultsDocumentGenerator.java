package com.veriscreen.backend.service.document;

import org.springframework.stereotype.Component;

@Component
public class AcademicResultsDocumentGenerator extends AbstractPlaceholderDocumentGenerator {

    public static final String TYPE = "ACADEMIC_RESULTS";

    public AcademicResultsDocumentGenerator() {
        super("Academic Results");
    }

    @Override
    public String getDocumentType() {
        return TYPE;
    }
}
