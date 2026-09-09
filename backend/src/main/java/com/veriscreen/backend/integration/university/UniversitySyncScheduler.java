package com.veriscreen.backend.integration.university;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1)
public class UniversitySyncScheduler implements ApplicationRunner {

    private final UniversityProperties properties;
    private final UniversitySyncService syncService;

    public UniversitySyncScheduler(UniversityProperties properties, UniversitySyncService syncService) {
        this.properties = properties;
        this.syncService = syncService;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.getSync().isEnabled()) {
            log.info("University sync is disabled");
            return;
        }
        try {
            syncService.syncAll();
        } catch (Exception ex) {
            log.error(
                    "Initial university sync failed. Start university-sim on {} then POST /api/v1/admin/sync/university. Cause: {}",
                    properties.getBaseUrl(),
                    ex.getMessage());
        }
    }

    @Scheduled(cron = "${university.sync.cron:0 */5 * * * *}")
    public void scheduledSync() {
        if (!properties.getSync().isEnabled()) {
            return;
        }
        try {
            syncService.syncAll();
        } catch (Exception ex) {
            log.warn("Scheduled university sync failed: {}", ex.getMessage());
        }
    }
}
