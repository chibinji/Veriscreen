package com.veriscreen.backend.integration.helsb;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class HelsbModels {

    private HelsbModels() {
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitRequest {
        private Long veriscreenApplicationId;
        private String studentId;
        private String studentName;
        private String nrc;
        private String programme;
        private String faculty;
        private List<String> documentIds;
        private String notes;
        private String applicationNumber;
    }

    @Data
    public static class Application {
        private Long id;
        private String applicationNumber;
        private Long veriscreenApplicationId;
        private String studentId;
        private String studentName;
        private String nrc;
        private String programme;
        private String faculty;
        private String status;
        private List<String> documentIds;
        private String notes;
        private Instant submittedAt;
        private Instant reviewedAt;
        private String reviewedBy;
        private Integer screeningPercent;
        private boolean screeningApproved;
    }

    @Data
    public static class Decision {
        private Long veriscreenApplicationId;
        private String applicationNumber;
        private String studentId;
        private String status;
        private String notes;
    }
}
