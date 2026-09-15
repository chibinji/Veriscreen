package com.veriscreen.backend.integration.sis;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Component
public class SisClient {

    private final RestClient restClient;

    public SisClient(
            @Value("${veriscreen.sis.base-url:http://localhost:8090}") String baseUrl,
            @Value("${veriscreen.sis.api-key:dev-shared-secret}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl(trim(baseUrl))
                .defaultHeader("X-Api-Key", apiKey)
                .defaultHeader("X-API-Key", apiKey)
                .build();
    }

    public Optional<SisModels.Student> getStudent(String studentId) {
        return get("/sis/v1/students/" + studentId, SisModels.Student.class);
    }

    public List<SisModels.Registration> getRegistrations(String studentId) {
        return list("/sis/v1/students/" + studentId + "/registrations", SisModels.Registration[].class);
    }

    public List<SisModels.Result> getResults(String studentId) {
        return list("/sis/v1/students/" + studentId + "/academic-results", SisModels.Result[].class);
    }

    public List<SisModels.Examination> getExaminations(String studentId) {
        return list("/sis/v1/students/" + studentId + "/examinations", SisModels.Examination[].class);
    }

    public List<SisModels.Payment> getPayments(String studentId) {
        return list("/sis/v1/students/" + studentId + "/fees", SisModels.Payment[].class);
    }

    public Optional<SisModels.Snapshot> getSnapshot(String studentId) {
        Optional<SisModels.Student> student = getStudent(studentId);
        if (student.isEmpty()) {
            return Optional.empty();
        }
        SisModels.Snapshot snapshot = new SisModels.Snapshot();
        snapshot.setStudent(student.get());
        snapshot.setRegistrations(getRegistrations(studentId));
        snapshot.setResults(getResults(studentId));
        snapshot.setExaminations(getExaminations(studentId));
        snapshot.setPayments(getPayments(studentId));
        return Optional.of(snapshot);
    }

    private <T> Optional<T> get(String path, Class<T> type) {
        try {
            T body = restClient.get()
                    .uri(path)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw new RestClientException("SIS returned " + response.getStatusCode());
                    })
                    .body(type);
            return Optional.ofNullable(body);
        } catch (Exception ex) {
            log.warn("SIS lookup failed for {}: {}", path, ex.getMessage());
            return Optional.empty();
        }
    }

    private <T> List<T> list(String path, Class<T[]> type) {
        return get(path, type).map(Arrays::asList).orElse(List.of());
    }

    private String trim(String value) {
        return value != null && value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
