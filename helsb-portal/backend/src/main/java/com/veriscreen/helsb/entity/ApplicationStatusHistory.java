package com.veriscreen.helsb.entity;

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
@Table(name = "application_status_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private LoanApplication application;

    @Column(length = 32)
    private String fromStatus;

    @Column(nullable = false, length = 32)
    private String toStatus;

    @Column(length = 120)
    private String changedBy;

    @Column(length = 2000)
    private String comment;

    private Instant changedAt;
}
