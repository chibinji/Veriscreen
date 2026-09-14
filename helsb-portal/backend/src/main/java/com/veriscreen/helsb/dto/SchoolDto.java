package com.veriscreen.helsb.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchoolDto {
    private String code;
    private String name;
    private long applicationCount;
    private long newApplicationCount;
}
