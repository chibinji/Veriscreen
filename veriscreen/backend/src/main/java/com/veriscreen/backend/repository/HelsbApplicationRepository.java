package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.HelsbApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HelsbApplicationRepository extends JpaRepository<HelsbApplication, Long> {

    List<HelsbApplication> findByStudent_Id(String studentId);
<<<<<<< HEAD:veriscreen/backend/src/main/java/com/veriscreen/backend/repository/HelsbApplicationRepository.java

    Optional<HelsbApplication> findFirstByStudent_IdAndApplicationStatusInOrderByIdDesc(
            String studentId, Collection<String> statuses);

    Optional<HelsbApplication> findByApplicationNumber(String applicationNumber);

    Optional<HelsbApplication> findFirstByStudent_IdOrderByIdDesc(String studentId);
=======
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:backend/src/main/java/com/veriscreen/backend/repository/HelsbApplicationRepository.java
}
