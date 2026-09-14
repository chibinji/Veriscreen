package com.veriscreen.helsb.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchoolProgrammesDto {
    private UniversityDto university;
    private SchoolDto school;
    private List<ProgrammeCountDto> programmes;
}
