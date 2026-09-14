package com.veriscreen.backend.integration.sis;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;

public final class SisModels {

    private SisModels() {
    }

    @Data
    public static class Student {
        private String id;
        private String name;
        private String nrc;
        private String program;
        private String faculty;
        private String school;
        private Integer enrollmentYear;
        private String registrationStatus;
        private Integer yearOfStudy;
    }

    @Data
    public static class Registration {
        private Long id;
        private String academicYear;
        private Integer semester;
        private Boolean confirmed;
        private LocalDate registrationDate;
        private Integer yearOfStudy;
    }

    @Data
    public static class Result {
        private Long id;
        private String courseCode;
        private String courseName;
        private String grade;
        private Integer credits;
        private String academicYear;
    }

    @Data
    public static class Examination {
        private Long id;
        private String academicYear;
        private Boolean eligible;
        private String status;
        private String sessionName;
    }

    @Data
    public static class Payment {
        private Long id;
        private LocalDate paymentDate;
        private BigDecimal amount;
        private String receiptNo;
        private BigDecimal outstandingBalance;
        private String description;
        private String currency;
    }

    @Data
    public static class Snapshot {
        private Student student;
        private List<Registration> registrations;
        private List<Result> results;
        private List<Examination> examinations;
        private List<Payment> payments;
    }
}
