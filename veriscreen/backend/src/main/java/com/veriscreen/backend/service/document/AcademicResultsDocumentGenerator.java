package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;
import com.veriscreen.backend.entity.AcademicResult;
import com.veriscreen.backend.repository.AcademicResultRepository;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class AcademicResultsDocumentGenerator extends AbstractPlaceholderDocumentGenerator {

    public static final String TYPE = "ACADEMIC_RESULTS";

    private final AcademicResultRepository academicResultRepository;

    public AcademicResultsDocumentGenerator(AcademicResultRepository academicResultRepository) {
        super("Academic Results");
        this.academicResultRepository = academicResultRepository;
    }

    @Override
    public String getDocumentType() {
        return TYPE;
    }

    @Override
    public DocumentDto generate(String studentId) {
        List<AcademicResult> results = academicResultRepository.findByStudent_Id(studentId);
        String summary = buildSummary(results);
        return buildDocument(summary);
    }

    private String buildSummary(List<AcademicResult> results) {
        if (results.isEmpty()) {
            return "No academic results on file";
        }

        int totalCredits = results.stream()
                .mapToInt(result -> result.getCredits() != null ? result.getCredits() : 0)
                .sum();

        return results.size() + " course(s) recorded, " + totalCredits + " total credits";
    }
}
