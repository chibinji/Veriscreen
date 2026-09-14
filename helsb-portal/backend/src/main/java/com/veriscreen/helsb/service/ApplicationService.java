package com.veriscreen.helsb.service;

import com.veriscreen.helsb.catalog.InstitutionCatalog;
import com.veriscreen.helsb.dto.ApplicationDetailDto;
import com.veriscreen.helsb.dto.ApplicationDto;
import com.veriscreen.helsb.dto.DashboardStatsDto;
import com.veriscreen.helsb.dto.StatusHistoryDto;
import com.veriscreen.helsb.dto.SubmitApplicationRequest;
import com.veriscreen.helsb.dto.VeriscreenDecisionPayload;
import com.veriscreen.helsb.entity.ApplicationReview;
import com.veriscreen.helsb.entity.ApplicationStatusHistory;
import com.veriscreen.helsb.entity.HelsbOfficer;
import com.veriscreen.helsb.entity.LoanApplication;
import com.veriscreen.helsb.exception.InvalidRequestException;
import com.veriscreen.helsb.exception.ResourceNotFoundException;
import com.veriscreen.helsb.repository.ApplicationReviewRepository;
import com.veriscreen.helsb.repository.ApplicationStatusHistoryRepository;
import com.veriscreen.helsb.repository.HelsbOfficerRepository;
import com.veriscreen.helsb.repository.LoanApplicationRepository;
import java.time.Instant;
import java.time.Year;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplicationService {

    public static final String PENDING = "PENDING";
    public static final String UNDER_REVIEW = "UNDER_REVIEW";
    public static final String CONFIRMED = "CONFIRMED";
    public static final String REJECTED = "REJECTED";

    private final LoanApplicationRepository applicationRepository;
    private final ApplicationReviewRepository reviewRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final HelsbOfficerRepository officerRepository;
    private final VeriscreenCallbackClient callbackClient;
    private final AtomicInteger sequence = new AtomicInteger(0);

    public ApplicationService(
            LoanApplicationRepository applicationRepository,
            ApplicationReviewRepository reviewRepository,
            ApplicationStatusHistoryRepository historyRepository,
            HelsbOfficerRepository officerRepository,
            VeriscreenCallbackClient callbackClient) {
        this.applicationRepository = applicationRepository;
        this.reviewRepository = reviewRepository;
        this.historyRepository = historyRepository;
        this.officerRepository = officerRepository;
        this.callbackClient = callbackClient;
    }

    @Transactional
    public ApplicationDto ingest(SubmitApplicationRequest request) {
        LoanApplication existing = findExisting(request);
        if (existing != null) {
            return toDto(linkFromVeriscreen(existing, request));
        }
        LoanApplication application = new LoanApplication();
        application.setApplicationNumber(preferredNumber(request));
        application.setVeriscreenApplicationId(request.getVeriscreenApplicationId());
        application.setStudentId(request.getStudentId());
        application.setStudentName(request.getStudentName());
        application.setNrc(request.getNrc());
        application.setProgramme(request.getProgramme());
        application.setFaculty(request.getFaculty());
        applyPlacement(application, request.getFaculty(), request.getProgramme());
        application.setScreeningPercent(application.getScreeningPercent() == null ? 50 : application.getScreeningPercent());
        application.setScreeningApproved(false);
        application.setStatus(PENDING);
        application.setDocumentIds(request.getDocumentIds() == null ? "" : String.join(",", request.getDocumentIds()));
        application.setNotes(request.getNotes());
        application.setSubmittedAt(Instant.now());
        LoanApplication saved = applicationRepository.save(application);
        recordHistory(saved, null, PENDING, "VeriScreen", "Application received from VeriScreen");
        return toDto(saved);
    }

    private LoanApplication findExisting(SubmitApplicationRequest request) {
        if (request.getVeriscreenApplicationId() != null) {
            var byVeriscreen = applicationRepository.findByVeriscreenApplicationId(request.getVeriscreenApplicationId());
            if (byVeriscreen.isPresent()) {
                return byVeriscreen.get();
            }
        }
        if (request.getApplicationNumber() != null && !request.getApplicationNumber().isBlank()) {
            var byNumber = applicationRepository.findByApplicationNumber(request.getApplicationNumber());
            if (byNumber.isPresent()) {
                return byNumber.get();
            }
        }
        if (request.getStudentId() == null || request.getStudentId().isBlank()) {
            return null;
        }
        return applicationRepository.findByStudentIdOrderBySubmittedAtDesc(request.getStudentId()).stream()
                .filter(app -> app.getVeriscreenApplicationId() == null
                        || request.getVeriscreenApplicationId() == null
                        || request.getVeriscreenApplicationId().equals(app.getVeriscreenApplicationId()))
                .findFirst()
                .orElse(null);
    }

    private LoanApplication linkFromVeriscreen(LoanApplication application, SubmitApplicationRequest request) {
        if (request.getVeriscreenApplicationId() != null) {
            application.setVeriscreenApplicationId(request.getVeriscreenApplicationId());
        }
        if (isBlank(application.getStudentName()) && !isBlank(request.getStudentName())) {
            application.setStudentName(request.getStudentName());
        }
        if (isBlank(application.getNrc()) && !isBlank(request.getNrc())) {
            application.setNrc(request.getNrc());
        }
        if (!isBlank(request.getProgramme())) {
            application.setProgramme(request.getProgramme());
        }
        if (!isBlank(request.getFaculty())) {
            application.setFaculty(request.getFaculty());
        }
        applyPlacement(application, application.getFaculty(), application.getProgramme());
        if (request.getDocumentIds() != null && !request.getDocumentIds().isEmpty()) {
            application.setDocumentIds(String.join(",", request.getDocumentIds()));
        }
        if (!isBlank(request.getNotes()) && isBlank(application.getNotes())) {
            application.setNotes(request.getNotes());
        }
        return applicationRepository.save(application);
    }

    private String preferredNumber(SubmitApplicationRequest request) {
        if (!isBlank(request.getApplicationNumber())
                && applicationRepository.findByApplicationNumber(request.getApplicationNumber()).isEmpty()) {
            return request.getApplicationNumber();
        }
        return nextNumber();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> list(String status, String search) {
        String needle = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        return applicationRepository.findAll().stream()
                .filter(app -> status == null || status.isBlank() || status.equalsIgnoreCase(app.getStatus()))
                .filter(app -> needle.isBlank()
                        || contains(app.getStudentId(), needle)
                        || contains(app.getStudentName(), needle)
                        || contains(app.getApplicationNumber(), needle)
                        || contains(app.getProgramme(), needle))
                .sorted((a, b) -> {
                    Instant left = a.getSubmittedAt() == null ? Instant.EPOCH : a.getSubmittedAt();
                    Instant right = b.getSubmittedAt() == null ? Instant.EPOCH : b.getSubmittedAt();
                    return right.compareTo(left);
                })
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ApplicationDetailDto get(Long id, boolean startReview) {
        LoanApplication application = require(id);
        if (startReview && PENDING.equals(application.getStatus())) {
            changeStatus(application, UNDER_REVIEW, "system", "Opened for screening");
        }
        return ApplicationDetailDto.builder()
                .application(toDto(application))
                .history(historyRepository.findByApplication_IdOrderByChangedAtAsc(id).stream()
                        .map(this::toHistory)
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> listForStudent(String studentId) {
        return applicationRepository.findByStudentIdOrderBySubmittedAtDesc(studentId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ApplicationDto confirm(Long id, String officerUsername, String comment) {
        return decide(id, officerUsername, CONFIRMED, comment);
    }

    @Transactional
    public ApplicationDto approveScreening(Long id, String officerUsername, String comment) {
        LoanApplication application = require(id);
        application.setScreeningApproved(true);
        applicationRepository.save(application);
        if (CONFIRMED.equals(application.getStatus()) || REJECTED.equals(application.getStatus())) {
            return toDto(application);
        }
        String note = comment == null || comment.isBlank()
                ? "Screening request approved"
                : comment;
        return decide(id, officerUsername, CONFIRMED, note);
    }

    @Transactional
    public ApplicationDto reject(Long id, String officerUsername, String comment) {
        if (comment == null || comment.isBlank()) {
            throw new InvalidRequestException("A reason is required when rejecting an application");
        }
        return decide(id, officerUsername, REJECTED, comment);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto stats() {
        return DashboardStatsDto.builder()
                .totalApplications(applicationRepository.count())
                .pendingApplications(applicationRepository.countByStatus(PENDING))
                .underReviewApplications(applicationRepository.countByStatus(UNDER_REVIEW))
                .confirmedApplications(applicationRepository.countByStatus(CONFIRMED))
                .rejectedApplications(applicationRepository.countByStatus(REJECTED))
                .build();
    }

    private ApplicationDto decide(Long id, String officerUsername, String status, String comment) {
        LoanApplication application = require(id);
        if (CONFIRMED.equals(application.getStatus()) || REJECTED.equals(application.getStatus())) {
            throw new InvalidRequestException("This application has already been decided");
        }
        HelsbOfficer officer = officerRepository.findByUsername(officerUsername)
                .or(() -> officerRepository.findByUsernameIgnoreCase(officerUsername))
                .orElse(null);
        String from = application.getStatus();
        application.setStatus(status);
        application.setNotes(comment);
        application.setReviewedAt(Instant.now());
        application.setReviewedBy(officer != null ? officer.getFullName() : officerUsername);
        applicationRepository.save(application);

        ApplicationReview review = new ApplicationReview();
        review.setApplication(application);
        review.setOfficer(officer);
        review.setDecision(status);
        review.setComment(comment);
        review.setCreatedAt(Instant.now());
        reviewRepository.save(review);
        recordHistory(application, from, status, officerUsername, comment);

        callbackClient.notifyDecision(new VeriscreenDecisionPayload(
                application.getVeriscreenApplicationId(),
                application.getApplicationNumber(),
                application.getStudentId(),
                status,
                comment));
        return toDto(application);
    }

    private void changeStatus(LoanApplication application, String toStatus, String actor, String comment) {
        String from = application.getStatus();
        if (toStatus.equals(from)) {
            return;
        }
        application.setStatus(toStatus);
        applicationRepository.save(application);
        recordHistory(application, from, toStatus, actor, comment);
        callbackClient.notifyDecision(new VeriscreenDecisionPayload(
                application.getVeriscreenApplicationId(),
                application.getApplicationNumber(),
                application.getStudentId(),
                toStatus,
                comment));
    }

    private void recordHistory(LoanApplication application, String from, String to, String actor, String comment) {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        history.setApplication(application);
        history.setFromStatus(from);
        history.setToStatus(to);
        history.setChangedBy(actor);
        history.setComment(comment);
        history.setChangedAt(Instant.now());
        historyRepository.save(history);
    }

    private LoanApplication require(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }

    private String nextNumber() {
        int next = sequence.incrementAndGet() + (int) applicationRepository.count();
        return "HELSB-" + Year.now().getValue() + "-" + String.format("%06d", next);
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    public ApplicationDto toPublicDto(LoanApplication application) {
        return toDto(application);
    }

    private void applyPlacement(LoanApplication application, String faculty, String programme) {
        InstitutionCatalog.Placement placement = InstitutionCatalog.place(faculty, programme);
        application.setUniversityCode(placement.universityCode());
        application.setSchoolCode(placement.schoolCode());
        application.setSchoolName(placement.schoolName());
        if (application.getProgramme() == null || application.getProgramme().isBlank()) {
            application.setProgramme(placement.programme());
        }
        if (application.getFaculty() == null || application.getFaculty().isBlank()) {
            application.setFaculty(placement.schoolName());
        }
    }

    private ApplicationDto toDto(LoanApplication application) {
        List<String> docs = application.getDocumentIds() == null || application.getDocumentIds().isBlank()
                ? List.of()
                : Arrays.stream(application.getDocumentIds().split(","))
                        .map(String::trim)
                        .filter(value -> !value.isBlank())
                        .toList();
        return ApplicationDto.builder()
                .id(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .veriscreenApplicationId(application.getVeriscreenApplicationId())
                .studentId(application.getStudentId())
                .studentName(application.getStudentName())
                .nrc(application.getNrc())
                .programme(application.getProgramme())
                .faculty(application.getFaculty())
                .universityCode(application.getUniversityCode())
                .schoolCode(application.getSchoolCode())
                .schoolName(application.getSchoolName())
                .screeningPercent(application.getScreeningPercent())
                .screeningApproved(Boolean.TRUE.equals(application.getScreeningApproved()))
                .status(application.getStatus())
                .documentIds(docs)
                .notes(application.getNotes())
                .submittedAt(application.getSubmittedAt())
                .reviewedAt(application.getReviewedAt())
                .reviewedBy(application.getReviewedBy())
                .build();
    }

    private StatusHistoryDto toHistory(ApplicationStatusHistory history) {
        return StatusHistoryDto.builder()
                .id(history.getId())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .changedBy(history.getChangedBy())
                .comment(history.getComment())
                .changedAt(history.getChangedAt())
                .build();
    }
}
