package com.veriscreen.university.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeDto {
    private Long id;
    private String studentId;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private String receiptNo;
    private BigDecimal outstandingBalance;
}
