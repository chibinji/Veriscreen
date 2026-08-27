package com.veriscreen.backend.service.screening;

import com.veriscreen.backend.dto.AcademicResultDto;
import com.veriscreen.backend.dto.ExaminationDto;
import com.veriscreen.backend.dto.FeeDto;
import com.veriscreen.backend.dto.HelsbApplicationDto;
import com.veriscreen.backend.dto.RegistrationDto;
import com.veriscreen.backend.entity.HelsbApplication;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import com.veriscreen.backend.mapper.ScreeningMapper;
import com.veriscreen.backend.repository.AcademicResultRepository;
import com.veriscreen.backend.repository.ExaminationRepository;
import com.veriscreen.backend.repository.FeeRepository;
import com.veriscreen.backend.repository.HelsbApplicationRepository;
import com.veriscreen.backend.repository.RegistrationRepository;
import com.veriscreen.backend.repository.StudentRepository;
import com.veriscreen.backend.service.security.StudentAccessValidator;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class StudentScreeningServiceImpl implements StudentScreeningService {

    private final RegistrationRepository registrationRepository;
    private final FeeRepository feeRepository;
    private final ExaminationRepository examinationRepository;
    private final AcademicResultRepository academicResultRepository;
    private static final Set<String> OPEN_STATUSES = Set.of("PENDING", "UNDER_REVIEW");

    private final HelsbApplicationRepository helsbApplicationRepository;
    private final StudentRepository studentRepository;
    private final StudentAccessValidator accessValidator;

    public StudentScreeningServiceImpl(
            RegistrationRepository registrationRepository,
            FeeRepository feeRepository,
            ExaminationRepository examinationRepository,
            AcademicResultRepository academicResultRepository,
            HelsbApplicationRepository helsbApplicationRepository,
            StudentRepository studentRepository,
            StudentAccessValidator accessValidator) {
        this.registrationRepository = registrationRepository;
        this.feeRepository = feeRepository;
        this.examinationRepository = examinationRepository;
        this.academicResultRepository = academicResultRepository;
        this.helsbApplicationRepository = helsbApplicationRepository;
        this.studentRepository = studentRepository;
        this.accessValidator = accessValidator;
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
        log.debug("Loading registrations for student id={}", requestedStudentId);
        return registrationRepository.findByStudent_Id(requestedStudentId).stream()
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
        log.debug("Loading fees for student id={}", requestedStudentId);
        return feeRepository.findByStudent_Id(requestedStudentId).stream()
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
        log.debug("Loading examinations for student id={}", requestedStudentId);
        return examinationRepository.findByStudent_Id(requestedStudentId).stream()
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
        log.debug("Loading academic results for student id={}", requestedStudentId);
        return academicResultRepository.findByStudent_Id(requestedStudentId).stream()
                .map(ScreeningMapper::toAcademicResultDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HelsbApplicationDto> listHelsbApplications(String authenticatedStudentId) {
        return listHelsbApplicationsForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HelsbApplicationDto> listHelsbApplicationsForStudent(
            String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        log.debug("Loading HELSB applications for student id={}", requestedStudentId);
        return helsbApplicationRepository.findByStudent_Id(requestedStudentId).stream()
                .map(ScreeningMapper::toHelsbApplicationDto)
                .toList();
    }

    @Override
    @Transactional
    public HelsbApplicationDto submitHelsbApplication(String authenticatedStudentId, List<String> documentIds) {
        Student student = studentRepository.findById(authenticatedStudentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + authenticatedStudentId));

        return helsbApplicationRepository
                .findFirstByStudent_IdAndApplicationStatusInOrderByIdDesc(authenticatedStudentId, OPEN_STATUSES)
                .map(existing -> {
                    log.debug("Returning existing HELSB submission id={} for student {}", existing.getId(), authenticatedStudentId);
                    return ScreeningMapper.toHelsbApplicationDto(existing);
                })
                .orElseGet(() -> {
                    HelsbApplication application = new HelsbApplication();
                    application.setStudent(student);
                    application.setApplicationStatus("UNDER_REVIEW");
                    application.setPaymentStatus("PENDING");
                    application.setScreeningResult("PENDING");
                    application.setContractDetails(submissionNote(documentIds));
                    HelsbApplication saved = helsbApplicationRepository.save(application);
                    log.info("Submitted HELSB application id={} for student {}", saved.getId(), authenticatedStudentId);
                    return ScreeningMapper.toHelsbApplicationDto(saved);
                });
    }

    private String submissionNote(List<String> documentIds) {
        if (documentIds == null || documentIds.isEmpty()) {
            return "Official documents submitted. Waiting for HELSB verification and approval.";
        }
        return "Official documents submitted: " + String.join(", ", documentIds)
                + ". Waiting for HELSB verification and approval.";
    }
}
