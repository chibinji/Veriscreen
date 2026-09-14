package com.veriscreen.helsb.service;

import com.veriscreen.helsb.catalog.InstitutionCatalog;
import com.veriscreen.helsb.catalog.InstitutionCatalog.Programme;
import com.veriscreen.helsb.catalog.InstitutionCatalog.School;
import com.veriscreen.helsb.catalog.InstitutionCatalog.University;
import com.veriscreen.helsb.dto.ApplicationDto;
import com.veriscreen.helsb.dto.ProgrammeCountDto;
import com.veriscreen.helsb.dto.SchoolApplicationsDto;
import com.veriscreen.helsb.dto.SchoolDto;
import com.veriscreen.helsb.dto.SchoolProgrammesDto;
import com.veriscreen.helsb.dto.UniversityDetailDto;
import com.veriscreen.helsb.dto.UniversityDto;
import com.veriscreen.helsb.entity.LoanApplication;
import com.veriscreen.helsb.exception.ResourceNotFoundException;
import com.veriscreen.helsb.repository.LoanApplicationRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InstitutionService {

    private final LoanApplicationRepository applicationRepository;
    private final ApplicationService applicationService;

    public InstitutionService(
            LoanApplicationRepository applicationRepository,
            ApplicationService applicationService) {
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;
    }

    @Transactional(readOnly = true)
    public List<UniversityDto> listUniversities() {
        return InstitutionCatalog.UNIVERSITIES.stream().map(this::toUniversity).toList();
    }

    @Transactional(readOnly = true)
    public UniversityDetailDto getUniversity(String universityCode) {
        University university = requireUniversity(universityCode);
        List<SchoolDto> schools = university.schools().stream()
                .map(school -> toSchool(university.code(), school))
                .toList();
        return UniversityDetailDto.builder()
                .university(toUniversity(university))
                .schools(schools)
                .build();
    }

    @Transactional(readOnly = true)
    public SchoolApplicationsDto schoolApplications(String universityCode, String schoolCode) {
        University university = requireUniversity(universityCode);
        School school = requireSchool(university, schoolCode);
        List<LoanApplication> applications = applicationRepository
                .findByUniversityCodeAndSchoolCodeOrderBySubmittedAtDesc(university.code(), school.code());
        List<ApplicationDto> newApplications = applications.stream()
                .filter(app -> ApplicationService.PENDING.equals(app.getStatus()))
                .map(applicationService::toPublicDto)
                .toList();
        return SchoolApplicationsDto.builder()
                .university(toUniversity(university))
                .school(toSchool(university.code(), school))
                .totalApplications(applications.size())
                .newApplications(newApplications)
                .build();
    }

    @Transactional(readOnly = true)
    public SchoolProgrammesDto schoolProgrammes(String universityCode, String schoolCode) {
        University university = requireUniversity(universityCode);
        School school = requireSchool(university, schoolCode);
        List<LoanApplication> applications = applicationRepository
                .findByUniversityCodeAndSchoolCodeOrderBySubmittedAtDesc(university.code(), school.code());
        List<ProgrammeCountDto> programmes = school.programmes().stream()
                .map(programme -> ProgrammeCountDto.builder()
                        .code(programme.code())
                        .name(programme.name())
                        .loanStudentCount(applications.stream()
                                .filter(app -> matchesProgramme(app, programme))
                                .filter(app -> !ApplicationService.REJECTED.equals(app.getStatus()))
                                .map(LoanApplication::getStudentId)
                                .distinct()
                                .count())
                        .build())
                .toList();
        return SchoolProgrammesDto.builder()
                .university(toUniversity(university))
                .school(toSchool(university.code(), school))
                .programmes(programmes)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> programmeStudents(String universityCode, String schoolCode, String programmeCode) {
        University university = requireUniversity(universityCode);
        School school = requireSchool(university, schoolCode);
        Programme programme = school.programmes().stream()
                .filter(item -> item.code().equalsIgnoreCase(programmeCode))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Programme not found: " + programmeCode));
        return applicationRepository
                .findByUniversityCodeAndSchoolCodeOrderBySubmittedAtDesc(university.code(), school.code())
                .stream()
                .filter(app -> matchesProgramme(app, programme))
                .map(applicationService::toPublicDto)
                .toList();
    }

    private University requireUniversity(String code) {
        return InstitutionCatalog.findUniversity(code)
                .orElseThrow(() -> new ResourceNotFoundException("University not found: " + code));
    }

    private School requireSchool(University university, String schoolCode) {
        return university.schools().stream()
                .filter(item -> item.code().equalsIgnoreCase(schoolCode))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("School not found: " + schoolCode));
    }

    private UniversityDto toUniversity(University university) {
        return UniversityDto.builder()
                .code(university.code())
                .name(university.name())
                .abbreviation(university.abbreviation())
                .schoolCount(university.schools().size())
                .build();
    }

    private SchoolDto toSchool(String universityCode, School school) {
        return SchoolDto.builder()
                .code(school.code())
                .name(school.name())
                .applicationCount(applicationRepository.countByUniversityCodeAndSchoolCode(
                        universityCode, school.code()))
                .newApplicationCount(applicationRepository.countByUniversityCodeAndSchoolCodeAndStatus(
                        universityCode, school.code(), ApplicationService.PENDING))
                .build();
    }

    private boolean matchesProgramme(LoanApplication application, Programme programme) {
        String value = application.getProgramme() == null ? "" : application.getProgramme().trim().toLowerCase(Locale.ROOT);
        return value.equals(programme.name().toLowerCase(Locale.ROOT))
                || value.equals(programme.code().toLowerCase(Locale.ROOT));
    }
}
