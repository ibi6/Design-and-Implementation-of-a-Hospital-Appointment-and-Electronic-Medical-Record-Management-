package com.hospital;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CoreApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String login(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"%s"}
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("token").asText();
    }

    private JsonNode body(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    @Test
    @Order(1)
    void loginSuccessAndFail() throws Exception {
        login("patient", "123456");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"patient","password":"wrong"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @Order(2)
    void patientCannotAccessAdminUsers() throws Exception {
        String token = login("patient", "123456");
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @Order(3)
    void patientOnlySeesOwnAppointments() throws Exception {
        String patientToken = login("patient", "123456");
        String patient2Token = login("patient2", "123456");

        JsonNode me2 = body(mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + patient2Token))
                .andExpect(status().isOk())
                .andReturn()).path("data");
        String patient2Id = me2.path("id").asText();

        JsonNode cross = body(mockMvc.perform(get("/api/appointments")
                        .param("patientId", patient2Id)
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andReturn()).path("data");

        assertThat(cross.isArray()).isTrue();
        for (JsonNode item : cross) {
            assertThat(item.path("patientId").asText()).isNotEqualTo(patient2Id);
        }
    }

    @Test
    @Order(4)
    void appointmentAndMedicalRecordFlow() throws Exception {
        String patientToken = login("patient", "123456");
        String doctorToken = login("doctor", "123456");

        JsonNode doctors = body(mockMvc.perform(get("/api/doctors")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andReturn()).path("data");
        assertThat(doctors.size()).isGreaterThan(0);
        String doctorId = doctors.get(0).path("id").asText();

        JsonNode schedules = body(mockMvc.perform(get("/api/schedules")
                        .param("doctorId", doctorId)
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andReturn()).path("data");
        assertThat(schedules.size()).isGreaterThan(0);

        String scheduleId = null;
        for (JsonNode s : schedules) {
            if (s.path("reservedCount").asInt() < s.path("totalQuota").asInt()) {
                scheduleId = s.path("id").asText();
                break;
            }
        }
        assertThat(scheduleId).isNotBlank();

        JsonNode apt = body(mockMvc.perform(post("/api/appointments")
                        .header("Authorization", "Bearer " + patientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"scheduleId":"%s","symptomNote":"integration test"}
                                """.formatted(scheduleId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn()).path("data");
        String appointmentId = apt.path("id").asText();

        mockMvc.perform(post("/api/records")
                        .header("Authorization", "Bearer " + doctorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "appointmentId":"%s",
                                  "chiefComplaint":"cough",
                                  "presentIllness":"2 days",
                                  "physicalExam":"ok",
                                  "diagnosis":"URI",
                                  "treatment":"rest",
                                  "prescription":"vitamin C"
                                }
                                """.formatted(appointmentId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.recordNo").isNotEmpty());

        mockMvc.perform(get("/api/appointments/" + appointmentId)
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    @Order(5)
    void adminStatsAvailable() throws Exception {
        String adminToken = login("admin", "123456");
        mockMvc.perform(get("/api/stats/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.userCount").isNumber());
    }
}
