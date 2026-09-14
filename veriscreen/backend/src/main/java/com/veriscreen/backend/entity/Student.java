package com.veriscreen.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    private String id;
    private String name;
    private String nrc;
    private String program;
    private String faculty;
    private Integer enrollmentYear;
    private String password;
    private String email;
    private String phone;
    private String nextOfKinName;
    private String nextOfKinRelationship;
    private String nextOfKinPhone;
    private String nextOfKinNrc;
    private String nextOfKinAddress;
}
