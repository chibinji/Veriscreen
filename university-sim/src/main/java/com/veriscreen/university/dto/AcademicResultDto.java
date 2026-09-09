package com.veriscreen.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcademicResultDto {
    private Long id;
    private String studentId;
    private String courseCode;
    private String grade;
    private Integer credits;
}
