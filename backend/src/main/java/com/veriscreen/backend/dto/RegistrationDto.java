package com.veriscreen.backend.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationDto {
    private Long id;
    private String academicYear;
    private Integer semester;
    private Boolean confirmed;
    private LocalDate registrationDate;
}
