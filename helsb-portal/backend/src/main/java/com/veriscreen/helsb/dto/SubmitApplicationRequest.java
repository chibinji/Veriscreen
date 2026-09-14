package com.veriscreen.helsb.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Data;

@Data
public class SubmitApplicationRequest {
    private Long veriscreenApplicationId;
    @NotBlank
    private String studentId;
    private String studentName;
    private String nrc;
    private String programme;
    private String faculty;
    private List<String> documentIds;
    private String notes;
    private String applicationNumber;
}
