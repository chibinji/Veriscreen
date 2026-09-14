package com.veriscreen.helsb.repository;

import com.veriscreen.helsb.entity.LoanApplication;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    Optional<LoanApplication> findByApplicationNumber(String applicationNumber);

    Optional<LoanApplication> findByVeriscreenApplicationId(Long veriscreenApplicationId);

    List<LoanApplication> findByStudentIdOrderBySubmittedAtDesc(String studentId);

    long countByStatus(String status);

    List<LoanApplication> findByUniversityCodeAndSchoolCodeOrderBySubmittedAtDesc(
            String universityCode, String schoolCode);

    long countByUniversityCodeAndSchoolCode(String universityCode, String schoolCode);

    long countByUniversityCodeAndSchoolCodeAndStatus(String universityCode, String schoolCode, String status);
}
