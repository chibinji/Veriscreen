package com.veriscreen.backend.controller;

import com.veriscreen.backend.dto.DocumentDto;
import com.veriscreen.backend.dto.StudentProfileDto;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.repository.StudentRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Student student = studentRepository.findById(userDetails.getUsername()).orElse(null);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }
        StudentProfileDto dto = StudentProfileDto.builder()
                .id(student.getId())
                .name(student.getName())
                .program(student.getProgram())
                .enrollmentYear(student.getEnrollmentYear())
                .build();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/documents")
    public ResponseEntity<?> getDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        List<DocumentDto> docs = List.of(
                DocumentDto.builder()
                        .type("Confirmation Slip")
                        .generatedDate(LocalDate.now().toString())
                        .build(),
                DocumentDto.builder()
                        .type("Academic Results")
                        .generatedDate(LocalDate.now().toString())
                        .build()
        );
        return ResponseEntity.ok(docs);
    }
}
