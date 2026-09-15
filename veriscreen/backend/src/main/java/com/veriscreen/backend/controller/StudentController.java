package com.veriscreen.backend.controller;

import com.veriscreen.backend.constants.ApiPaths;
import com.veriscreen.backend.dto.DocumentDto;
<<<<<<< HEAD:veriscreen/backend/src/main/java/com/veriscreen/backend/controller/StudentController.java
import com.veriscreen.backend.dto.GeneratedDocumentResponse;
import com.veriscreen.backend.dto.NotificationDto;
=======
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:backend/src/main/java/com/veriscreen/backend/controller/StudentController.java
import com.veriscreen.backend.dto.StudentProfileDto;
import com.veriscreen.backend.service.document.DocumentService;
import com.veriscreen.backend.service.notify.NotificationService;
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
    private final NotificationService notificationService;

    public StudentController(
            StudentService studentService,
            DocumentService documentService,
            NotificationService notificationService) {
        this.studentService = studentService;
        this.documentService = documentService;
        this.notificationService = notificationService;
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
<<<<<<< HEAD:veriscreen/backend/src/main/java/com/veriscreen/backend/controller/StudentController.java

    @PostMapping("/me/documents/generate/{type}")
    @Operation(summary = "Generate an official PDF for the authenticated student")
    public ResponseEntity<GeneratedDocumentResponse> generateDocument(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String type) {
        return ResponseEntity.ok(
                documentService.generateOfficialDocument(
                        principal.getUsername(), OfficialDocumentType.fromPath(type)));
    }

    @GetMapping("/me/documents/{documentId}/download")
    @Operation(summary = "Download an official PDF issued to the authenticated student")
    public ResponseEntity<byte[]> downloadDocument(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String documentId) {
        byte[] pdf = documentService.downloadOfficialDocument(principal.getUsername(), documentId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename(documentId + ".pdf").build());
        headers.setContentLength(pdf.length);
        headers.add("X-Document-Id", documentId);
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @GetMapping("/me/notifications")
    @Operation(summary = "List in-app, SMS and email notifications for the student")
    public ResponseEntity<List<NotificationDto>> getMyNotifications(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(notificationService.list(principal.getUsername()));
    }

    @PostMapping("/me/notifications/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Void> markNotificationRead(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        notificationService.markRead(principal.getUsername(), id);
        return ResponseEntity.ok().build();
    }
=======
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:backend/src/main/java/com/veriscreen/backend/controller/StudentController.java
}
