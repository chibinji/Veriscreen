package com.veriscreen.backend.controller;

import com.veriscreen.backend.constants.ApiPaths;
import com.veriscreen.backend.dto.DocumentVerificationResponse;
import com.veriscreen.backend.service.document.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.VERIFY)
@Tag(name = "Document verification", description = "Public authenticity check for issued documents")
public class DocumentVerificationController {

    private final DocumentService documentService;

    public DocumentVerificationController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/{documentId}")
    @Operation(summary = "Verify an official document without exposing private student data")
    public ResponseEntity<?> verify(
            @PathVariable String documentId,
            @RequestHeader(value = "Accept", defaultValue = MediaType.APPLICATION_JSON_VALUE) String accept) {
        DocumentVerificationResponse result = documentService.verify(documentId);
        if (accept != null && accept.contains(MediaType.TEXT_HTML_VALUE)) {
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(toHtml(result));
        }
        return ResponseEntity.ok(result);
    }

    private String toHtml(DocumentVerificationResponse result) {
        String tone = result.isValid() ? "#0f7b3a" : "#b42318";
        String title = result.isValid() ? "Document verified" : "Document could not be verified";
        String type = result.getDocumentType() == null ? "—" : escape(result.getDocumentType());
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1"/>
                  <title>VeriScreen verification</title>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f5f7fb; color: #1a1a1a; margin: 0; padding: 32px; }
                    .card { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; padding: 28px; box-shadow: 0 8px 24px rgba(10,37,84,0.08); }
                    h1 { color: %s; font-size: 22px; margin: 0 0 16px; }
                    p { margin: 8px 0; }
                    .muted { color: #5b6472; font-size: 13px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <h1>%s</h1>
                    <p><strong>Document ID:</strong> %s</p>
                    <p><strong>Document type:</strong> %s</p>
                    <p><strong>Status:</strong> %s</p>
                    <p class="muted">Verified by VeriScreen. This page does not display private student information.</p>
                  </div>
                </body>
                </html>
                """.formatted(
                tone,
                escape(title),
                escape(result.getDocumentId()),
                type,
                escape(result.getStatus()));
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
