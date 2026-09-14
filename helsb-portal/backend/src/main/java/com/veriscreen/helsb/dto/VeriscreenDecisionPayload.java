package com.veriscreen.helsb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VeriscreenDecisionPayload {
    private Long veriscreenApplicationId;
    private String applicationNumber;
    private String studentId;
    private String status;
    private String notes;
}
