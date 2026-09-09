package com.veriscreen.university.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExaminationDto {
    private Long id;
    private String studentId;
    private String academicYear;
    private Boolean eligible;
    private String status;
}
