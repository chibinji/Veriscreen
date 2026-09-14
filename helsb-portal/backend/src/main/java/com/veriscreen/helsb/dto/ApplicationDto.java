package com.veriscreen.helsb.dto;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationDto {
    private Long id;
    private String applicationNumber;
    private Long veriscreenApplicationId;
    private String studentId;
    private String studentName;
    private String nrc;
    private String programme;
    private String faculty;
    private String universityCode;
    private String schoolCode;
    private String schoolName;
    private Integer screeningPercent;
    private boolean screeningApproved;
    private String status;
    private List<String> documentIds;
    private String notes;
    private Instant submittedAt;
    private Instant reviewedAt;
    private String reviewedBy;
}
