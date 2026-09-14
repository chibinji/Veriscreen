package com.veriscreen.backend.service.document;

import com.veriscreen.backend.dto.DocumentDto;
import com.veriscreen.backend.dto.DocumentVerificationResponse;
import com.veriscreen.backend.dto.GeneratedDocumentResponse;
import com.veriscreen.backend.entity.OfficialDocumentType;
import java.util.List;

public interface DocumentService {

    List<DocumentDto> listDocumentsForCurrentStudent(String authenticatedStudentId);

    List<DocumentDto> listDocumentsForStudent(String authenticatedStudentId, String requestedStudentId);

    GeneratedDocumentResponse generateOfficialDocument(String authenticatedStudentId, OfficialDocumentType type);

    byte[] downloadOfficialDocument(String authenticatedStudentId, String documentId);

    DocumentVerificationResponse verify(String documentId);
}
