package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.Student;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findById(String id);
}
