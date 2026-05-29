package com.veriscreen.backend.service;

import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import com.veriscreen.backend.repository.StudentRepository;
import java.util.Collections;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    public CustomUserDetailsService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found: " + id));
        return User.builder()
                .username(student.getId())
                .password(student.getPassword())
                .authorities(Collections.emptyList())
                .build();
    }

    public Student requireStudent(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
    }
}
