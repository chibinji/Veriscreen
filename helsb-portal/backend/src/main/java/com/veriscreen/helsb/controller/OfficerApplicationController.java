package com.veriscreen.helsb.controller;

import com.veriscreen.helsb.dto.ApplicationDetailDto;
import com.veriscreen.helsb.dto.ApplicationDto;
import com.veriscreen.helsb.dto.ApproveScreeningRequest;
import com.veriscreen.helsb.dto.DashboardStatsDto;
import com.veriscreen.helsb.dto.DecisionRequest;
import com.veriscreen.helsb.dto.SchoolApplicationsDto;
import com.veriscreen.helsb.dto.SchoolProgrammesDto;
import com.veriscreen.helsb.dto.UniversityDetailDto;
import com.veriscreen.helsb.dto.UniversityDto;
import com.veriscreen.helsb.service.ApplicationService;
import com.veriscreen.helsb.service.InstitutionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/officer")
public class OfficerApplicationController {

    private final ApplicationService applicationService;
    private final InstitutionService institutionService;

    public OfficerApplicationController(
            ApplicationService applicationService,
            InstitutionService institutionService) {
        this.applicationService = applicationService;
        this.institutionService = institutionService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> stats() {
        return ResponseEntity.ok(applicationService.stats());
    }

    @GetMapping("/universities")
    public ResponseEntity<List<UniversityDto>> universities() {
        return ResponseEntity.ok(institutionService.listUniversities());
    }

    @GetMapping("/universities/{universityCode}")
    public ResponseEntity<UniversityDetailDto> university(@PathVariable String universityCode) {
        return ResponseEntity.ok(institutionService.getUniversity(universityCode));
    }

    @GetMapping("/universities/{universityCode}/schools/{schoolCode}/applications")
    public ResponseEntity<SchoolApplicationsDto> schoolApplications(
            @PathVariable String universityCode,
            @PathVariable String schoolCode) {
        return ResponseEntity.ok(institutionService.schoolApplications(universityCode, schoolCode));
    }

    @GetMapping("/universities/{universityCode}/schools/{schoolCode}/programmes")
    public ResponseEntity<SchoolProgrammesDto> schoolProgrammes(
            @PathVariable String universityCode,
            @PathVariable String schoolCode) {
        return ResponseEntity.ok(institutionService.schoolProgrammes(universityCode, schoolCode));
    }

    @GetMapping("/universities/{universityCode}/schools/{schoolCode}/programmes/{programmeCode}/students")
    public ResponseEntity<List<ApplicationDto>> programmeStudents(
            @PathVariable String universityCode,
            @PathVariable String schoolCode,
            @PathVariable String programmeCode) {
        return ResponseEntity.ok(institutionService.programmeStudents(universityCode, schoolCode, programmeCode));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationDto>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(applicationService.list(status, search));
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApplicationDetailDto> get(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean startReview) {
        return ResponseEntity.ok(applicationService.get(id, startReview));
    }

    @PostMapping("/applications/{id}/confirm")
    public ResponseEntity<ApplicationDto> confirm(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(applicationService.confirm(id, principal.getUsername(), request.getComment()));
    }

    @PostMapping("/applications/{id}/approve-screening")
    public ResponseEntity<ApplicationDto> approveScreening(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestBody(required = false) ApproveScreeningRequest request) {
        String comment = request == null ? null : request.getComment();
        return ResponseEntity.ok(applicationService.approveScreening(id, principal.getUsername(), comment));
    }

    @PostMapping("/applications/{id}/reject")
    public ResponseEntity<ApplicationDto> reject(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody DecisionRequest request) {
        return ResponseEntity.ok(applicationService.reject(id, principal.getUsername(), request.getComment()));
    }
}
