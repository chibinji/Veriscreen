package com.veriscreen.university.repository;

import com.veriscreen.university.entity.Fee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudent_Id(String studentId);
}
