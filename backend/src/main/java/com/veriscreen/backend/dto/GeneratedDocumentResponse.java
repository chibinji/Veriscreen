package com.veriscreen.backend.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedDocumentResponse {
    private String documentId;
    private String documentType;
    private String status;
    private Instant generatedAt;
}
