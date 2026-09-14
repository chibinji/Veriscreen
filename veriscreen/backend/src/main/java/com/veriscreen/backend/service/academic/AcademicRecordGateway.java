package com.veriscreen.backend.service.academic;

import com.veriscreen.backend.entity.AcademicResult;
import com.veriscreen.backend.entity.Examination;
import com.veriscreen.backend.entity.Fee;
import com.veriscreen.backend.entity.Registration;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.integration.sis.SisClient;
import com.veriscreen.backend.integration.sis.SisModels;
import com.veriscreen.backend.repository.AcademicResultRepository;
import com.veriscreen.backend.repository.ExaminationRepository;
import com.veriscreen.backend.repository.FeeRepository;
import com.veriscreen.backend.repository.RegistrationRepository;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AcademicRecordGateway {

    private final SisClient sisClient;
    private final RegistrationRepository registrationRepository;
    private final AcademicResultRepository academicResultRepository;
    private final ExaminationRepository examinationRepository;
    private final FeeRepository feeRepository;

    public AcademicRecordGateway(
            SisClient sisClient,
            RegistrationRepository registrationRepository,
            AcademicResultRepository academicResultRepository,
            ExaminationRepository examinationRepository,
            FeeRepository feeRepository) {
        this.sisClient = sisClient;
        this.registrationRepository = registrationRepository;
        this.academicResultRepository = academicResultRepository;
        this.examinationRepository = examinationRepository;
        this.feeRepository = feeRepository;
    }

    public Optional<SisModels.Student> fetchAuthoritativeStudent(String studentId) {
        return sisClient.getStudent(studentId);
    }

    public List<Registration> registrations(String studentId) {
        List<SisModels.Registration> remote = sisClient.getRegistrations(studentId);
        if (!remote.isEmpty()) {
            return remote.stream().map(this::toRegistration).toList();
        }
        return registrationRepository.findByStudent_Id(studentId);
    }

    public List<AcademicResult> results(String studentId) {
        List<SisModels.Result> remote = sisClient.getResults(studentId);
        if (!remote.isEmpty()) {
            return remote.stream().map(this::toResult).toList();
        }
        return academicResultRepository.findByStudent_Id(studentId);
    }

    public List<Examination> examinations(String studentId) {
        List<SisModels.Examination> remote = sisClient.getExaminations(studentId);
        if (!remote.isEmpty()) {
            return remote.stream().map(this::toExamination).toList();
        }
        return examinationRepository.findByStudent_Id(studentId);
    }

    public List<Fee> fees(String studentId) {
        List<SisModels.Payment> remote = sisClient.getPayments(studentId);
        if (!remote.isEmpty()) {
            return remote.stream().map(this::toFee).toList();
        }
        return feeRepository.findByStudent_Id(studentId);
    }

    public void overlayStudent(Student student, SisModels.Student remote) {
        if (remote.getName() != null && !remote.getName().isBlank()) {
            student.setName(remote.getName());
        }
        if (remote.getNrc() != null) {
            student.setNrc(remote.getNrc());
        }
        if (remote.getProgram() != null) {
            student.setProgram(remote.getProgram());
        }
        if (remote.getFaculty() != null) {
            student.setFaculty(remote.getFaculty());
        }
        if (remote.getEnrollmentYear() != null) {
            student.setEnrollmentYear(remote.getEnrollmentYear());
        }
    }

    private Registration toRegistration(SisModels.Registration dto) {
        Registration registration = new Registration();
        registration.setId(dto.getId());
        registration.setAcademicYear(dto.getAcademicYear());
        registration.setSemester(dto.getSemester());
        registration.setConfirmed(dto.getConfirmed());
        registration.setRegistrationDate(dto.getRegistrationDate());
        return registration;
    }

    private AcademicResult toResult(SisModels.Result dto) {
        AcademicResult result = new AcademicResult();
        result.setId(dto.getId());
        result.setCourseCode(dto.getCourseCode());
        result.setCourseName(dto.getCourseName());
        result.setGrade(dto.getGrade());
        result.setCredits(dto.getCredits());
        result.setAcademicYear(dto.getAcademicYear());
        return result;
    }

    private Examination toExamination(SisModels.Examination dto) {
        Examination examination = new Examination();
        examination.setId(dto.getId());
        examination.setAcademicYear(dto.getAcademicYear());
        examination.setEligible(dto.getEligible());
        examination.setStatus(dto.getStatus());
        return examination;
    }

    private Fee toFee(SisModels.Payment dto) {
        Fee fee = new Fee();
        fee.setId(dto.getId());
        fee.setPaymentDate(dto.getPaymentDate());
        fee.setAmount(dto.getAmount());
        fee.setReceiptNo(dto.getReceiptNo());
        fee.setOutstandingBalance(dto.getOutstandingBalance());
        fee.setDescription(dto.getDescription());
        return fee;
    }
}
