package com.veriscreen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelsbApplicationDto {
    private Long id;
    private String applicationStatus;
    private String paymentStatus;
    private String screeningResult;
    private String contractDetails;
}
