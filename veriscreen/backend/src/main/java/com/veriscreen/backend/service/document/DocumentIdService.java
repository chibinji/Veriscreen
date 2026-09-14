package com.veriscreen.backend.service.document;

import com.veriscreen.backend.entity.DocumentSequence;
import com.veriscreen.backend.entity.OfficialDocumentType;
import com.veriscreen.backend.repository.DocumentSequenceRepository;
import java.time.Year;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DocumentIdService {

    private final DocumentSequenceRepository sequenceRepository;

    public DocumentIdService(DocumentSequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    /**
     * Allocates a unique document ID such as VS-2026-CS-000001.
     * Uses a pessimistic lock on the per-year/type sequence, not a timestamp.
     */
    @Transactional
    public String nextDocumentId(OfficialDocumentType type) {
        int year = Year.now().getValue();
        DocumentSequence sequence = lockOrCreate(year, type.getCode());
        long next = sequence.getLastValue() + 1;
        sequence.setLastValue(next);
        sequenceRepository.save(sequence);
        return String.format("VS-%d-%s-%06d", year, type.getCode(), next);
    }

    private DocumentSequence lockOrCreate(int year, String typeCode) {
        return sequenceRepository.findByYearAndTypeCodeForUpdate(year, typeCode)
                .orElseGet(() -> createSequence(year, typeCode));
    }

    private DocumentSequence createSequence(int year, String typeCode) {
        try {
            DocumentSequence created = new DocumentSequence();
            created.setYear(year);
            created.setTypeCode(typeCode);
            created.setLastValue(0L);
            sequenceRepository.saveAndFlush(created);
        } catch (DataIntegrityViolationException ignored) {
            // Another request created the same year/type row first.
        }
        return sequenceRepository.findByYearAndTypeCodeForUpdate(year, typeCode)
                .orElseThrow(() -> new IllegalStateException("Unable to allocate document sequence"));
    }
}
