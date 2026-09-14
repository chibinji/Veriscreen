package com.veriscreen.backend.mapper;

import com.veriscreen.backend.dto.StudentProfileDto;
import com.veriscreen.backend.entity.Student;

/**
 * Maps entities to DTOs (keeps entities out of REST responses).
 */
public final class StudentMapper {

    private StudentMapper() {
    }

    public static StudentProfileDto toProfileDto(Student student) {
        return StudentProfileDto.builder()
                .id(student.getId())
                .name(student.getName())
                .nrc(student.getNrc())
                .program(student.getProgram())
                .faculty(student.getFaculty())
                .enrollmentYear(student.getEnrollmentYear())
                .email(student.getEmail())
                .phone(student.getPhone())
                .nextOfKinName(student.getNextOfKinName())
                .nextOfKinRelationship(student.getNextOfKinRelationship())
                .nextOfKinPhone(student.getNextOfKinPhone())
                .nextOfKinNrc(student.getNextOfKinNrc())
                .nextOfKinAddress(student.getNextOfKinAddress())
                .build();
    }
}
