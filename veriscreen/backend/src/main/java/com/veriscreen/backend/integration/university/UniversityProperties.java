package com.veriscreen.backend.integration.university;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "university")
public class UniversityProperties {

    private String baseUrl = "http://localhost:8090";
    private String apiKey = "dev-shared-secret";
    private Sync sync = new Sync();

    @Data
    public static class Sync {
        private boolean enabled = false;
        private String cron = "0 */5 * * * *";
    }
}
