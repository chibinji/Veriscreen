package com.veriscreen.backend.controller;

import com.veriscreen.backend.constants.ApiPaths;
import com.veriscreen.backend.integration.university.UniversityProperties;
import com.veriscreen.backend.integration.university.UniversitySyncService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping(ApiPaths.ADMIN_SYNC)
public class UniversitySyncController {

    private final UniversitySyncService syncService;
    private final UniversityProperties properties;

    public UniversitySyncController(UniversitySyncService syncService, UniversityProperties properties) {
        this.syncService = syncService;
        this.properties = properties;
    }

    @PostMapping("/university")
    public Map<String, Object> syncUniversity(@RequestHeader(value = "X-Api-Key", required = false) String apiKey) {
        if (apiKey == null || !apiKey.equals(properties.getApiKey())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing X-Api-Key");
        }
        if (!properties.getSync().isEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "University sync is disabled");
        }
        int count = syncService.syncAll();
        return Map.of("syncedStudents", count, "status", "ok");
    }
}
