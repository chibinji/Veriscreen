package com.veriscreen.helsb.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatusHistoryDto {
    private Long id;
    private String fromStatus;
    private String toStatus;
    private String changedBy;
    private String comment;
    private Instant changedAt;
}
