package com.veriscreen.helsb.repository;

import com.veriscreen.helsb.entity.ApplicationStatusHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {
    List<ApplicationStatusHistory> findByApplication_IdOrderByChangedAtAsc(Long applicationId);
}
