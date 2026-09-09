package com.veriscreen.backend.service.screening;

import com.veriscreen.backend.dto.AcademicResultDto;
import com.veriscreen.backend.dto.ExaminationDto;
import com.veriscreen.backend.dto.FeeDto;
import com.veriscreen.backend.dto.HelsbApplicationDto;
import com.veriscreen.backend.dto.RegistrationDto;
import java.util.List;

public interface StudentScreeningService {

    List<RegistrationDto> listRegistrations(String authenticatedStudentId);

    List<RegistrationDto> listRegistrationsForStudent(String authenticatedStudentId, String requestedStudentId);

    List<FeeDto> listFees(String authenticatedStudentId);

    List<FeeDto> listFeesForStudent(String authenticatedStudentId, String requestedStudentId);

    List<ExaminationDto> listExaminations(String authenticatedStudentId);

    List<ExaminationDto> listExaminationsForStudent(String authenticatedStudentId, String requestedStudentId);

    List<AcademicResultDto> listAcademicResults(String authenticatedStudentId);

    List<AcademicResultDto> listAcademicResultsForStudent(
            String authenticatedStudentId, String requestedStudentId);

    List<HelsbApplicationDto> listHelsbApplications(String authenticatedStudentId);

    List<HelsbApplicationDto> listHelsbApplicationsForStudent(
            String authenticatedStudentId, String requestedStudentId);
}
