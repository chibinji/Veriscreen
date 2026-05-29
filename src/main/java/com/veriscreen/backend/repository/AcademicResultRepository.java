package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.AcademicResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcademicResultRepository extends JpaRepository<AcademicResult, Long> {
}
