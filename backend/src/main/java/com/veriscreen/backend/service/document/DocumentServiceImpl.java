package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;
import com.veriscreen.backend.service.security.StudentAccessValidator;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DocumentServiceImpl implements DocumentService {

    private final List<DocumentGenerator> documentGenerators;
    private final StudentAccessValidator accessValidator;

    public DocumentServiceImpl(List<DocumentGenerator> documentGenerators, StudentAccessValidator accessValidator) {
        this.documentGenerators = documentGenerators;
        this.accessValidator = accessValidator;
    }

    @Override
    public List<DocumentDto> listDocumentsForCurrentStudent(String authenticatedStudentId) {
        return listDocumentsForStudent(authenticatedStudentId, authenticatedStudentId);
    }

    @Override
    public List<DocumentDto> listDocumentsForStudent(String authenticatedStudentId, String requestedStudentId) {
        accessValidator.ensureSelfAccess(authenticatedStudentId, requestedStudentId);
        log.debug("Generating {} document(s) for student id={}", documentGenerators.size(), requestedStudentId);
        return documentGenerators.stream()
                .map(generator -> generator.generate(requestedStudentId))
                .toList();
    }
}
