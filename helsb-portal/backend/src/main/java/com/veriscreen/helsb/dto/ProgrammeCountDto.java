package com.veriscreen.helsb.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgrammeCountDto {
    private String code;
    private String name;
    private long loanStudentCount;
}
