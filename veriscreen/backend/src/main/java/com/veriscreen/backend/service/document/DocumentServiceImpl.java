package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;
<<<<<<< HEAD:veriscreen/backend/src/main/java/com/veriscreen/backend/service/document/DocumentServiceImpl.java
import com.veriscreen.backend.dto.DocumentVerificationResponse;
import com.veriscreen.backend.dto.GeneratedDocumentResponse;
import com.veriscreen.backend.entity.AcademicResult;
import com.veriscreen.backend.entity.Examination;
import com.veriscreen.backend.entity.Fee;
import com.veriscreen.backend.entity.IssuedDocument;
import com.veriscreen.backend.entity.IssuedDocumentStatus;
import com.veriscreen.backend.entity.OfficialDocumentType;
import com.veriscreen.backend.entity.Registration;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.exception.OwnershipViolationException;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import com.veriscreen.backend.repository.IssuedDocumentRepository;
import com.veriscreen.backend.repository.StudentRepository;
import com.veriscreen.backend.service.academic.AcademicRecordGateway;
import com.veriscreen.backend.service.security.StudentAccessValidator;
import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
=======
import com.veriscreen.backend.service.security.StudentAccessValidator;
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:backend/src/main/java/com/veriscreen/backend/service/document/DocumentServiceImpl.java
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DocumentServiceImpl implements DocumentService {

    private final List<DocumentGenerator> documentGenerators;
    private final StudentAccessValidator accessValidator;
<<<<<<< HEAD:veriscreen/backend/src/main/java/com/veriscreen/backend/service/document/DocumentServiceImpl.java
    private final StudentRepository studentRepository;
    private final AcademicRecordGateway academicRecordGateway;
    private final IssuedDocumentRepository issuedDocumentRepository;
    private final DocumentIdService documentIdService;
    private final OfficialPdfService officialPdfService;
    private final DocumentStorageService documentStorageService;
    private final DocumentHashService documentHashService;
    private final String publicBaseUrl;

    public DocumentServiceImpl(
            List<DocumentGenerator> documentGenerators,
            StudentAccessValidator accessValidator,
            StudentRepository studentRepository,
            AcademicRecordGateway academicRecordGateway,
            IssuedDocumentRepository issuedDocumentRepository,
            DocumentIdService documentIdService,
            OfficialPdfService officialPdfService,
            DocumentStorageService documentStorageService,
            DocumentHashService documentHashService,
            @Value("${veriscreen.public-base-url:http://localhost:8080}") String publicBaseUrl) {
        this.documentGenerators = documentGenerators;
        this.accessValidator = accessValidator;
        this.studentRepository = studentRepository;
        this.academicRecordGateway = academicRecordGateway;
        this.issuedDocumentRepository = issuedDocumentRepository;
        this.documentIdService = documentIdService;
        this.officialPdfService = officialPdfService;
        this.documentStorageService = documentStorageService;
        this.documentHashService = documentHashService;
        this.publicBaseUrl = trimTrailingSlash(publicBaseUrl);
=======

    public DocumentServiceImpl(List<DocumentGenerator> documentGenerators, StudentAccessValidator accessValidator) {
        this.documentGenerators = documentGenerators;
        this.accessValidator = accessValidator;
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:backend/src/main/java/com/veriscreen/backend/service/document/DocumentServiceImpl.java
    }

    @Override
    public List<DocumentDto> listDocumentsForCurrentStudent(String authenticatedStudentId) {
        return listDocumentsForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    public List<DocumentDto> listDocumentsForStudent(String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        Map<OfficialDocumentType, IssuedDocument> latestIssued = new LinkedHashMap<>();
        for (IssuedDocument issued : issuedDocumentRepository.findByStudent_IdOrderByGeneratedAtDesc(requestedStudentId)) {
            latestIssued.putIfAbsent(issued.getDocumentType(), issued);
        }
        if (!latestIssued.isEmpty()) {
            List<DocumentDto> documents = new ArrayList<>();
            for (OfficialDocumentType type : OfficialDocumentType.values()) {
                IssuedDocument issued = latestIssued.get(type);
                if (issued != null) {
                    documents.add(DocumentDto.builder()
                            .type(type.getTitle())
                            .documentId(issued.getDocumentId())
                            .summary("Official " + type.getTitle() + " · " + issued.getDocumentId())
                            .generatedDate(issued.getGeneratedAt() == null ? null : issued.getGeneratedAt().toString())
                            .url(publicBaseUrl + "/api/verify/" + issued.getDocumentId())
                            .build());
                } else {
                    documents.add(DocumentDto.builder()
                            .type(type.getTitle())
                            .summary("Generate this document on the Documents page before submitting to HELSB.")
                            .build());
                }
            }
            return documents;
        }
        log.debug("Generating {} document(s) for student id={}", documentGenerators.size(), requestedStudentId);
        return documentGenerators.stream()
                .map(generator -> generator.generate(requestedStudentId))
                .toList();
    }
<<<<<<< HEAD:veriscreen/backend/src/main/java/com/veriscreen/backend/service/document/DocumentServiceImpl.java

    @Override
    @Transactional
    public GeneratedDocumentResponse generateOfficialDocument(
            String authenticatedStudentId, OfficialDocumentType type) {
        Student student = requireStudent(authenticatedStudentId);
        String documentId = documentIdService.nextDocumentId(type);
        String verificationUrl = publicBaseUrl + "/api/verify/" + documentId;
        byte[] pdf = renderPdf(type, student, documentId, verificationUrl);
        String hash = documentHashService.sha256(pdf);
        String filePath = documentStorageService.store(type, documentId, pdf);

        IssuedDocument issued = new IssuedDocument();
        issued.setDocumentId(documentId);
        issued.setStudent(student);
        issued.setDocumentType(type);
        issued.setGeneratedAt(Instant.now());
        issued.setStatus(IssuedDocumentStatus.VALID);
        issued.setFilePath(filePath);
        issued.setSha256Hash(hash);
        issuedDocumentRepository.save(issued);

        log.info("Issued official document {} ({}) for student {}", documentId, type, student.getId());
        return GeneratedDocumentResponse.builder()
                .documentId(documentId)
                .documentType(type.name())
                .status(issued.getStatus().name())
                .generatedAt(issued.getGeneratedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadOfficialDocument(String authenticatedStudentId, String documentId) {
        IssuedDocument issued = issuedDocumentRepository.findByDocumentIdWithStudent(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        if (!issued.getStudent().getId().equals(authenticatedStudentId)) {
            throw new OwnershipViolationException("Access denied to another student's document");
        }
        return documentStorageService.read(issued.getFilePath());
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentVerificationResponse verify(String documentId) {
        if (documentId == null || documentId.isBlank()) {
            return invalid(documentId);
        }

        return issuedDocumentRepository.findByDocumentId(documentId.trim())
                .map(this::toVerificationResponse)
                .orElseGet(() -> invalid(documentId.trim()));
    }

    private DocumentVerificationResponse toVerificationResponse(IssuedDocument issued) {
        if (issued.getStatus() == IssuedDocumentStatus.REVOKED) {
            return DocumentVerificationResponse.builder()
                    .valid(false)
                    .documentId(issued.getDocumentId())
                    .documentType(issued.getDocumentType().name())
                    .status(IssuedDocumentStatus.REVOKED.name())
                    .build();
        }

        boolean integrityOk = verifyStoredHash(issued);
        IssuedDocumentStatus status = integrityOk ? IssuedDocumentStatus.VALID : IssuedDocumentStatus.INVALID;
        return DocumentVerificationResponse.builder()
                .valid(integrityOk && issued.getStatus() == IssuedDocumentStatus.VALID)
                .documentId(issued.getDocumentId())
                .documentType(issued.getDocumentType().name())
                .status(status.name())
                .build();
    }

    private boolean verifyStoredHash(IssuedDocument issued) {
        try {
            byte[] stored = documentStorageService.read(issued.getFilePath());
            return documentHashService.matches(stored, issued.getSha256Hash());
        } catch (Exception ex) {
            log.warn("Integrity check failed for {}", issued.getDocumentId(), ex);
            return false;
        }
    }

    private DocumentVerificationResponse invalid(String documentId) {
        return DocumentVerificationResponse.builder()
                .valid(false)
                .documentId(documentId)
                .status(IssuedDocumentStatus.INVALID.name())
                .build();
    }

    private byte[] renderPdf(
            OfficialDocumentType type, Student student, String documentId, String verificationUrl) {
        academicRecordGateway.fetchAuthoritativeStudent(student.getId())
                .ifPresent(remote -> academicRecordGateway.overlayStudent(student, remote));
        String studentId = student.getId();
        List<Registration> registrations = academicRecordGateway.registrations(studentId);
        String academicYear = currentAcademicYear(studentId, registrations);
        String yearOfStudy = yearOfStudy(student);
        return switch (type) {
            case CONFIRMATION_SLIP -> {
                List<AcademicResult> results = academicRecordGateway.results(studentId);
                yield officialPdfService.renderConfirmationSlip(
                        student, registrations, results, academicYear, yearOfStudy, documentId, verificationUrl);
            }
            case RESULTS -> {
                List<AcademicResult> results = academicRecordGateway.results(studentId);
                yield officialPdfService.renderAcademicResults(
                        student, results, academicYear, yearOfStudy, documentId, verificationUrl);
            }
            case EXAMINATION_SLIP -> {
                List<Examination> examinations = academicRecordGateway.examinations(studentId);
                List<AcademicResult> results = academicRecordGateway.results(studentId);
                yield officialPdfService.renderExaminationSlip(
                        student, examinations, results, academicYear, yearOfStudy, documentId, verificationUrl);
            }
            case PAYMENT_HISTORY -> {
                List<Fee> fees = academicRecordGateway.fees(studentId);
                yield officialPdfService.renderPaymentHistory(
                        student, fees, academicYear, yearOfStudy, documentId, verificationUrl);
            }
        };
    }

    private String currentAcademicYear(String studentId, List<Registration> registrations) {
        return registrations.stream()
                .max(Comparator.comparing(Registration::getRegistrationDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(Registration::getAcademicYear)
                .filter(value -> value != null && !value.isBlank())
                .orElseGet(() -> academicRecordGateway.examinations(studentId).stream()
                        .map(Examination::getAcademicYear)
                        .filter(value -> value != null && !value.isBlank())
                        .max(String::compareTo)
                        .orElse(null));
    }

    private String yearOfStudy(Student student) {
        if (student.getEnrollmentYear() == null) {
            return null;
        }
        int computed = Year.now().getValue() - student.getEnrollmentYear() + 1;
        return String.valueOf(Math.max(1, Math.min(computed, 8)));
    }

    private Student requireStudent(String studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:8080";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
=======
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:backend/src/main/java/com/veriscreen/backend/service/document/DocumentServiceImpl.java
}
