package com.veriscreen.backend.controller;

import com.veriscreen.backend.constants.ApiPaths;
import com.veriscreen.backend.dto.AcademicResultDto;
import com.veriscreen.backend.dto.ExaminationDto;
import com.veriscreen.backend.dto.FeeDto;
import com.veriscreen.backend.dto.HelsbApplicationDto;
import com.veriscreen.backend.dto.RegistrationDto;
import com.veriscreen.backend.service.screening.StudentScreeningService;
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
@Tag(name = "Student screening", description = "Registrations, fees, exams, results, and HELSB data")
@SecurityRequirement(name = "bearerAuth")
public class StudentScreeningController {

    private final StudentScreeningService screeningService;

    public StudentScreeningController(StudentScreeningService screeningService) {
        this.screeningService = screeningService;
    }

    @GetMapping("/me/registrations")
    @Operation(summary = "List registrations for authenticated student")
    public ResponseEntity<List<RegistrationDto>> getMyRegistrations(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(screeningService.listRegistrations(principal.getUsername()));
    }

    @GetMapping("/{studentId}/registrations")
    @Operation(summary = "List registrations by student ID (own data only)")
    public ResponseEntity<List<RegistrationDto>> getRegistrations(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String studentId) {
        return ResponseEntity.ok(
                screeningService.listRegistrationsForStudent(principal.getUsername(), studentId));
    }

    @GetMapping("/me/fees")
    @Operation(summary = "List fee records for authenticated student")
    public ResponseEntity<List<FeeDto>> getMyFees(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(screeningService.listFees(principal.getUsername()));
    }

    @GetMapping("/{studentId}/fees")
    @Operation(summary = "List fee records by student ID (own data only)")
    public ResponseEntity<List<FeeDto>> getFees(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String studentId) {
        return ResponseEntity.ok(screeningService.listFeesForStudent(principal.getUsername(), studentId));
    }

    @GetMapping("/me/examinations")
    @Operation(summary = "List examination records for authenticated student")
    public ResponseEntity<List<ExaminationDto>> getMyExaminations(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(screeningService.listExaminations(principal.getUsername()));
    }

    @GetMapping("/{studentId}/examinations")
    @Operation(summary = "List examination records by student ID (own data only)")
    public ResponseEntity<List<ExaminationDto>> getExaminations(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String studentId) {
        return ResponseEntity.ok(
                screeningService.listExaminationsForStudent(principal.getUsername(), studentId));
    }

    @GetMapping("/me/academic-results")
    @Operation(summary = "List academic results for authenticated student")
    public ResponseEntity<List<AcademicResultDto>> getMyAcademicResults(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(screeningService.listAcademicResults(principal.getUsername()));
    }

    @GetMapping("/{studentId}/academic-results")
    @Operation(summary = "List academic results by student ID (own data only)")
    public ResponseEntity<List<AcademicResultDto>> getAcademicResults(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String studentId) {
        return ResponseEntity.ok(
                screeningService.listAcademicResultsForStudent(principal.getUsername(), studentId));
    }

    @GetMapping("/me/helsb")
    @Operation(summary = "List HELSB applications for authenticated student")
    public ResponseEntity<List<HelsbApplicationDto>> getMyHelsbApplications(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(screeningService.listHelsbApplications(principal.getUsername()));
    }

    @GetMapping("/{studentId}/helsb")
    @Operation(summary = "List HELSB applications by student ID (own data only)")
    public ResponseEntity<List<HelsbApplicationDto>> getHelsbApplications(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String studentId) {
        return ResponseEntity.ok(
                screeningService.listHelsbApplicationsForStudent(principal.getUsername(), studentId));
    }
}
