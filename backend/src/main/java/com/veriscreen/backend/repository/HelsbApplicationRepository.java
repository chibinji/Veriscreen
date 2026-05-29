package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.HelsbApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HelsbApplicationRepository extends JpaRepository<HelsbApplication, Long> {
}
