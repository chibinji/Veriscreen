package com.veriscreen.backend.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelsbApplicationDto {
    private Long id;
    private String applicationStatus;
    private String paymentStatus;
    private String screeningResult;
    private String contractDetails;
    private String applicationNumber;
    private String notes;
    private Instant submittedAt;
    private Instant reviewedAt;
    private Integer loanPercent;
    private boolean hasLoan;
    private String mobileMoneyPhone;
    private String mobileMoneyProvider;
    private String submittedDocumentIds;
    private boolean contractAvailable;
    private String studentName;
    private String studentId;
    private String nrc;
    private String programme;
    private String faculty;
    private String email;
    private String phone;
}
