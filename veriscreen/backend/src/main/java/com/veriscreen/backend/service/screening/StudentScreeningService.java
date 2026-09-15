package com.veriscreen.backend.service.screening;

import com.veriscreen.backend.dto.AcademicResultDto;
import com.veriscreen.backend.dto.ExaminationDto;
import com.veriscreen.backend.dto.FeeDto;
import com.veriscreen.backend.dto.HelsbApplicationDto;
import com.veriscreen.backend.dto.HelsbSubmitRequest;
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
<<<<<<< HEAD:veriscreen/backend/src/main/java/com/veriscreen/backend/service/screening/StudentScreeningService.java

    HelsbApplicationDto submitHelsbApplication(String authenticatedStudentId, HelsbSubmitRequest request);

    byte[] downloadContract(String authenticatedStudentId, Long applicationId);

    HelsbApplicationDto emailContract(String authenticatedStudentId, Long applicationId);
=======
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:backend/src/main/java/com/veriscreen/backend/service/screening/StudentScreeningService.java
}
