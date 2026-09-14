package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.Fee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {

    List<Fee> findByStudent_Id(String studentId);
}
