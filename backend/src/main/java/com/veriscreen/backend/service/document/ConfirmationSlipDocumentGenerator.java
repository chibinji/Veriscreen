package com.veriscreen.backend.service.document;

import org.springframework.stereotype.Component;

@Component
public class ConfirmationSlipDocumentGenerator extends AbstractPlaceholderDocumentGenerator {

    public static final String TYPE = "CONFIRMATION_SLIP";

    public ConfirmationSlipDocumentGenerator() {
        super("Confirmation Slip");
    }

    @Override
    public String getDocumentType() {
        return TYPE;
    }
}
