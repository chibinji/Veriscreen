package com.veriscreen.backend.service.student;

import com.veriscreen.backend.dto.StudentProfileDto;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import com.veriscreen.backend.integration.sis.SisModels;
import com.veriscreen.backend.mapper.StudentMapper;
import com.veriscreen.backend.repository.StudentRepository;
import com.veriscreen.backend.service.academic.AcademicRecordGateway;
import com.veriscreen.backend.service.security.StudentAccessValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentAccessValidator accessValidator;
    private final AcademicRecordGateway academicRecordGateway;

    public StudentServiceImpl(
            StudentRepository studentRepository,
            StudentAccessValidator accessValidator,
            AcademicRecordGateway academicRecordGateway) {
        this.studentRepository = studentRepository;
        this.accessValidator = accessValidator;
        this.academicRecordGateway = academicRecordGateway;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentProfileDto getProfile(String authenticatedStudentId) {
        return getProfileForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentProfileDto getProfileForStudent(String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        Student student = studentRepository.findById(requestedStudentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + requestedStudentId));
        SisModels.Student remote = academicRecordGateway.fetchAuthoritativeStudent(requestedStudentId).orElse(null);
        if (remote != null) {
            academicRecordGateway.overlayStudent(student, remote);
        }
        StudentProfileDto dto = StudentMapper.toProfileDto(student);
        if (remote != null) {
            dto.setRegistrationStatus(remote.getRegistrationStatus());
            dto.setYearOfStudy(remote.getYearOfStudy());
            dto.setFaculty(remote.getFaculty());
        }
        log.debug("Profile loaded for student id={}", requestedStudentId);
        return dto;
    }
}
