package com.veriscreen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicResultDto {
    private Long id;
    private String courseCode;
    private String courseName;
    private String grade;
    private Integer credits;
    private String academicYear;
}
