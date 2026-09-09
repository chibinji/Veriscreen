package com.veriscreen.university.service;

import com.veriscreen.university.dto.AcademicResultDto;
import com.veriscreen.university.dto.ExaminationDto;
import com.veriscreen.university.dto.ExaminationUpdateRequest;
import com.veriscreen.university.dto.FeeDto;
import com.veriscreen.university.dto.FeeUpdateRequest;
import com.veriscreen.university.dto.RegistrationDto;
import com.veriscreen.university.dto.StudentDto;
import com.veriscreen.university.entity.AcademicResult;
import com.veriscreen.university.entity.Examination;
import com.veriscreen.university.entity.Fee;
import com.veriscreen.university.entity.Registration;
import com.veriscreen.university.entity.Student;
import com.veriscreen.university.repository.AcademicResultRepository;
import com.veriscreen.university.repository.ExaminationRepository;
import com.veriscreen.university.repository.FeeRepository;
import com.veriscreen.university.repository.RegistrationRepository;
import com.veriscreen.university.repository.StudentRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SisService {

    private final StudentRepository studentRepository;
    private final RegistrationRepository registrationRepository;
    private final FeeRepository feeRepository;
    private final ExaminationRepository examinationRepository;
    private final AcademicResultRepository academicResultRepository;

    public SisService(
            StudentRepository studentRepository,
            RegistrationRepository registrationRepository,
            FeeRepository feeRepository,
            ExaminationRepository examinationRepository,
            AcademicResultRepository academicResultRepository) {
        this.studentRepository = studentRepository;
        this.registrationRepository = registrationRepository;
        this.feeRepository = feeRepository;
        this.examinationRepository = examinationRepository;
        this.academicResultRepository = academicResultRepository;
    }

    public List<String> listStudentIds() {
        return studentRepository.findAll().stream().map(Student::getId).toList();
    }

    public StudentDto getStudent(String id) {
        return toStudentDto(requireStudent(id));
    }

    public List<RegistrationDto> getRegistrations(String studentId) {
        requireStudent(studentId);
        return registrationRepository.findByStudent_Id(studentId).stream().map(this::toRegistrationDto).toList();
    }

    public List<FeeDto> getFees(String studentId) {
        requireStudent(studentId);
        return feeRepository.findByStudent_Id(studentId).stream().map(this::toFeeDto).toList();
    }

    public List<ExaminationDto> getExaminations(String studentId) {
        requireStudent(studentId);
        return examinationRepository.findByStudent_Id(studentId).stream().map(this::toExaminationDto).toList();
    }

    public List<AcademicResultDto> getAcademicResults(String studentId) {
        requireStudent(studentId);
        return academicResultRepository.findByStudent_Id(studentId).stream().map(this::toResultDto).toList();
    }

    @Transactional
    public FeeDto updateFee(String studentId, Long feeId, FeeUpdateRequest request) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found"));
        if (!fee.getStudent().getId().equals(studentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee not found for student");
        }
        if (request.getOutstandingBalance() != null) {
            fee.setOutstandingBalance(request.getOutstandingBalance());
        }
        if (request.getAmount() != null) {
            fee.setAmount(request.getAmount());
        }
        if (request.getReceiptNo() != null) {
            fee.setReceiptNo(request.getReceiptNo());
        }
        return toFeeDto(feeRepository.save(fee));
    }

    @Transactional
    public ExaminationDto updateExamination(String studentId, Long examinationId, ExaminationUpdateRequest request) {
        Examination examination = examinationRepository.findById(examinationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Examination not found"));
        if (!examination.getStudent().getId().equals(studentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Examination not found for student");
        }
        if (request.getEligible() != null) {
            examination.setEligible(request.getEligible());
        }
        if (request.getStatus() != null) {
            examination.setStatus(request.getStatus());
        }
        return toExaminationDto(examinationRepository.save(examination));
    }

    private Student requireStudent(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private StudentDto toStudentDto(Student student) {
        return new StudentDto(
                student.getId(),
                student.getName(),
                student.getNrc(),
                student.getProgram(),
                student.getEnrollmentYear());
    }

    private RegistrationDto toRegistrationDto(Registration registration) {
        return new RegistrationDto(
                registration.getId(),
                registration.getStudent().getId(),
                registration.getAcademicYear(),
                registration.getSemester(),
                registration.getConfirmed(),
                registration.getRegistrationDate());
    }

    private FeeDto toFeeDto(Fee fee) {
        return new FeeDto(
                fee.getId(),
                fee.getStudent().getId(),
                fee.getPaymentDate(),
                fee.getAmount(),
                fee.getReceiptNo(),
                fee.getOutstandingBalance());
    }

    private ExaminationDto toExaminationDto(Examination examination) {
        return new ExaminationDto(
                examination.getId(),
                examination.getStudent().getId(),
                examination.getAcademicYear(),
                examination.getEligible(),
                examination.getStatus());
    }

    private AcademicResultDto toResultDto(AcademicResult result) {
        return new AcademicResultDto(
                result.getId(),
                result.getStudent().getId(),
                result.getCourseCode(),
                result.getGrade(),
                result.getCredits());
    }
}
