package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;
import com.veriscreen.backend.entity.Registration;
import com.veriscreen.backend.repository.RegistrationRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ConfirmationSlipDocumentGenerator extends AbstractPlaceholderDocumentGenerator {

    public static final String TYPE = "CONFIRMATION_SLIP";

    private final RegistrationRepository registrationRepository;

    public ConfirmationSlipDocumentGenerator(RegistrationRepository registrationRepository) {
        super("Confirmation Slip");
        this.registrationRepository = registrationRepository;
    }

    @Override
    public String getDocumentType() {
        return TYPE;
    }

    @Override
    public DocumentDto generate(String studentId) {
        List<Registration> registrations = registrationRepository.findByStudent_Id(studentId);
        String summary = buildSummary(registrations);
        return buildDocument(summary);
    }

    private String buildSummary(List<Registration> registrations) {
        if (registrations.isEmpty()) {
            return "No registration records on file";
        }

        String confirmedTerms = registrations.stream()
                .filter(registration -> Boolean.TRUE.equals(registration.getConfirmed()))
                .map(registration -> registration.getAcademicYear() + " Semester " + registration.getSemester())
                .collect(Collectors.joining(", "));

        if (confirmedTerms.isEmpty()) {
            return "Registration pending confirmation";
        }

        return "Confirmed for: " + confirmedTerms;
    }
}
