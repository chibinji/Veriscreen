package com.veriscreen.backend.integration.university;

import com.veriscreen.backend.integration.university.UniversitySisDtos.AcademicResultDto;
import com.veriscreen.backend.integration.university.UniversitySisDtos.ExaminationDto;
import com.veriscreen.backend.integration.university.UniversitySisDtos.FeeDto;
import com.veriscreen.backend.integration.university.UniversitySisDtos.RegistrationDto;
import com.veriscreen.backend.integration.university.UniversitySisDtos.StudentDto;
import java.util.Arrays;
import java.util.List;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class UniversityClient {

    private final RestClient restClient;

    public UniversityClient(UniversityProperties properties) {
        this.restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("X-Api-Key", properties.getApiKey())
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public List<String> listStudentIds() {
        String[] ids = restClient.get()
                .uri("/sis/v1/students")
                .retrieve()
                .body(String[].class);
        return ids == null ? List.of() : Arrays.asList(ids);
    }

    public StudentDto getStudent(String studentId) {
        return restClient.get()
                .uri("/sis/v1/students/{id}", studentId)
                .retrieve()
                .body(StudentDto.class);
    }

    public List<RegistrationDto> getRegistrations(String studentId) {
        return restClient.get()
                .uri("/sis/v1/students/{id}/registrations", studentId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<FeeDto> getFees(String studentId) {
        return restClient.get()
                .uri("/sis/v1/students/{id}/fees", studentId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<ExaminationDto> getExaminations(String studentId) {
        return restClient.get()
                .uri("/sis/v1/students/{id}/examinations", studentId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<AcademicResultDto> getAcademicResults(String studentId) {
        return restClient.get()
                .uri("/sis/v1/students/{id}/academic-results", studentId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }
}
