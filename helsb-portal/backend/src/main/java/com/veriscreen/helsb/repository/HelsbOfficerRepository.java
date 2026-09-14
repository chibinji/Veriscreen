package com.veriscreen.helsb.repository;

import com.veriscreen.helsb.entity.HelsbOfficer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HelsbOfficerRepository extends JpaRepository<HelsbOfficer, Long> {
    Optional<HelsbOfficer> findByUsername(String username);

    Optional<HelsbOfficer> findByUsernameIgnoreCase(String username);
}
