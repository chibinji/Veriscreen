package com.veriscreen.backend.repository;

import com.veriscreen.backend.entity.IssuedDocument;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IssuedDocumentRepository extends JpaRepository<IssuedDocument, Long> {

    Optional<IssuedDocument> findByDocumentId(String documentId);

    @Query("SELECT d FROM IssuedDocument d JOIN FETCH d.student WHERE d.documentId = :documentId")
    Optional<IssuedDocument> findByDocumentIdWithStudent(@Param("documentId") String documentId);

    List<IssuedDocument> findByStudent_IdOrderByGeneratedAtDesc(String studentId);
}
