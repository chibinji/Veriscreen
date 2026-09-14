package com.veriscreen.backend.integration.helsb;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class HelsbClient {

    private static final int SUBMIT_ATTEMPTS = 3;

    private final RestClient restClient;
    private final String baseUrl;

    public HelsbClient(
            @Value("${veriscreen.helsb.base-url:http://localhost:8083}") String baseUrl,
            @Value("${veriscreen.helsb.api-key:helsb-dev-api-key-change-me}") String apiKey) {
        this.baseUrl = trim(baseUrl);
        this.restClient = RestClient.builder()
                .baseUrl(this.baseUrl)
                .defaultHeader("X-API-Key", apiKey)
                .build();
    }

    public boolean ping() {
        try {
            restClient.get()
                    .uri("/api/v1/inbound/health")
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception ex) {
            log.warn("HELSB portal is not reachable at {}: {}", baseUrl, ex.getMessage());
            return false;
        }
    }

    public Optional<HelsbModels.Application> submit(HelsbModels.SubmitRequest request) {
        Exception last = null;
        for (int attempt = 1; attempt <= SUBMIT_ATTEMPTS; attempt++) {
            try {
                HelsbModels.Application body = restClient.post()
                        .uri("/api/v1/inbound/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(request)
                        .retrieve()
                        .body(HelsbModels.Application.class);
                return Optional.ofNullable(body);
            } catch (Exception ex) {
                last = ex;
                log.warn("HELSB submit attempt {}/{} failed for student {}: {}",
                        attempt, SUBMIT_ATTEMPTS, request.getStudentId(), ex.getMessage());
                sleepQuietly(250L * attempt);
            }
        }
        log.warn("HELSB submit failed for student {} after {} attempts: {}",
                request.getStudentId(), SUBMIT_ATTEMPTS, last == null ? "unknown" : last.getMessage());
        return Optional.empty();
    }

    public List<HelsbModels.Application> listForStudent(String studentId) {
        try {
            HelsbModels.Application[] body = restClient.get()
                    .uri("/api/v1/inbound/students/{studentId}/applications", studentId)
                    .retrieve()
                    .body(HelsbModels.Application[].class);
            return body == null ? List.of() : Arrays.asList(body);
        } catch (Exception ex) {
            log.warn("HELSB status lookup failed for {}: {}", studentId, ex.getMessage());
            return List.of();
        }
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
        }
    }

    private String trim(String value) {
        return value != null && value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
