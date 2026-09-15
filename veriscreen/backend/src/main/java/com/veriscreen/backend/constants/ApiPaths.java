package com.veriscreen.backend.constants;

/**
 * Central definition of REST API paths (API-first, versioned).
 */
public final class ApiPaths {

    public static final String API_V1 = "/api/v1";
    public static final String AUTH = API_V1 + "/auth";
    public static final String STUDENTS = API_V1 + "/students";
    public static final String STUDENT_ME = STUDENTS + "/me";
    public static final String ADMIN_SYNC = API_V1 + "/admin/sync";

    /** Sprint 1 paths (backward compatible) */
    public static final String LEGACY_AUTH = "/api/auth";
    public static final String LEGACY_STUDENT = "/api/student";

<<<<<<< HEAD:veriscreen/backend/src/main/java/com/veriscreen/backend/constants/ApiPaths.java
    /** Public document verification (no student PII) */
    public static final String VERIFY = "/api/verify";

    /** Internal system-to-system callbacks */
    public static final String INTERNAL_HELSB = API_V1 + "/internal/helsb";

=======
>>>>>>> 8b452b7f50d2ea25c209b6f89403623c1d980c82:backend/src/main/java/com/veriscreen/backend/constants/ApiPaths.java
    private ApiPaths() {
    }
}
