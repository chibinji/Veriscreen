package com.veriscreen.backend.service.student;

import com.veriscreen.backend.dto.StudentProfileDto;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import com.veriscreen.backend.mapper.StudentMapper;
import com.veriscreen.backend.repository.StudentRepository;
import com.veriscreen.backend.service.security.StudentAccessValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentAccessValidator accessValidator;

    public StudentServiceImpl(StudentRepository studentRepository, StudentAccessValidator accessValidator) {
        this.studentRepository = studentRepository;
        this.accessValidator = accessValidator;
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
        log.debug("Profile loaded for student id={}", requestedStudentId);
        return StudentMapper.toProfileDto(student);
    }
}
