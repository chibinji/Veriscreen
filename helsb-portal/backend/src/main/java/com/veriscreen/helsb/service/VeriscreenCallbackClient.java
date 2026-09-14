package com.veriscreen.helsb.service;

import com.veriscreen.helsb.dto.VeriscreenDecisionPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
public class VeriscreenCallbackClient {

    private final RestClient restClient;
    private final String callbackUrl;
    private final String apiKey;

    public VeriscreenCallbackClient(
            @Value("${veriscreen.callback-url}") String callbackUrl,
            @Value("${veriscreen.callback-api-key}") String apiKey) {
        this.callbackUrl = callbackUrl;
        this.apiKey = apiKey;
        this.restClient = RestClient.builder().build();
    }

    public void notifyDecision(VeriscreenDecisionPayload payload) {
        try {
            restClient.post()
                    .uri(callbackUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-API-Key", apiKey)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Notified VeriScreen of HELSB decision {} for {}", payload.getStatus(), payload.getApplicationNumber());
        } catch (Exception ex) {
            log.warn("Unable to notify VeriScreen of HELSB decision for {}: {}", payload.getApplicationNumber(), ex.getMessage());
        }
    }
}
