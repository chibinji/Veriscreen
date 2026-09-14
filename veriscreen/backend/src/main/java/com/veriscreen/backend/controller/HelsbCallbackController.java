package com.veriscreen.backend.controller;

import com.veriscreen.backend.constants.ApiPaths;
import com.veriscreen.backend.entity.HelsbApplication;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import com.veriscreen.backend.integration.helsb.HelsbModels;
import com.veriscreen.backend.mapper.ScreeningMapper;
import com.veriscreen.backend.repository.HelsbApplicationRepository;
import com.veriscreen.backend.service.screening.StudentScreeningServiceImpl;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiPaths.INTERNAL_HELSB)
public class HelsbCallbackController {

    private final HelsbApplicationRepository helsbApplicationRepository;
    private final StudentScreeningServiceImpl screeningService;
    private final String expectedApiKey;

    public HelsbCallbackController(
            HelsbApplicationRepository helsbApplicationRepository,
            StudentScreeningServiceImpl screeningService,
            @Value("${veriscreen.helsb.callback-api-key:veriscreen-helsb-callback-change-me}") String expectedApiKey) {
        this.helsbApplicationRepository = helsbApplicationRepository;
        this.screeningService = screeningService;
        this.expectedApiKey = expectedApiKey;
    }

    @PostMapping("/decisions")
    public ResponseEntity<Void> receiveDecision(
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            @RequestBody HelsbModels.Decision decision) {
        if (apiKey == null || !apiKey.equals(expectedApiKey)) {
            return ResponseEntity.status(401).build();
        }
        HelsbApplication application = null;
        if (decision.getVeriscreenApplicationId() != null) {
            application = helsbApplicationRepository.findById(decision.getVeriscreenApplicationId()).orElse(null);
        }
        if (application == null && decision.getApplicationNumber() != null) {
            application = helsbApplicationRepository.findByApplicationNumber(decision.getApplicationNumber()).orElse(null);
        }
        if (application == null && decision.getStudentId() != null) {
            application = helsbApplicationRepository.findFirstByStudent_IdOrderByIdDesc(decision.getStudentId()).orElse(null);
        }
        if (application == null) {
            throw new ResourceNotFoundException("HELSB application not found");
        }
        String previous = ScreeningMapper.normalizeStatus(application.getApplicationStatus());
        if (decision.getStatus() != null) {
            application.setApplicationStatus(ScreeningMapper.normalizeStatus(decision.getStatus()));
        }
        if (decision.getNotes() != null) {
            application.setNotes(decision.getNotes());
            application.setContractDetails(decision.getNotes());
        }
        if (decision.getApplicationNumber() != null) {
            application.setApplicationNumber(decision.getApplicationNumber());
        }
        if ("APPROVED".equals(ScreeningMapper.normalizeStatus(application.getApplicationStatus()))) {
            application.setScreeningResult("CLEARED");
        }
        application.setReviewedAt(Instant.now());
        helsbApplicationRepository.save(application);
        if ("APPROVED".equals(ScreeningMapper.normalizeStatus(application.getApplicationStatus()))
                && !"APPROVED".equals(previous)) {
            screeningService.notifyApproval(application);
        }
        return ResponseEntity.ok().build();
    }
}
