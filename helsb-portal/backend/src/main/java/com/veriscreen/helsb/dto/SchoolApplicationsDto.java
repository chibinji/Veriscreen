package com.veriscreen.helsb.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchoolApplicationsDto {
    private UniversityDto university;
    private SchoolDto school;
    private long totalApplications;
    private List<ApplicationDto> newApplications;
}
