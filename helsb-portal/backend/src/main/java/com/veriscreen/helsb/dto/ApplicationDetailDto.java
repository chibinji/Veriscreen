package com.veriscreen.helsb.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationDetailDto {
    private ApplicationDto application;
    private List<StatusHistoryDto> history;
}
