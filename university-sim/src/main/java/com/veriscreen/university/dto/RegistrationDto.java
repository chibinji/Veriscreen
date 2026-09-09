package com.veriscreen.university.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationDto {
    private Long id;
    private String studentId;
    private String academicYear;
    private Integer semester;
    private Boolean confirmed;
    private LocalDate registrationDate;
}
