package com.veriscreen.helsb.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDto {
    private long totalApplications;
    private long pendingApplications;
    private long underReviewApplications;
    private long confirmedApplications;
    private long rejectedApplications;
}
