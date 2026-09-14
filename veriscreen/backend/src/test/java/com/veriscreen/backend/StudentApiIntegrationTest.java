package com.veriscreen.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class StudentApiIntegrationTest {

    private static final String STUDENT_ID = "2021465934";
    private static final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void loginAndGetProfile() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(get("/api/v1/students/me/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(STUDENT_ID))
                .andExpect(jsonPath("$.name").value("Samuel Chibinji Mwanza"));
    }

    @Test
    void protectedRouteWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/students/me/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cannotAccessAnotherStudentsProfile() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(get("/api/v1/students/9999999999/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void screeningEndpointsReturnSeededData() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(get("/api/v1/students/me/registrations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));

        mockMvc.perform(get("/api/v1/students/me/fees")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        mockMvc.perform(get("/api/v1/students/me/examinations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/v1/students/me/academic-results")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));

        mockMvc.perform(get("/api/v1/students/me/helsb")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].applicationStatus").value("APPROVED"));
    }

    @Test
    void documentsIncludeDbBackedSummaries() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(get("/api/v1/students/me/documents")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].summary").isNotEmpty())
                .andExpect(jsonPath("$[1].summary").isNotEmpty());
    }

    @Test
    void generateDownloadAndVerifyOfficialDocument() throws Exception {
        String token = loginAndGetToken();

        MvcResult generateResult = mockMvc.perform(post("/api/v1/students/me/documents/generate/confirmation")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentId").isNotEmpty())
                .andExpect(jsonPath("$.documentType").value("CONFIRMATION_SLIP"))
                .andExpect(jsonPath("$.status").value("VALID"))
                .andReturn();

        String documentId = objectMapper.readTree(generateResult.getResponse().getContentAsString())
                .get("documentId")
                .asText();

        mockMvc.perform(get("/api/v1/students/me/documents/" + documentId + "/download")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    byte[] body = result.getResponse().getContentAsByteArray();
                    if (body.length < 5 || body[0] != '%' || body[1] != 'P' || body[2] != 'D' || body[3] != 'F') {
                        throw new AssertionError("Expected a PDF response");
                    }
                });

        mockMvc.perform(get("/api/verify/" + documentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.documentId").value(documentId))
                .andExpect(jsonPath("$.documentType").value("CONFIRMATION_SLIP"))
                .andExpect(jsonPath("$.status").value("VALID"))
                .andExpect(jsonPath("$.studentName").doesNotExist())
                .andExpect(jsonPath("$.studentNumber").doesNotExist());

        mockMvc.perform(get("/api/verify/VS-2026-RES-999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.status").value("INVALID"));

        for (String type : new String[] {"results", "examination", "payment-history"}) {
            mockMvc.perform(post("/api/v1/students/me/documents/generate/" + type)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.documentId").isNotEmpty())
                    .andExpect(jsonPath("$.status").value("VALID"));
        }
    }

    @Test
    void cannotDownloadAnotherStudentsOfficialDocument() throws Exception {
        String token = loginAndGetToken();

        MvcResult generateResult = mockMvc.perform(post("/api/v1/students/me/documents/generate/results")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        String documentId = objectMapper.readTree(generateResult.getResponse().getContentAsString())
                .get("documentId")
                .asText();

        MvcResult otherLogin = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"2022030346\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        String otherToken = objectMapper.readTree(otherLogin.getResponse().getContentAsString())
                .get("accessToken")
                .asText();

        mockMvc.perform(get("/api/v1/students/me/documents/" + documentId + "/download")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }

    private String loginAndGetToken() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"" + STUDENT_ID + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode response = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return response.get("accessToken").asText();
    }
}
