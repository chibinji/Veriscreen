package com.veriscreen.backend.controller;

import com.veriscreen.backend.constants.ApiPaths;
import com.veriscreen.backend.dto.DocumentDto;
import com.veriscreen.backend.dto.StudentProfileDto;
import com.veriscreen.backend.service.document.DocumentService;
import com.veriscreen.backend.service.student.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sprint 1 URL compatibility: /api/student/profile and /api/student/documents.
 * Prefer /api/v1/students/me/* for new clients.
 */
@RestController
@RequestMapping(ApiPaths.LEGACY_STUDENT)
@Tag(name = "Students (legacy paths)", description = "Sprint 1 compatible student endpoints")
@SecurityRequirement(name = "bearerAuth")
public class LegacyStudentController {

    private final StudentService studentService;
    private final DocumentService documentService;

    public LegacyStudentController(StudentService studentService, DocumentService documentService) {
        this.studentService = studentService;
        this.documentService = documentService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get profile (legacy path /api/student/profile)")
    public ResponseEntity<StudentProfileDto> getProfile(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(studentService.getProfile(principal.getUsername()));
    }

    @GetMapping("/documents")
    @Operation(summary = "List documents (legacy path /api/student/documents)")
    public ResponseEntity<List<DocumentDto>> getDocuments(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(documentService.listDocumentsForCurrentStudent(principal.getUsername()));
    }
}
