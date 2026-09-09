package com.veriscreen.university.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class FeeUpdateRequest {
    private BigDecimal outstandingBalance;
    private BigDecimal amount;
    private String receiptNo;
}
