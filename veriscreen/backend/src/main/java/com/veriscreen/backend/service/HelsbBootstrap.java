package com.veriscreen.backend.service;

import com.veriscreen.backend.entity.HelsbApplication;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.integration.university.UniversityProperties;
import com.veriscreen.backend.repository.HelsbApplicationRepository;
import com.veriscreen.backend.repository.StudentRepository;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Seeds VeriScreen-owned HELSB rows after university sync has created students.
 */
@Slf4j
@Component
@Order(10)
public class HelsbBootstrap implements ApplicationRunner {

    private final UniversityProperties universityProperties;
    private final StudentRepository studentRepository;
    private final HelsbApplicationRepository helsbApplicationRepository;

    public HelsbBootstrap(
            UniversityProperties universityProperties,
            StudentRepository studentRepository,
            HelsbApplicationRepository helsbApplicationRepository) {
        this.universityProperties = universityProperties;
        this.studentRepository = studentRepository;
        this.helsbApplicationRepository = helsbApplicationRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!universityProperties.getSync().isEnabled()) {
            return;
        }
        if (helsbApplicationRepository.count() > 0) {
            return;
        }
        if (studentRepository.count() == 0) {
            log.warn("HELSB bootstrap skipped: no students synced yet");
            return;
        }

        seedIfPresent("2021465934", "APPROVED", "DISBURSED", "CLEARED", "2024/2025 loan contract active");
        seedIfPresent(
                "2022030346",
                "UNDER_REVIEW",
                "PENDING",
                "PENDING",
                "Awaiting automated screening outcome");
        seedIfPresent(
                "2020123456",
                "NOT_ELIGIBLE",
                "UNPAID",
                "FAILED",
                "Outstanding fees exceed allowed threshold");
        seedIfPresent(
                "2019876543",
                "APPROVED",
                "PARTIALLY_PAID",
                "CLEARED",
                "2024/2025 engineering loan approved");
        seedIfPresent(
                "2019876543",
                "COMPLETED",
                "DISBURSED",
                "CLEARED",
                "2023/2024 loan cycle completed");

        log.info("Seeded {} HELSB applications after university sync", helsbApplicationRepository.count());
    }

    private void seedIfPresent(
            String studentId,
            String applicationStatus,
            String paymentStatus,
            String screeningResult,
            String contractDetails) {
        Optional<Student> student = studentRepository.findById(studentId);
        if (student.isEmpty()) {
            return;
        }
        HelsbApplication application = new HelsbApplication();
        application.setStudent(student.get());
        application.setApplicationStatus(applicationStatus);
        application.setPaymentStatus(paymentStatus);
        application.setScreeningResult(screeningResult);
        application.setContractDetails(contractDetails);
        helsbApplicationRepository.save(application);
    }
}
