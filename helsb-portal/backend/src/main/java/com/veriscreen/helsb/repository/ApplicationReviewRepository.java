package com.veriscreen.helsb.repository;

import com.veriscreen.helsb.entity.ApplicationReview;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationReviewRepository extends JpaRepository<ApplicationReview, Long> {
    List<ApplicationReview> findByApplication_IdOrderByCreatedAtAsc(Long applicationId);
}
