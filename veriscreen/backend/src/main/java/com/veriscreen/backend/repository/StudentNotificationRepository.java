package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.StudentNotification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentNotificationRepository extends JpaRepository<StudentNotification, Long> {
    List<StudentNotification> findByStudent_IdOrderByCreatedAtDesc(String studentId);
}
