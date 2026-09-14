package com.veriscreen.helsb.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "applications", indexes = {
        @Index(name = "idx_applications_status", columnList = "status"),
        @Index(name = "idx_applications_student", columnList = "student_id"),
        @Index(name = "idx_applications_number", columnList = "application_number", unique = true),
        @Index(name = "idx_applications_university_school", columnList = "university_code, school_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_number", nullable = false, unique = true, length = 40)
    private String applicationNumber;

    @Column(name = "veriscreen_application_id")
    private Long veriscreenApplicationId;

    @Column(name = "student_id", nullable = false, length = 20)
    private String studentId;

    @Column(length = 160)
    private String studentName;

    @Column(length = 32)
    private String nrc;

    @Column(length = 120)
    private String programme;

    @Column(length = 160)
    private String faculty;

    @Column(name = "university_code", length = 16)
    private String universityCode;

    @Column(name = "school_code", length = 16)
    private String schoolCode;

    @Column(name = "school_name", length = 160)
    private String schoolName;

    @Column(name = "screening_percent")
    private Integer screeningPercent;

    @Column(name = "screening_approved")
    private Boolean screeningApproved;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(length = 1000)
    private String documentIds;

    @Column(length = 2000)
    private String notes;

    private Instant submittedAt;
    private Instant reviewedAt;

    @Column(length = 120)
    private String reviewedBy;
}
