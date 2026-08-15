package com.veriscreen.backend.service;

import com.veriscreen.backend.entity.AcademicResult;
import com.veriscreen.backend.entity.Examination;
import com.veriscreen.backend.entity.Fee;
import com.veriscreen.backend.entity.HelsbApplication;
import com.veriscreen.backend.entity.Registration;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.repository.AcademicResultRepository;
import com.veriscreen.backend.repository.ExaminationRepository;
import com.veriscreen.backend.repository.FeeRepository;
import com.veriscreen.backend.repository.HelsbApplicationRepository;
import com.veriscreen.backend.repository.RegistrationRepository;
import com.veriscreen.backend.repository.StudentRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DataLoader implements CommandLineRunner {

    /** Shared password for all mock students (dev/demo only). */
    public static final String MOCK_PASSWORD = "password123";

    private final StudentRepository studentRepository;
    private final RegistrationRepository registrationRepository;
    private final FeeRepository feeRepository;
    private final ExaminationRepository examinationRepository;
    private final AcademicResultRepository academicResultRepository;
    private final HelsbApplicationRepository helsbApplicationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(
            StudentRepository studentRepository,
            RegistrationRepository registrationRepository,
            FeeRepository feeRepository,
            ExaminationRepository examinationRepository,
            AcademicResultRepository academicResultRepository,
            HelsbApplicationRepository helsbApplicationRepository,
            PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.registrationRepository = registrationRepository;
        this.feeRepository = feeRepository;
        this.examinationRepository = examinationRepository;
        this.academicResultRepository = academicResultRepository;
        this.helsbApplicationRepository = helsbApplicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (studentRepository.count() > 0) {
            return;
        }

        seedSamuelMwanza();
        seedNosikuMukuka();
        seedGraceBanda();
        seedPeterZulu();

        log.info("Seeded {} mock students with varied screening scenarios", studentRepository.count());
    }

    /** Strong standing; partial fee balance; approved HELSB loan. */
    private void seedSamuelMwanza() {
        Student student = saveStudent(
                "2021465934", "Samuel Chibinji Mwanza", "123456/78/1", "Computer Science", 2021);

        registrationRepository.save(registration(student, "2023/2024", 1, true, LocalDate.of(2023, 9, 4)));
        registrationRepository.save(registration(student, "2023/2024", 2, true, LocalDate.of(2024, 1, 12)));
        registrationRepository.save(registration(student, "2024/2025", 1, true, LocalDate.of(2024, 9, 2)));
        registrationRepository.save(registration(student, "2024/2025", 2, true, LocalDate.of(2025, 1, 15)));

        feeRepository.save(fee(student, LocalDate.of(2023, 9, 1), "4500.00", "RCPT-2023-001", "0.00"));
        feeRepository.save(fee(student, LocalDate.of(2024, 9, 1), "4500.00", "RCPT-2024-001", "0.00"));
        feeRepository.save(fee(student, LocalDate.of(2025, 1, 10), "4500.00", "RCPT-2025-001", "500.00"));

        examinationRepository.save(examination(student, "2024/2025", true, "CLEARED"));
        examinationRepository.save(examination(student, "2023/2024", true, "COMPLETED"));

        academicResultRepository.save(result(student, "CSC3101", "A", 3));
        academicResultRepository.save(result(student, "CSC3102", "B+", 3));
        academicResultRepository.save(result(student, "MAT2101", "A-", 4));
        academicResultRepository.save(result(student, "ENG1201", "B", 2));

        helsbApplicationRepository.save(helsb(
                student, "APPROVED", "DISBURSED", "CLEARED", "2024/2025 loan contract active"));
    }

    /** Fees fully paid; exam eligible; HELSB application under review. */
    private void seedNosikuMukuka() {
        Student student = saveStudent(
                "2022030346", "Nosiku Mukuka", "234567/89/2", "Information Technology", 2022);

        registrationRepository.save(registration(student, "2023/2024", 1, true, LocalDate.of(2023, 9, 5)));
        registrationRepository.save(registration(student, "2023/2024", 2, true, LocalDate.of(2024, 1, 18)));
        registrationRepository.save(registration(student, "2024/2025", 1, true, LocalDate.of(2024, 9, 3)));

        feeRepository.save(fee(student, LocalDate.of(2023, 9, 2), "4200.00", "RCPT-NM-2023-001", "0.00"));
        feeRepository.save(fee(student, LocalDate.of(2024, 1, 14), "4200.00", "RCPT-NM-2024-001", "0.00"));
        feeRepository.save(fee(student, LocalDate.of(2024, 9, 2), "4200.00", "RCPT-NM-2024-002", "0.00"));

        examinationRepository.save(examination(student, "2024/2025", true, "CLEARED"));
        examinationRepository.save(examination(student, "2023/2024", true, "COMPLETED"));

        academicResultRepository.save(result(student, "ICT2201", "B+", 3));
        academicResultRepository.save(result(student, "ICT2202", "A-", 3));
        academicResultRepository.save(result(student, "STA2101", "B", 4));
        academicResultRepository.save(result(student, "COM1202", "A", 2));

        helsbApplicationRepository.save(helsb(
                student, "UNDER_REVIEW", "PENDING", "PENDING", "Awaiting automated screening outcome"));
    }

    /** Outstanding fees; registration pending; not exam eligible. */
    private void seedGraceBanda() {
        Student student = saveStudent(
                "2020123456", "Grace Banda", "345678/90/3", "Economics", 2020);

        registrationRepository.save(registration(student, "2023/2024", 1, true, LocalDate.of(2023, 9, 8)));
        registrationRepository.save(registration(student, "2023/2024", 2, true, LocalDate.of(2024, 1, 20)));
        registrationRepository.save(registration(student, "2024/2025", 1, false, LocalDate.of(2024, 9, 10)));

        feeRepository.save(fee(student, LocalDate.of(2023, 9, 3), "4000.00", "RCPT-GB-2023-001", "0.00"));
        feeRepository.save(fee(student, LocalDate.of(2024, 1, 16), "4000.00", "RCPT-GB-2024-001", "2500.00"));

        examinationRepository.save(examination(student, "2023/2024", true, "COMPLETED"));
        examinationRepository.save(examination(student, "2024/2025", false, "BLOCKED_FEES"));

        academicResultRepository.save(result(student, "ECO3101", "C+", 3));
        academicResultRepository.save(result(student, "ECO3102", "C", 3));
        academicResultRepository.save(result(student, "ECO2103", "B-", 4));
        academicResultRepository.save(result(student, "BUS1201", "C+", 2));
        academicResultRepository.save(result(student, "MAT1101", "D+", 4));

        helsbApplicationRepository.save(helsb(
                student, "NOT_ELIGIBLE", "UNPAID", "FAILED", "Outstanding fees exceed allowed threshold"));
    }

    /** Mixed academic history; partial payments; HELSB approved for current year. */
    private void seedPeterZulu() {
        Student student = saveStudent(
                "2019876543", "Peter Zulu", "456789/01/4", "Electrical Engineering", 2019);

        registrationRepository.save(registration(student, "2022/2023", 1, true, LocalDate.of(2022, 9, 1)));
        registrationRepository.save(registration(student, "2022/2023", 2, true, LocalDate.of(2023, 1, 11)));
        registrationRepository.save(registration(student, "2023/2024", 1, true, LocalDate.of(2023, 9, 2)));
        registrationRepository.save(registration(student, "2023/2024", 2, true, LocalDate.of(2024, 1, 9)));
        registrationRepository.save(registration(student, "2024/2025", 1, true, LocalDate.of(2024, 9, 4)));

        feeRepository.save(fee(student, LocalDate.of(2023, 9, 1), "5000.00", "RCPT-PZ-2023-001", "1200.00"));
        feeRepository.save(fee(student, LocalDate.of(2024, 1, 12), "5000.00", "RCPT-PZ-2024-001", "800.00"));
        feeRepository.save(fee(student, LocalDate.of(2024, 9, 3), "5000.00", "RCPT-PZ-2024-002", "800.00"));

        examinationRepository.save(examination(student, "2022/2023", true, "COMPLETED"));
        examinationRepository.save(examination(student, "2023/2024", true, "COMPLETED"));
        examinationRepository.save(examination(student, "2024/2025", true, "CLEARED"));

        academicResultRepository.save(result(student, "EEE3101", "B", 4));
        academicResultRepository.save(result(student, "EEE3102", "B-", 4));
        academicResultRepository.save(result(student, "EEE2103", "C+", 3));
        academicResultRepository.save(result(student, "PHY2201", "B+", 4));
        academicResultRepository.save(result(student, "MAT2102", "C", 4));
        academicResultRepository.save(result(student, "ENG1101", "A-", 2));

        helsbApplicationRepository.save(helsb(
                student, "APPROVED", "PARTIALLY_PAID", "CLEARED", "2024/2025 engineering loan approved"));
        helsbApplicationRepository.save(helsb(
                student, "COMPLETED", "DISBURSED", "CLEARED", "2023/2024 loan cycle completed"));
    }

    private Student saveStudent(String id, String name, String nrc, String program, int enrollmentYear) {
        Student student = new Student();
        student.setId(id);
        student.setName(name);
        student.setNrc(nrc);
        student.setProgram(program);
        student.setEnrollmentYear(enrollmentYear);
        student.setPassword(passwordEncoder.encode(MOCK_PASSWORD));
        return studentRepository.save(student);
    }

    private Registration registration(
            Student student, String year, int semester, boolean confirmed, LocalDate date) {
        Registration registration = new Registration();
        registration.setStudent(student);
        registration.setAcademicYear(year);
        registration.setSemester(semester);
        registration.setConfirmed(confirmed);
        registration.setRegistrationDate(date);
        return registration;
    }

    private Fee fee(Student student, LocalDate paymentDate, String amount, String receipt, String balance) {
        Fee fee = new Fee();
        fee.setStudent(student);
        fee.setPaymentDate(paymentDate);
        fee.setAmount(new BigDecimal(amount));
        fee.setReceiptNo(receipt);
        fee.setOutstandingBalance(new BigDecimal(balance));
        return fee;
    }

    private Examination examination(Student student, String year, boolean eligible, String status) {
        Examination examination = new Examination();
        examination.setStudent(student);
        examination.setAcademicYear(year);
        examination.setEligible(eligible);
        examination.setStatus(status);
        return examination;
    }

    private AcademicResult result(Student student, String courseCode, String grade, int credits) {
        AcademicResult result = new AcademicResult();
        result.setStudent(student);
        result.setCourseCode(courseCode);
        result.setGrade(grade);
        result.setCredits(credits);
        return result;
    }

    private HelsbApplication helsb(
            Student student,
            String applicationStatus,
            String paymentStatus,
            String screeningResult,
            String contractDetails) {
        HelsbApplication application = new HelsbApplication();
        application.setStudent(student);
        application.setApplicationStatus(applicationStatus);
        application.setPaymentStatus(paymentStatus);
        application.setScreeningResult(screeningResult);
        application.setContractDetails(contractDetails);
        return application;
    }
}
