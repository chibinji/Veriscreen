package com.veriscreen.backend.integration.university;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * DTOs matching the university-sim SIS JSON contract.
 */
public final class UniversitySisDtos {

    private UniversitySisDtos() {
    }

    @Data
    public static class StudentDto {
        private String id;
        private String name;
        private String nrc;
        private String program;
        private Integer enrollmentYear;
    }

    @Data
    public static class RegistrationDto {
        private Long id;
        private String studentId;
        private String academicYear;
        private Integer semester;
        private Boolean confirmed;
        private LocalDate registrationDate;
    }

    @Data
    public static class FeeDto {
        private Long id;
        private String studentId;
        private LocalDate paymentDate;
        private BigDecimal amount;
        private String receiptNo;
        private BigDecimal outstandingBalance;
    }

    @Data
    public static class ExaminationDto {
        private Long id;
        private String studentId;
        private String academicYear;
        private Boolean eligible;
        private String status;
    }

    @Data
    public static class AcademicResultDto {
        private Long id;
        private String studentId;
        private String courseCode;
        private String grade;
        private Integer credits;
    }
}
