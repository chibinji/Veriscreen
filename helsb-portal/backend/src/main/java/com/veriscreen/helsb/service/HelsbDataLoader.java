package com.veriscreen.helsb.service;

import com.veriscreen.helsb.catalog.InstitutionCatalog;
import com.veriscreen.helsb.entity.HelsbOfficer;
import com.veriscreen.helsb.entity.LoanApplication;
import com.veriscreen.helsb.repository.HelsbOfficerRepository;
import com.veriscreen.helsb.repository.LoanApplicationRepository;
import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class HelsbDataLoader implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "password123";

    private final HelsbOfficerRepository officerRepository;
    private final LoanApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public HelsbDataLoader(
            HelsbOfficerRepository officerRepository,
            LoanApplicationRepository applicationRepository,
            PasswordEncoder passwordEncoder) {
        this.officerRepository = officerRepository;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        migrateOfficer("officer.chanda", "mwaka.chanda@helsb.zm", "Mwaka Chanda");
        migrateOfficer("officer.phiri", "chanda.phiri@helsb.zm", "Chanda Phiri");
        ensureOfficer("mwaka.chanda@helsb.zm", "Mwaka Chanda");
        ensureOfficer("chanda.phiri@helsb.zm", "Chanda Phiri");
        backfillPlacements();
        seedDemoApplications();
        log.info("HELSB officers ready:  mwaka.chanda@helsb.zm / chanda.phiri@helsb.zm");
    }

    private void migrateOfficer(String fromUsername, String toUsername, String fullName) {
        officerRepository.findByUsernameIgnoreCase(fromUsername).ifPresent(officer -> {
            if (officerRepository.findByUsernameIgnoreCase(toUsername).isEmpty()) {
                officer.setUsername(toUsername.toLowerCase());
                officer.setFullName(fullName);
                officerRepository.save(officer);
            }
        });
    }

    private void ensureOfficer(String username, String fullName) {
        String email = username.toLowerCase();
        if (officerRepository.findByUsernameIgnoreCase(email).isPresent()) {
            return;
        }
        HelsbOfficer officer = new HelsbOfficer();
        officer.setUsername(email);
        officer.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        officer.setFullName(fullName);
        officer.setRole("HELSB_OFFICER");
        officerRepository.save(officer);
    }

    private void backfillPlacements() {
        for (LoanApplication application : applicationRepository.findAll()) {
            boolean missing = isBlank(application.getUniversityCode()) || isBlank(application.getSchoolCode());
            if (!missing && application.getScreeningPercent() != null) {
                continue;
            }
            InstitutionCatalog.Placement placement = InstitutionCatalog.place(
                    application.getFaculty(), application.getProgramme());
            if (isBlank(application.getUniversityCode())) {
                application.setUniversityCode(placement.universityCode());
            }
            if (isBlank(application.getSchoolCode())) {
                application.setSchoolCode(placement.schoolCode());
                application.setSchoolName(placement.schoolName());
            }
            if (isBlank(application.getFaculty())) {
                application.setFaculty(placement.schoolName());
            }
            if (application.getScreeningPercent() == null) {
                application.setScreeningPercent(percentFor(application.getStudentId(), 50));
            }
            if (application.getScreeningApproved() == null) {
                application.setScreeningApproved(false);
            }
            applicationRepository.save(application);
        }
    }

    private void seedDemoApplications() {
        seed("2021465934", "Samuel Chibinji Mwanza", "123456/10/1", "UNZA", "NAS",
                "School of Natural and Applied Sciences", "Computer Science", 100,
                "VS-2026-RES-000001,VS-2026-REG-000001", "Final-year Computer Science student with an approved HELSB loan.",
                ApplicationService.CONFIRMED, "HELSB-2026-000001");
        seed("2022030346", "Nosiku Mukuka", "234567/11/1", "UNZA", "NAS",
                "School of Natural and Applied Sciences", "Information Technology", 75,
                "VS-2026-RES-000002,VS-2026-REG-000002", "IT student. Fees fully paid. HELSB loan at 75%.",
                ApplicationService.UNDER_REVIEW, "HELSB-2026-000002");
        seed("2020123456", "Grace Banda", "345678/12/1", "UNZA", "HUM",
                "School of Humanities", "Economics", 50,
                "VS-2026-RES-000003,VS-2026-PAY-000003", "Economics student. New loan application at 50%.",
                ApplicationService.PENDING, "HELSB-2026-000003");
        seed("2019876543", "Peter Zulu", "456789/13/1", "UNZA", "ENG",
                "School of Engineering", "Electrical Engineering", 75,
                "VS-2026-RES-000004,VS-2026-REG-000004", "Electrical Engineering student with a 75% student loan.",
                ApplicationService.CONFIRMED, "HELSB-2026-000004");
        seed("2018456123", "Mutale Banda", "567890/14/1", "UNZA", "NAS",
                "School of Natural and Applied Sciences", "Physics", 50,
                "Academic Transcript,Registration Record", "Second-year Physics student. New 50% loan request.",
                ApplicationService.PENDING, null);
        seed("2017567890", "Thandiwe Phiri", "678901/15/1", "UNZA", "HUM",
                "School of Humanities", "Political Science", 75,
                "Academic Transcript,NRC Copy", "Political Science student with a 75% student loan.",
                ApplicationService.PENDING, null);
        seed("2016345123", "Chilufya Tembo", "789012/16/1", "UNZA", "LAW",
                "School of Law", "Bachelor of Laws", 50,
                "Academic Transcript,Registration Record,NRC Copy", "LLB student. New screening request at 50%.",
                ApplicationService.PENDING, null);
        seed("2015234789", "Mwansa Kalumba", "890123/17/1", "UNZA", "MED",
                "School of Medicine", "MBChB", 100,
                "Academic Transcript,Registration Record", "Medicine student on a 100% HELSB loan.",
                ApplicationService.PENDING, null);
        seed("2014123654", "Lweendo Siame", "901234/18/1", "UNZA", "NUR",
                "School of Nursing Sciences", "Nursing", 75,
                "Academic Transcript,Registration Record", "Nursing student with a 75% student loan.",
                ApplicationService.PENDING, null);
        seed("2013012789", "Chileshe Mwamba", "012345/19/1", "UNZA", "ENG",
                "School of Engineering", "Civil Engineering", 100,
                "Academic Transcript,Fee Statement", "Civil Engineering student on a 100% loan.",
                ApplicationService.PENDING, null);
        seed("2012789012", "Natasha Mulenga", "112233/20/1", "UNZA", "AGR",
                "School of Agriculture", "Agronomy", 50,
                "Academic Transcript,Registration Record", "Agronomy student. New 50% loan application.",
                ApplicationService.PENDING, null);
        seed("2011678945", "Kondwani Zimba", "223344/21/1", "UNZA", "MIN",
                "School of Mines", "Mining Engineering", 75,
                "Academic Transcript,Registration Record", "Mining Engineering student with a 75% loan.",
                ApplicationService.PENDING, null);
        seed("2010567834", "Bupe Mwila", "334455/22/1", "UNZA", "VET",
                "School of Veterinary Medicine", "Veterinary Medicine", 100,
                "Academic Transcript,Registration Record", "Veterinary Medicine student on a 100% loan.",
                ApplicationService.PENDING, null);
        seed("2009456723", "Namukolo Daka", "445566/23/1", "UNZA", "EDU",
                "School of Education", "Mathematics Education", 50,
                "Academic Transcript,NRC Copy", "Mathematics Education student. New 50% loan request.",
                ApplicationService.PENDING, null);
        seed("2008345612", "Joseph Kasanda", "556677/24/1", "UNZA", "HS",
                "School of Health Sciences", "Pharmacy", 75,
                "Academic Transcript,Registration Record", "Pharmacy student with a 75% student loan.",
                ApplicationService.PENDING, null);
        seed("2007234501", "Mary Lungu", "667788/25/1", "UNZA", "PH",
                "School of Public Health", "Public Health", 100,
                "Academic Transcript,Registration Record", "Public Health student on a 100% HELSB loan.",
                ApplicationService.PENDING, null);
    }

    private void seed(
            String studentId,
            String name,
            String nrc,
            String universityCode,
            String schoolCode,
            String schoolName,
            String programme,
            int percent,
            String documentIds,
            String notes,
            String status,
            String applicationNumber) {
        List<LoanApplication> existing = applicationRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        if (!existing.isEmpty()) {
            LoanApplication application = existing.get(0);
            application.setUniversityCode(universityCode);
            application.setSchoolCode(schoolCode);
            application.setSchoolName(schoolName);
            application.setProgramme(programme);
            application.setFaculty(schoolName);
            if (application.getScreeningPercent() == null) {
                application.setScreeningPercent(percent);
            }
            if (isBlank(application.getDocumentIds())) {
                application.setDocumentIds(documentIds);
            }
            if (application.getVeriscreenApplicationId() == null && application.getReviewedAt() == null) {
                application.setStatus(status);
                application.setScreeningApproved(ApplicationService.CONFIRMED.equals(status));
                if (!isBlank(applicationNumber)
                        && (isBlank(application.getApplicationNumber())
                                || applicationNumber.equals(application.getApplicationNumber())
                                || applicationRepository.findByApplicationNumber(applicationNumber)
                                        .map(found -> found.getId().equals(application.getId()))
                                        .orElse(true))) {
                    application.setApplicationNumber(applicationNumber);
                }
            }
            applicationRepository.save(application);
            return;
        }
        LoanApplication application = new LoanApplication();
        application.setApplicationNumber(uniqueNumber(applicationNumber));
        application.setStudentId(studentId);
        application.setStudentName(name);
        application.setNrc(nrc);
        application.setProgramme(programme);
        application.setFaculty(schoolName);
        application.setUniversityCode(universityCode);
        application.setSchoolCode(schoolCode);
        application.setSchoolName(schoolName);
        application.setScreeningPercent(percent);
        application.setScreeningApproved(ApplicationService.CONFIRMED.equals(status));
        application.setStatus(status);
        application.setDocumentIds(documentIds);
        application.setNotes(notes);
        application.setSubmittedAt(Instant.now().minusSeconds(3600L * (20 - sequence.get())));
        applicationRepository.save(application);
    }

    private String uniqueNumber(String preferred) {
        if (!isBlank(preferred) && applicationRepository.findByApplicationNumber(preferred).isEmpty()) {
            return preferred;
        }
        return nextNumber();
    }

    private int percentFor(String studentId, int fallback) {
        return switch (studentId) {
            case "2021465934" -> 100;
            case "2022030346", "2019876543" -> 75;
            case "2020123456" -> 50;
            default -> fallback;
        };
    }

    private String nextNumber() {
        int next = sequence.incrementAndGet() + (int) applicationRepository.count();
        return "HELSB-" + Year.now().getValue() + "-" + String.format("%06d", next);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
