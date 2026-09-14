package com.veriscreen.backend.service.screening;

import com.veriscreen.backend.dto.AcademicResultDto;
import com.veriscreen.backend.dto.ExaminationDto;
import com.veriscreen.backend.dto.FeeDto;
import com.veriscreen.backend.dto.HelsbApplicationDto;
import com.veriscreen.backend.dto.HelsbSubmitRequest;
import com.veriscreen.backend.dto.RegistrationDto;
import com.veriscreen.backend.entity.HelsbApplication;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.exception.InvalidRequestException;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import com.veriscreen.backend.integration.helsb.HelsbBridge;
import com.veriscreen.backend.integration.helsb.HelsbClient;
import com.veriscreen.backend.integration.helsb.HelsbModels;
import com.veriscreen.backend.integration.sis.SisModels;
import com.veriscreen.backend.mapper.ScreeningMapper;
import com.veriscreen.backend.repository.HelsbApplicationRepository;
import com.veriscreen.backend.repository.StudentRepository;
import com.veriscreen.backend.service.academic.AcademicRecordGateway;
import com.veriscreen.backend.service.document.HelsbContractPdfService;
import com.veriscreen.backend.service.notify.NotificationService;
import com.veriscreen.backend.service.security.StudentAccessValidator;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class StudentScreeningServiceImpl implements StudentScreeningService {

    private static final Set<String> OPEN_STATUSES = Set.of("PENDING", "UNDER_REVIEW");

    private final AcademicRecordGateway academicRecordGateway;
    private final HelsbApplicationRepository helsbApplicationRepository;
    private final StudentRepository studentRepository;
    private final StudentAccessValidator accessValidator;
    private final HelsbClient helsbClient;
    private final HelsbBridge helsbBridge;
    private final NotificationService notificationService;
    private final HelsbContractPdfService contractPdfService;

    public StudentScreeningServiceImpl(
            AcademicRecordGateway academicRecordGateway,
            HelsbApplicationRepository helsbApplicationRepository,
            StudentRepository studentRepository,
            StudentAccessValidator accessValidator,
            HelsbClient helsbClient,
            HelsbBridge helsbBridge,
            NotificationService notificationService,
            HelsbContractPdfService contractPdfService) {
        this.academicRecordGateway = academicRecordGateway;
        this.helsbApplicationRepository = helsbApplicationRepository;
        this.studentRepository = studentRepository;
        this.accessValidator = accessValidator;
        this.helsbClient = helsbClient;
        this.helsbBridge = helsbBridge;
        this.notificationService = notificationService;
        this.contractPdfService = contractPdfService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationDto> listRegistrations(String authenticatedStudentId) {
        return listRegistrationsForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrationDto> listRegistrationsForStudent(
            String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        return academicRecordGateway.registrations(requestedStudentId).stream()
                .map(ScreeningMapper::toRegistrationDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeDto> listFees(String authenticatedStudentId) {
        return listFeesForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeDto> listFeesForStudent(String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        return academicRecordGateway.fees(requestedStudentId).stream()
                .map(ScreeningMapper::toFeeDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExaminationDto> listExaminations(String authenticatedStudentId) {
        return listExaminationsForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExaminationDto> listExaminationsForStudent(
            String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        return academicRecordGateway.examinations(requestedStudentId).stream()
                .map(ScreeningMapper::toExaminationDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicResultDto> listAcademicResults(String authenticatedStudentId) {
        return listAcademicResultsForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicResultDto> listAcademicResultsForStudent(
            String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        return academicRecordGateway.results(requestedStudentId).stream()
                .map(ScreeningMapper::toAcademicResultDto)
                .toList();
    }

    @Override
    @Transactional
    public List<HelsbApplicationDto> listHelsbApplications(String authenticatedStudentId) {
        return listHelsbApplicationsForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    @Transactional
    public List<HelsbApplicationDto> listHelsbApplicationsForStudent(
            String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        syncFromHelsb(requestedStudentId);
        return helsbApplicationRepository.findByStudent_Id(requestedStudentId).stream()
                .map(ScreeningMapper::toHelsbApplicationDto)
                .toList();
    }

    @Override
    @Transactional
    public HelsbApplicationDto submitHelsbApplication(String authenticatedStudentId, HelsbSubmitRequest request) {
        Student student = studentRepository.findById(authenticatedStudentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + authenticatedStudentId));
        HelsbSubmitRequest payload = request == null ? new HelsbSubmitRequest() : request;
        if (payload.getMobileMoneyPhone() == null || payload.getMobileMoneyPhone().isBlank()
                || payload.getMobileMoneyProvider() == null || payload.getMobileMoneyProvider().isBlank()) {
            throw new InvalidRequestException("Enter a mobile money phone number and network provider before submitting.");
        }

        return helsbApplicationRepository
                .findFirstByStudent_IdAndApplicationStatusInOrderByIdDesc(authenticatedStudentId, OPEN_STATUSES)
                .map(ScreeningMapper::toHelsbApplicationDto)
                .orElseGet(() -> createAndForward(student, payload));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadContract(String authenticatedStudentId, Long applicationId) {
        HelsbApplication application = requireOwnApplication(authenticatedStudentId, applicationId);
        String status = ScreeningMapper.normalizeStatus(application.getApplicationStatus());
        if (!"APPROVED".equals(status) && !"CONTRACT_GENERATED".equals(status) && !"COMPLETED".equals(status)) {
            throw new InvalidRequestException("The loan contract is available after HELSB approval.");
        }
        return contractPdfService.render(application.getStudent(), application);
    }

    @Override
    @Transactional
    public HelsbApplicationDto emailContract(String authenticatedStudentId, Long applicationId) {
        HelsbApplication application = requireOwnApplication(authenticatedStudentId, applicationId);
        Student student = application.getStudent();
        application.setContractEmailed(true);
        helsbApplicationRepository.save(application);
        notificationService.notifySmsAndEmail(
                student,
                "HELSB loan contract",
                "Your HELSB student loan contract (" + application.getApplicationNumber()
                        + ") has been emailed to you as a PDF. Download it from the HELSB page as well.",
                "SUCCESS",
                "/student/applications");
        return ScreeningMapper.toHelsbApplicationDto(application);
    }

    public void notifyApproval(HelsbApplication application) {
        Student student = application.getStudent();
        notificationService.notifySmsAndEmail(
                student,
                "HELSB application approved",
                "Your HELSB screening has been approved. Loan number "
                        + application.getApplicationNumber()
                        + ". Download your contract from the HELSB page.",
                "SUCCESS",
                "/student/applications");
    }

    private HelsbApplicationDto createAndForward(Student student, HelsbSubmitRequest request) {
        List<String> documentIds = request.getDocumentIds();
        SisModels.Student remote = academicRecordGateway.fetchAuthoritativeStudent(student.getId()).orElse(null);
        if (remote != null) {
            academicRecordGateway.overlayStudent(student, remote);
        }

        HelsbApplication application = new HelsbApplication();
        application.setStudent(student);
        application.setApplicationStatus("UNDER_REVIEW");
        application.setPaymentStatus("PENDING");
        application.setScreeningResult("PENDING");
        application.setLoanPercent(50);
        application.setMobileMoneyPhone(request.getMobileMoneyPhone().trim());
        application.setMobileMoneyProvider(request.getMobileMoneyProvider().trim());
        application.setSubmittedDocumentIds(documentIds == null ? "" : String.join(",", documentIds));
        application.setContractDetails(submissionNote(documentIds));
        application.setNotes(submissionNote(documentIds));
        application.setSubmittedAt(Instant.now());
        HelsbApplication saved = helsbApplicationRepository.save(application);

        helsbBridge.publish(saved);
        if (saved.getApplicationNumber() == null) {
            saved.setApplicationNumber("VS-HELSB-" + saved.getId());
            helsbApplicationRepository.save(saved);
        }
        notificationService.notifySmsAndEmail(
                student,
                "HELSB application submitted",
                "Your documents were submitted to HELSB. Status: awaiting approval. Loan number "
                        + saved.getApplicationNumber() + ".",
                "INFO",
                "/student/applications");
        log.info("Submitted HELSB application id={} for student {}", saved.getId(), student.getId());
        return ScreeningMapper.toHelsbApplicationDto(saved);
    }

    private void syncFromHelsb(String studentId) {
        List<HelsbModels.Application> remote = helsbClient.listForStudent(studentId);
        for (HelsbModels.Application item : remote) {
            HelsbApplication local = null;
            if (item.getVeriscreenApplicationId() != null) {
                local = helsbApplicationRepository.findById(item.getVeriscreenApplicationId()).orElse(null);
            }
            if (local == null && item.getApplicationNumber() != null) {
                local = helsbApplicationRepository.findByApplicationNumber(item.getApplicationNumber()).orElse(null);
            }
            if (local == null) {
                continue;
            }
            local.setApplicationNumber(item.getApplicationNumber());
            local.setExternalHelsbId(item.getId());
            if (item.getStatus() != null) {
                String normalized = ScreeningMapper.normalizeStatus(item.getStatus());
                String previous = ScreeningMapper.normalizeStatus(local.getApplicationStatus());
                local.setApplicationStatus(normalized);
                if ("APPROVED".equals(normalized) && !"APPROVED".equals(previous)) {
                    notifyApproval(local);
                }
            }
            if (item.getScreeningPercent() != null) {
                local.setLoanPercent(item.getScreeningPercent());
            }
            if (item.getNotes() != null) {
                local.setNotes(item.getNotes());
                local.setContractDetails(item.getNotes());
            }
            local.setReviewedAt(item.getReviewedAt());
            helsbApplicationRepository.save(local);
        }
    }

    private String submissionNote(List<String> documentIds) {
        if (documentIds == null || documentIds.isEmpty()) {
            return "Official documents submitted. Waiting for HELSB verification and approval.";
        }
        return "Official documents submitted: " + String.join(", ", documentIds)
                + ". Waiting for HELSB verification and approval.";
    }

    private HelsbApplication requireOwnApplication(String studentId, Long applicationId) {
        HelsbApplication application = helsbApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("HELSB application not found"));
        if (!application.getStudent().getId().equals(studentId)) {
            throw new ResourceNotFoundException("HELSB application not found");
        }
        return application;
    }
}
