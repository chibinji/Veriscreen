package com.veriscreen.backend.constants;

/**
 * Central definition of REST API paths (API-first, versioned).
 */
public final class ApiPaths {

    public static final String API_V1 = "/api/v1";
    public static final String AUTH = API_V1 + "/auth";
    public static final String STUDENTS = API_V1 + "/students";
    public static final String STUDENT_ME = STUDENTS + "/me";

    /** Sprint 1 paths (backward compatible) */
    public static final String LEGACY_AUTH = "/api/auth";
    public static final String LEGACY_STUDENT = "/api/student";

    private ApiPaths() {
    }
}
