package com.veriscreen.backend.integration.helsb;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(Integer.MAX_VALUE)
public class HelsbLinkRunner implements CommandLineRunner {

    private static final int ATTEMPTS = 15;

    private final HelsbBridge helsbBridge;

    public HelsbLinkRunner(HelsbBridge helsbBridge) {
        this.helsbBridge = helsbBridge;
    }

    @Override
    public void run(String... args) {
        for (int attempt = 1; attempt <= ATTEMPTS; attempt++) {
            if (helsbBridge.isPortalReachable()) {
                int linked = helsbBridge.publishAll();
                log.info("VeriScreen is linked to the HELSB portal. Published {} loan application(s).", linked);
                return;
            }
            log.warn("Waiting for the HELSB portal ({}/{})...", attempt, ATTEMPTS);
            try {
                Thread.sleep(2000L);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                return;
            }
        }
        log.warn("VeriScreen could not reach the HELSB portal on port 8083. "
                + "Start helsb-portal and restart this API, or submit again from the student HELSB page.");
    }
}
