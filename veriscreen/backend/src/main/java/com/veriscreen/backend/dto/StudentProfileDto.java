package com.veriscreen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDto {
    private String id;
    private String name;
    private String nrc;
    private String program;
    private String faculty;
    private Integer enrollmentYear;
    private String registrationStatus;
    private Integer yearOfStudy;
    private String email;
    private String phone;
    private String nextOfKinName;
    private String nextOfKinRelationship;
    private String nextOfKinPhone;
    private String nextOfKinNrc;
    private String nextOfKinAddress;
}
