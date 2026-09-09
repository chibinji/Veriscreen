package com.veriscreen.backend.integration.university;

import com.veriscreen.backend.entity.AcademicResult;
import com.veriscreen.backend.entity.Examination;
import com.veriscreen.backend.entity.Fee;
import com.veriscreen.backend.entity.Registration;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.integration.university.UniversitySisDtos.AcademicResultDto;
import com.veriscreen.backend.integration.university.UniversitySisDtos.ExaminationDto;
import com.veriscreen.backend.integration.university.UniversitySisDtos.FeeDto;
import com.veriscreen.backend.integration.university.UniversitySisDtos.RegistrationDto;
import com.veriscreen.backend.integration.university.UniversitySisDtos.StudentDto;
import com.veriscreen.backend.repository.AcademicResultRepository;
import com.veriscreen.backend.repository.ExaminationRepository;
import com.veriscreen.backend.repository.FeeRepository;
import com.veriscreen.backend.repository.RegistrationRepository;
import com.veriscreen.backend.repository.StudentRepository;
import com.veriscreen.backend.service.DataLoader;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class UniversitySyncService {

    private final UniversityClient universityClient;
    private final StudentRepository studentRepository;
    private final RegistrationRepository registrationRepository;
    private final FeeRepository feeRepository;
    private final ExaminationRepository examinationRepository;
    private final AcademicResultRepository academicResultRepository;
    private final PasswordEncoder passwordEncoder;

    public UniversitySyncService(
            UniversityClient universityClient,
            StudentRepository studentRepository,
            RegistrationRepository registrationRepository,
            FeeRepository feeRepository,
            ExaminationRepository examinationRepository,
            AcademicResultRepository academicResultRepository,
            PasswordEncoder passwordEncoder) {
        this.universityClient = universityClient;
        this.studentRepository = studentRepository;
        this.registrationRepository = registrationRepository;
        this.feeRepository = feeRepository;
        this.examinationRepository = examinationRepository;
        this.academicResultRepository = academicResultRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public int syncAll() {
        List<String> studentIds = universityClient.listStudentIds();
        int count = 0;
        for (String studentId : studentIds) {
            syncStudent(studentId);
            count++;
        }
        log.info("University sync completed for {} students", count);
        return count;
    }

    @Transactional
    public void syncStudent(String studentId) {
        StudentDto remote = universityClient.getStudent(studentId);
        if (remote == null) {
            throw new IllegalStateException("University SIS returned empty student for " + studentId);
        }

        Student student = studentRepository.findById(studentId).orElseGet(Student::new);
        boolean isNew = student.getId() == null;
        student.setId(remote.getId());
        student.setName(remote.getName());
        student.setNrc(remote.getNrc());
        student.setProgram(remote.getProgram());
        student.setEnrollmentYear(remote.getEnrollmentYear());
        if (isNew || student.getPassword() == null || student.getPassword().isBlank()) {
            student.setPassword(passwordEncoder.encode(DataLoader.MOCK_PASSWORD));
        }
        student = studentRepository.save(student);

        replaceRegistrations(student, universityClient.getRegistrations(studentId));
        replaceFees(student, universityClient.getFees(studentId));
        replaceExaminations(student, universityClient.getExaminations(studentId));
        replaceResults(student, universityClient.getAcademicResults(studentId));
    }

    private void replaceRegistrations(Student student, List<RegistrationDto> remote) {
        registrationRepository.deleteByStudent_Id(student.getId());
        if (remote == null) {
            return;
        }
        for (RegistrationDto dto : remote) {
            Registration registration = new Registration();
            registration.setStudent(student);
            registration.setAcademicYear(dto.getAcademicYear());
            registration.setSemester(dto.getSemester());
            registration.setConfirmed(dto.getConfirmed());
            registration.setRegistrationDate(dto.getRegistrationDate());
            registrationRepository.save(registration);
        }
    }

    private void replaceFees(Student student, List<FeeDto> remote) {
        feeRepository.deleteByStudent_Id(student.getId());
        if (remote == null) {
            return;
        }
        for (FeeDto dto : remote) {
            Fee fee = new Fee();
            fee.setStudent(student);
            fee.setPaymentDate(dto.getPaymentDate());
            fee.setAmount(dto.getAmount());
            fee.setReceiptNo(dto.getReceiptNo());
            fee.setOutstandingBalance(dto.getOutstandingBalance());
            feeRepository.save(fee);
        }
    }

    private void replaceExaminations(Student student, List<ExaminationDto> remote) {
        examinationRepository.deleteByStudent_Id(student.getId());
        if (remote == null) {
            return;
        }
        for (ExaminationDto dto : remote) {
            Examination examination = new Examination();
            examination.setStudent(student);
            examination.setAcademicYear(dto.getAcademicYear());
            examination.setEligible(dto.getEligible());
            examination.setStatus(dto.getStatus());
            examinationRepository.save(examination);
        }
    }

    private void replaceResults(Student student, List<AcademicResultDto> remote) {
        academicResultRepository.deleteByStudent_Id(student.getId());
        if (remote == null) {
            return;
        }
        for (AcademicResultDto dto : remote) {
            AcademicResult result = new AcademicResult();
            result.setStudent(student);
            result.setCourseCode(dto.getCourseCode());
            result.setGrade(dto.getGrade());
            result.setCredits(dto.getCredits());
            academicResultRepository.save(result);
        }
    }
}
