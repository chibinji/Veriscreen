package com.veriscreen.backend.integration.helsb;

import com.veriscreen.backend.entity.HelsbApplication;
import com.veriscreen.backend.entity.Student;
import com.veriscreen.backend.repository.HelsbApplicationRepository;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class HelsbBridge {

    private final HelsbClient helsbClient;
    private final HelsbApplicationRepository helsbApplicationRepository;

    public HelsbBridge(HelsbClient helsbClient, HelsbApplicationRepository helsbApplicationRepository) {
        this.helsbClient = helsbClient;
        this.helsbApplicationRepository = helsbApplicationRepository;
    }

    public boolean isPortalReachable() {
        return helsbClient.ping();
    }

    @Transactional
    public int publishAll() {
        int linked = 0;
        for (HelsbApplication application : helsbApplicationRepository.findAll()) {
            if (publish(application)) {
                linked++;
            }
        }
        return linked;
    }

    @Transactional
    public boolean publish(HelsbApplication application) {
        Student student = application.getStudent();
        HelsbModels.SubmitRequest outbound = HelsbModels.SubmitRequest.builder()
                .veriscreenApplicationId(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .studentId(student.getId())
                .studentName(student.getName())
                .nrc(student.getNrc())
                .programme(student.getProgram())
                .faculty(student.getFaculty())
                .documentIds(splitIds(application.getSubmittedDocumentIds()))
                .notes(application.getNotes())
                .build();
        return helsbClient.submit(outbound).map(remote -> {
            if (remote.getApplicationNumber() != null) {
                application.setApplicationNumber(remote.getApplicationNumber());
            }
            if (remote.getId() != null) {
                application.setExternalHelsbId(remote.getId());
            }
            helsbApplicationRepository.save(application);
            return true;
        }).orElse(false);
    }

    private List<String> splitIds(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }
}
