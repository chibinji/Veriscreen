package com.veriscreen.backend.controller;

import com.veriscreen.backend.constants.ApiPaths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public discovery endpoint (GET). Use this in the browser; do not open /auth/login with GET.
 */
@RestController
@RequestMapping(ApiPaths.API_V1)
public class ApiInfoController {

    @GetMapping
    public Map<String, Object> apiInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("name", "VeriScreen API v1");
        info.put("documentation", "/swagger-ui.html");
        info.put("endpoints", List.of(
                Map.of("method", "POST", "path", ApiPaths.AUTH + "/login",
                        "legacyPath", ApiPaths.LEGACY_AUTH + "/login",
                        "body", Map.of("id", "studentId", "password", "string"),
                        "note", "Returns accessToken — use POST, not GET"),
                Map.of("method", "GET", "path", ApiPaths.STUDENTS + "/me/profile",
                        "auth", "Bearer JWT"),
                Map.of("method", "GET", "path", ApiPaths.STUDENTS + "/me/documents",
                        "auth", "Bearer JWT")
        ));
        return info;
    }
}
