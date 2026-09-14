package com.veriscreen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentVerificationResponse {
    private boolean valid;
    private String documentId;
    private String documentType;
    private String status;
}
