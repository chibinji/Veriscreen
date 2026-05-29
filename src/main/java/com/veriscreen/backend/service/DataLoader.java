package com.veriscreen.backend.service;

import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

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
        }
    }
}
