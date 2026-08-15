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
                .grade(result.getGrade())
                .credits(result.getCredits())
                .build();
    }

    public static HelsbApplicationDto toHelsbApplicationDto(HelsbApplication application) {
        return HelsbApplicationDto.builder()
                .id(application.getId())
                .applicationStatus(application.getApplicationStatus())
                .paymentStatus(application.getPaymentStatus())
                .screeningResult(application.getScreeningResult())
                .contractDetails(application.getContractDetails())
                .build();
    }
}
