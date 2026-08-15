package com.veriscreen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExaminationDto {
    private Long id;
    private String academicYear;
    private Boolean eligible;
    private String status;
}
