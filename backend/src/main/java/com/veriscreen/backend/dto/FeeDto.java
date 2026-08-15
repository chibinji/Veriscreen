package com.veriscreen.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeDto {
    private Long id;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private String receiptNo;
    private BigDecimal outstandingBalance;
}
