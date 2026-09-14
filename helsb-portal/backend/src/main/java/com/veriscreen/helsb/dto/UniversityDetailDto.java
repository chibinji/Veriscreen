package com.veriscreen.helsb.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UniversityDetailDto {
    private UniversityDto university;
    private List<SchoolDto> schools;
}
