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
@Table(name = "student_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, length = 20)
    private String channel;

    private boolean readFlag;

    @Column(length = 160)
    private String link;

    private Instant createdAt;
}
