package com.veriscreen.helsb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String accessToken;
    private String fullName;
    private String role;
    private String username;
}
