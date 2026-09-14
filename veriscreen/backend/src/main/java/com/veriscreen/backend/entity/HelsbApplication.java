package com.veriscreen.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "helsb_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelsbApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String applicationStatus;
    private String paymentStatus;
    private String screeningResult;
    private String contractDetails;
    private String applicationNumber;
    @Column(length = 2000)
    private String notes;
    private Instant submittedAt;
    private Instant reviewedAt;
    private Long externalHelsbId;
    private Integer loanPercent;
    private String mobileMoneyPhone;
    private String mobileMoneyProvider;
    @Column(length = 1000)
    private String submittedDocumentIds;
    private Boolean contractEmailed;
}
