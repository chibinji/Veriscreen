package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.HelsbApplication;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HelsbApplicationRepository extends JpaRepository<HelsbApplication, Long> {

    List<HelsbApplication> findByStudent_Id(String studentId);

    Optional<HelsbApplication> findFirstByStudent_IdAndApplicationStatusInOrderByIdDesc(
            String studentId, Collection<String> statuses);

    Optional<HelsbApplication> findByApplicationNumber(String applicationNumber);

    Optional<HelsbApplication> findFirstByStudent_IdOrderByIdDesc(String studentId);
}
