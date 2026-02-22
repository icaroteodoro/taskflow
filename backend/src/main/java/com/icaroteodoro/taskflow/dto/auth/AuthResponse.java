package com.icaroteodoro.taskflow.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String id;
    private String email;
    private String name;
    private String refreshToken;
}
