package com.veriscreen.university.repository;

import com.veriscreen.university.entity.AcademicResult;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicResultRepository extends JpaRepository<AcademicResult, Long> {
    List<AcademicResult> findByStudent_Id(String studentId);
}
