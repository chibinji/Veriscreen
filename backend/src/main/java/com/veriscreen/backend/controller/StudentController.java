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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.STUDENTS)
@Tag(name = "Students", description = "Student profile and documents")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    private final StudentService studentService;
    private final DocumentService documentService;

    public StudentController(StudentService studentService, DocumentService documentService) {
        this.studentService = studentService;
        this.documentService = documentService;
    }

    @GetMapping("/me/profile")
    @Operation(summary = "Get authenticated student's profile")
    public ResponseEntity<StudentProfileDto> getMyProfile(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(studentService.getProfile(principal.getUsername()));
    }

    @GetMapping("/{studentId}/profile")
    @Operation(summary = "Get profile by student ID (own data only)")
    public ResponseEntity<StudentProfileDto> getProfile(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String studentId) {
        return ResponseEntity.ok(
                studentService.getProfileForStudent(principal.getUsername(), studentId));
    }

    @GetMapping("/me/documents")
    @Operation(summary = "List documents for authenticated student")
    public ResponseEntity<List<DocumentDto>> getMyDocuments(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(documentService.listDocumentsForCurrentStudent(principal.getUsername()));
    }

    @GetMapping("/{studentId}/documents")
    @Operation(summary = "List documents by student ID (own data only)")
    public ResponseEntity<List<DocumentDto>> getDocuments(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String studentId) {
        return ResponseEntity.ok(
                documentService.listDocumentsForStudent(principal.getUsername(), studentId));
    }
}
