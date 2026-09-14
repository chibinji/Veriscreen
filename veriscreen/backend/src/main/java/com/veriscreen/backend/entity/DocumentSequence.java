package com.veriscreen.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "document_sequences",
        uniqueConstraints = @UniqueConstraint(name = "uk_document_sequence_year_type", columnNames = {"year", "type_code"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "type_code", nullable = false, length = 8)
    private String typeCode;

    @Column(name = "last_value", nullable = false)
    private Long lastValue;
}
