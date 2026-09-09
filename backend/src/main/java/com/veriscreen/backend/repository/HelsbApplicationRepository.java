package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.HelsbApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HelsbApplicationRepository extends JpaRepository<HelsbApplication, Long> {

    List<HelsbApplication> findByStudent_Id(String studentId);
}
