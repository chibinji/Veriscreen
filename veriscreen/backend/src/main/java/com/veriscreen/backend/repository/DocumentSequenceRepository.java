package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.DocumentSequence;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentSequenceRepository extends JpaRepository<DocumentSequence, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM DocumentSequence s WHERE s.year = :year AND s.typeCode = :typeCode")
    Optional<DocumentSequence> findByYearAndTypeCodeForUpdate(
            @Param("year") Integer year, @Param("typeCode") String typeCode);
}
