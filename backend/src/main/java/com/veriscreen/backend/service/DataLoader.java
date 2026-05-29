package com.veriscreen.backend.service;

import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.repository.StudentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DataLoader implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (studentRepository.count() == 0) {
            Student student = new Student();
            student.setId("2021465934");
            student.setName("Samuel Mwanza");
            student.setNrc("123456/78/1");
            student.setProgram("Computer Science");
            student.setEnrollmentYear(2021);
            student.setPassword(passwordEncoder.encode("password123"));
            studentRepository.save(student);
            log.info("Seeded mock student id={}", student.getId());
        }
    }
}
