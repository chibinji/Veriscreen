package com.veriscreen.helsb.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UniversityDto {
    private String code;
    private String name;
    private String abbreviation;
    private int schoolCount;
}
