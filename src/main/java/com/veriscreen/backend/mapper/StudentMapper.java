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
                .program(student.getProgram())
                .enrollmentYear(student.getEnrollmentYear())
                .build();
    }
}
