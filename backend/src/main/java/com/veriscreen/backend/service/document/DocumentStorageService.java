package com.veriscreen.backend.service.document;

import com.veriscreen.backend.entity.OfficialDocumentType;
import com.veriscreen.backend.exception.ResourceNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DocumentStorageService {

    private final Path root;

    public DocumentStorageService(
            @Value("${veriscreen.documents.storage-dir:generated-documents}") String storageDir) {
        this.root = Paths.get(storageDir).toAbsolutePath().normalize();
    }

    public String store(OfficialDocumentType type, String documentId, byte[] pdf) {
        try {
            Path directory = root.resolve(type.getStorageFolder());
            Files.createDirectories(directory);
            Path file = directory.resolve(safeFileName(documentId) + ".pdf");
            Files.write(file, pdf, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return file.toString();
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to store generated document", ex);
        }
    }

    public byte[] read(String filePath) {
        try {
            Path file = resolveStoredPath(filePath);
            if (!Files.exists(file)) {
                throw new ResourceNotFoundException("Stored document file is missing");
            }
            return Files.readAllBytes(file);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read stored document", ex);
        }
    }

    private Path resolveStoredPath(String filePath) {
        Path file = Paths.get(filePath).toAbsolutePath().normalize();
        if (!file.startsWith(root)) {
            throw new ResourceNotFoundException("Stored document file is missing");
        }
        return file;
    }

    private String safeFileName(String documentId) {
        return documentId.replaceAll("[^A-Za-z0-9\\-]", "");
    }
}
