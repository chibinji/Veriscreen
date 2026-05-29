package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;
import java.util.List;

public interface DocumentService {

    List<DocumentDto> listDocumentsForCurrentStudent(String authenticatedStudentId);

    List<DocumentDto> listDocumentsForStudent(String authenticatedStudentId, String requestedStudentId);
}
