package com.veriscreen.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private String studentId;
    private String applicationStatus;
    private String paymentStatus;
    private String screeningResult;
    private String contractDetails;
}
