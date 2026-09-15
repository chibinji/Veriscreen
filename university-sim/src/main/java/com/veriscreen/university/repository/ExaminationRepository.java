package com.veriscreen.university.repository;

import com.veriscreen.university.entity.Examination;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExaminationRepository extends JpaRepository<Examination, Long> {
    List<Examination> findByStudent_Id(String studentId);
}
