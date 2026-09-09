package com.veriscreen.backend.service.student;

import com.veriscreen.backend.dto.StudentProfileDto;

public interface StudentService {

    StudentProfileDto getProfile(String authenticatedStudentId);

    StudentProfileDto getProfileForStudent(String authenticatedStudentId, String requestedStudentId);
}
