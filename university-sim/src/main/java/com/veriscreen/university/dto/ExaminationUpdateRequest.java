package com.veriscreen.university.dto;

import lombok.Data;

@Data
public class ExaminationUpdateRequest {
    private Boolean eligible;
    private String status;
}
