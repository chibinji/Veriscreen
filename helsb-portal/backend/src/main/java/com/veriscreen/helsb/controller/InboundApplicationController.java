package com.veriscreen.helsb.controller;

import com.veriscreen.helsb.dto.ApplicationDto;
import com.veriscreen.helsb.dto.SubmitApplicationRequest;
import com.veriscreen.helsb.service.ApplicationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inbound")
public class InboundApplicationController {

    private final ApplicationService applicationService;

    public InboundApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "helsb-portal"));
    }

    @PostMapping("/applications")
    public ResponseEntity<ApplicationDto> submit(@Valid @RequestBody SubmitApplicationRequest request) {
        return ResponseEntity.ok(applicationService.ingest(request));
    }

    @GetMapping("/students/{studentId}/applications")
    public ResponseEntity<List<ApplicationDto>> forStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(applicationService.listForStudent(studentId));
    }
}
