package com.veriscreen.university.repository;

import com.veriscreen.university.entity.Registration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByStudent_Id(String studentId);
}
