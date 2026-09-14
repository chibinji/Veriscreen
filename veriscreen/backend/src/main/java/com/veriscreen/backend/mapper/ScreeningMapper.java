package com.veriscreen.backend.mapper;

import com.veriscreen.backend.dto.AcademicResultDto;
import com.veriscreen.backend.dto.ExaminationDto;
import com.veriscreen.backend.dto.FeeDto;
import com.veriscreen.backend.dto.HelsbApplicationDto;
import com.veriscreen.backend.dto.RegistrationDto;
import com.veriscreen.backend.entity.AcademicResult;
import com.veriscreen.backend.entity.Examination;
import com.veriscreen.backend.entity.Fee;
import com.veriscreen.backend.entity.HelsbApplication;
import com.veriscreen.backend.entity.Registration;
import com.veriscreen.backend.entity.Student;

public final class ScreeningMapper {

    private ScreeningMapper() {
    }

    public static RegistrationDto toRegistrationDto(Registration registration) {
        return RegistrationDto.builder()
                .id(registration.getId())
                .academicYear(registration.getAcademicYear())
                .semester(registration.getSemester())
                .confirmed(registration.getConfirmed())
                .registrationDate(registration.getRegistrationDate())
                .build();
    }

    public static FeeDto toFeeDto(Fee fee) {
        return FeeDto.builder()
                .id(fee.getId())
                .paymentDate(fee.getPaymentDate())
                .amount(fee.getAmount())
                .receiptNo(fee.getReceiptNo())
                .outstandingBalance(fee.getOutstandingBalance())
                .description(fee.getDescription())
                .build();
    }

    public static ExaminationDto toExaminationDto(Examination examination) {
        return ExaminationDto.builder()
                .id(examination.getId())
                .academicYear(examination.getAcademicYear())
                .eligible(examination.getEligible())
                .status(examination.getStatus())
                .build();
    }

    public static AcademicResultDto toAcademicResultDto(AcademicResult result) {
        return AcademicResultDto.builder()
                .id(result.getId())
                .courseCode(result.getCourseCode())
                .courseName(result.getCourseName())
                .grade(result.getGrade())
                .credits(result.getCredits())
                .academicYear(result.getAcademicYear())
                .build();
    }

    public static HelsbApplicationDto toHelsbApplicationDto(HelsbApplication application) {
        Student student = application.getStudent();
        String status = normalizeStatus(application.getApplicationStatus());
        boolean approved = "APPROVED".equals(status) || "CONTRACT_GENERATED".equals(status) || "COMPLETED".equals(status);
        boolean hasLoan = approved;
        return HelsbApplicationDto.builder()
                .id(application.getId())
                .applicationStatus(status)
                .paymentStatus(application.getPaymentStatus())
                .screeningResult(application.getScreeningResult())
                .contractDetails(application.getContractDetails())
                .applicationNumber(application.getApplicationNumber())
                .notes(application.getNotes())
                .submittedAt(application.getSubmittedAt())
                .reviewedAt(application.getReviewedAt())
                .loanPercent(application.getLoanPercent() == null ? 50 : application.getLoanPercent())
                .hasLoan(hasLoan)
                .mobileMoneyPhone(application.getMobileMoneyPhone())
                .mobileMoneyProvider(application.getMobileMoneyProvider())
                .submittedDocumentIds(application.getSubmittedDocumentIds())
                .contractAvailable(approved)
                .studentName(student == null ? null : student.getName())
                .studentId(student == null ? null : student.getId())
                .nrc(student == null ? null : student.getNrc())
                .programme(student == null ? null : student.getProgram())
                .faculty(student == null ? null : student.getFaculty())
                .email(student == null ? null : student.getEmail())
                .phone(student == null ? null : student.getPhone())
                .build();
    }

    public static String normalizeStatus(String status) {
        if (status == null) {
            return "PENDING";
        }
        String value = status.toUpperCase();
        if ("CONFIRMED".equals(value)) {
            return "APPROVED";
        }
        return value;
    }
}
