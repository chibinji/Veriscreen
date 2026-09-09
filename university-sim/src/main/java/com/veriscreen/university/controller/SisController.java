package com.veriscreen.university.controller;

import com.veriscreen.university.dto.AcademicResultDto;
import com.veriscreen.university.dto.ExaminationDto;
import com.veriscreen.university.dto.ExaminationUpdateRequest;
import com.veriscreen.university.dto.FeeDto;
import com.veriscreen.university.dto.FeeUpdateRequest;
import com.veriscreen.university.dto.RegistrationDto;
import com.veriscreen.university.dto.StudentDto;
import com.veriscreen.university.service.SisService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sis/v1/students")
public class SisController {

    private final SisService sisService;

    public SisController(SisService sisService) {
        this.sisService = sisService;
    }

    @GetMapping
    public List<String> listStudents() {
        return sisService.listStudentIds();
    }

    @GetMapping("/{id}")
    public StudentDto getStudent(@PathVariable String id) {
        return sisService.getStudent(id);
    }

    @GetMapping("/{id}/registrations")
    public List<RegistrationDto> getRegistrations(@PathVariable String id) {
        return sisService.getRegistrations(id);
    }

    @GetMapping("/{id}/fees")
    public List<FeeDto> getFees(@PathVariable String id) {
        return sisService.getFees(id);
    }

    @GetMapping("/{id}/examinations")
    public List<ExaminationDto> getExaminations(@PathVariable String id) {
        return sisService.getExaminations(id);
    }

    @GetMapping("/{id}/academic-results")
    public List<AcademicResultDto> getAcademicResults(@PathVariable String id) {
        return sisService.getAcademicResults(id);
    }

    @PatchMapping("/{id}/fees/{feeId}")
    public FeeDto updateFee(
            @PathVariable String id, @PathVariable Long feeId, @RequestBody FeeUpdateRequest request) {
        return sisService.updateFee(id, feeId, request);
    }

    @PatchMapping("/{id}/examinations/{examinationId}")
    public ExaminationDto updateExamination(
            @PathVariable String id,
            @PathVariable Long examinationId,
            @RequestBody ExaminationUpdateRequest request) {
        return sisService.updateExamination(id, examinationId, request);
    }
}
