package com.veriscreen.helsb.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "helsb_officers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelsbOfficer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 40)
    private String role;
}
