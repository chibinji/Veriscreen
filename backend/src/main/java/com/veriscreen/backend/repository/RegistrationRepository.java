package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.Registration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByStudent_Id(String studentId);

    void deleteByStudent_Id(String studentId);
}
