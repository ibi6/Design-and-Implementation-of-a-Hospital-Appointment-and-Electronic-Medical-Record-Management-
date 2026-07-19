package com.hospital;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.config.DataSeeder;
import com.hospital.entity.Appointment;
import com.hospital.entity.Schedule;
import com.hospital.mapper.AppointmentMapper;
import com.hospital.mapper.ScheduleMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
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

    @Autowired
    private ScheduleMapper scheduleMapper;

    @Autowired
    private AppointmentMapper appointmentMapper;

    @Autowired
    private DataSeeder dataSeeder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private record CsrfCredentials(Cookie cookie, String token) {}

    private CsrfCredentials csrf() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andExpect(cookie().httpOnly("XSRF-TOKEN", false))
                .andReturn();
        Cookie cookie = result.getResponse().getCookie("XSRF-TOKEN");
        assertThat(cookie).isNotNull();
        String token = body(result).path("data").path("token").asText();
        return new CsrfCredentials(cookie, token);
    }

    private String login(String username, String password) throws Exception {
        CsrfCredentials csrf = csrf();
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token())
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
        CsrfCredentials csrf = csrf();
        mockMvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"patient","password":"wrong"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @Order(2)
    void patientCannotAccessAdminUsers() throws Exception {
        String token = login("patient", "123456");
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
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

    @Test
    @Order(6)
    void browserSessionUsesHttpOnlyCookieAndCsrfProtection() throws Exception {
        CsrfCredentials csrf = csrf();
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"patient","password":"123456"}
                                """))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("hospital_session"))
                .andExpect(cookie().httpOnly("hospital_session", true))
                .andReturn();

        var sessionCookie = loginResult.getResponse().getCookie("hospital_session");
        assertThat(sessionCookie).isNotNull();

        mockMvc.perform(get("/api/auth/me").cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("patient"));

        mockMvc.perform(post("/api/auth/logout").cookie(sessionCookie))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(sessionCookie, csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token()))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("hospital_session", 0));
    }

    @Test
    @Order(7)
    void unauthenticatedRequestUsesHttp401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @Order(8)
    void repeatedLoginFailuresAreRateLimited() throws Exception {
        CsrfCredentials csrf = csrf();
        for (int attempt = 1; attempt <= 5; attempt++) {
            mockMvc.perform(post("/api/auth/login")
                            .cookie(csrf.cookie())
                            .header("X-XSRF-TOKEN", csrf.token())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"username":"rate-limit-probe","password":"wrong-pass"}
                                    """))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value(401));
        }

        mockMvc.perform(post("/api/auth/login")
                        .cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"rate-limit-probe","password":"wrong-pass"}
                                """))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value(429));
    }

    @Test
    @Order(9)
    void rejectsInvalidInputsAndProtectsHospitalStats() throws Exception {
        String patientToken = login("patient", "123456");
        mockMvc.perform(get("/api/stats/overview")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));

        CsrfCredentials csrf = csrf();
        mockMvc.perform(post("/api/auth/register")
                        .cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username":"invalid_phone_probe",
                                  "password":"123456",
                                  "realName":"测试患者",
                                  "phone":"123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        String adminToken = login("admin", "123456");
        JsonNode doctors = body(mockMvc.perform(get("/api/doctors")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn()).path("data");
        String doctorId = doctors.get(0).path("id").asText();

        mockMvc.perform(post("/api/schedules")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "doctorId":"%s",
                                  "workDate":"2099-01-01",
                                  "timeSlot":"EVENING",
                                  "totalQuota":0
                                }
                                """.formatted(doctorId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @Order(10)
    void quotaReservationIsAtomicAndNeverExceedsCapacity() {
        Schedule template = scheduleMapper.selectList(new LambdaQueryWrapper<Schedule>()
                        .eq(Schedule::getStatus, "ACTIVE")
                        .last("LIMIT 1"))
                .stream()
                .findFirst()
                .orElseThrow();

        Schedule probe = new Schedule();
        probe.setDoctorId(template.getDoctorId());
        probe.setWorkDate(LocalDate.now().plusYears(10));
        probe.setTimeSlot("MORNING");
        probe.setTotalQuota(1);
        probe.setReservedCount(0);
        probe.setStatus("ACTIVE");
        probe.setCreatedAt(LocalDateTime.now());
        probe.setUpdatedAt(LocalDateTime.now());
        scheduleMapper.insert(probe);

        assertThat(scheduleMapper.reserveQuota(probe.getId(), LocalDateTime.now())).isEqualTo(1);
        assertThat(scheduleMapper.reserveQuota(probe.getId(), LocalDateTime.now())).isZero();
        assertThat(scheduleMapper.selectById(probe.getId()).getReservedCount()).isEqualTo(1);
    }

    @Test
    @Order(11)
    void existingDemoDatabaseGetsRollingFutureSchedules() throws Exception {
        LocalDate lastDemoDay = LocalDate.now().plusDays(6);
        jdbcTemplate.update("DELETE FROM schedule WHERE work_date = ?", lastDemoDay);
        assertThat(scheduleMapper.selectCount(new LambdaQueryWrapper<Schedule>()
                .eq(Schedule::getWorkDate, lastDemoDay))).isZero();

        dataSeeder.run();

        assertThat(scheduleMapper.selectCount(new LambdaQueryWrapper<Schedule>()
                .eq(Schedule::getWorkDate, lastDemoDay))).isGreaterThan(0);
    }

    @Test
    @Order(12)
    void healthEndpointIsPublicAndMinimal() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.status").value("UP"));
    }

    @Test
    @Order(13)
    void appointmentStateTransitionsAreCompareAndSet() {
        Schedule schedule = scheduleMapper.selectList(new LambdaQueryWrapper<Schedule>()
                        .eq(Schedule::getStatus, "ACTIVE")
                        .last("LIMIT 1"))
                .stream()
                .findFirst()
                .orElseThrow();
        Long patientId = jdbcTemplate.queryForObject(
                "SELECT id FROM sys_user WHERE username = 'patient2'", Long.class);
        Long departmentId = jdbcTemplate.queryForObject(
                "SELECT department_id FROM doctor WHERE id = ?", Long.class, schedule.getDoctorId());

        Appointment cancelProbe = new Appointment();
        cancelProbe.setAppointmentNo("AP-CANCEL-" + System.nanoTime());
        cancelProbe.setPatientId(patientId);
        cancelProbe.setDoctorId(schedule.getDoctorId());
        cancelProbe.setScheduleId(schedule.getId());
        cancelProbe.setDepartmentId(departmentId);
        cancelProbe.setStatus("PENDING");
        cancelProbe.setSymptomNote("state transition probe");
        cancelProbe.setCreatedAt(LocalDateTime.now());
        appointmentMapper.insert(cancelProbe);

        assertThat(appointmentMapper.cancelPending(cancelProbe.getId(), LocalDateTime.now())).isEqualTo(1);
        assertThat(appointmentMapper.cancelPending(cancelProbe.getId(), LocalDateTime.now())).isZero();

        Appointment completeProbe = new Appointment();
        completeProbe.setAppointmentNo("AP-COMPLETE-" + System.nanoTime());
        completeProbe.setPatientId(patientId);
        completeProbe.setDoctorId(schedule.getDoctorId());
        completeProbe.setScheduleId(schedule.getId());
        completeProbe.setDepartmentId(departmentId);
        completeProbe.setStatus("PENDING");
        completeProbe.setSymptomNote("state transition probe");
        completeProbe.setCreatedAt(LocalDateTime.now());
        appointmentMapper.insert(completeProbe);

        assertThat(appointmentMapper.completePending(completeProbe.getId())).isEqualTo(1);
        assertThat(appointmentMapper.cancelPending(completeProbe.getId(), LocalDateTime.now())).isZero();
    }

    @Test
    @Order(14)
    void newDoctorRequiresExplicitValidCredentials() throws Exception {
        String adminToken = login("admin", "123456");
        String departmentId = body(mockMvc.perform(get("/api/departments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn()).path("data").get(0).path("id").asText();

        mockMvc.perform(post("/api/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username":"doctor_without_password",
                                  "realName":"测试医生",
                                  "phone":"13800009991",
                                  "departmentId":"%s",
                                  "title":"主治医师",
                                  "specialty":"常见病诊治",
                                  "status":"ACTIVE"
                                }
                                """.formatted(departmentId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        mockMvc.perform(post("/api/doctors")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username":"x",
                                  "password":"123456",
                                  "realName":"测试医生",
                                  "phone":"13800009992",
                                  "departmentId":"%s",
                                  "title":"主治医师",
                                  "specialty":"常见病诊治",
                                  "status":"ACTIVE"
                                }
                                """.formatted(departmentId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @Order(15)
    void recordLookupChecksAppointmentOwnershipEvenWhenNoRecordExists() throws Exception {
        String patient2Token = login("patient2", "123456");
        Long patientAppointmentWithoutRecord = jdbcTemplate.queryForObject("""
                SELECT a.id
                FROM appointment a
                LEFT JOIN medical_record r ON r.appointment_id = a.id
                WHERE a.patient_id = (SELECT id FROM sys_user WHERE username = 'patient')
                  AND r.id IS NULL
                LIMIT 1
                """, Long.class);

        mockMvc.perform(get("/api/records/by-appointment/" + patientAppointmentWithoutRecord)
                        .header("Authorization", "Bearer " + patient2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    @Order(16)
    void scheduleUpdateProtectsReservedAndDuplicateSlots() throws Exception {
        String adminToken = login("admin", "123456");
        Schedule reserved = scheduleMapper.selectList(new LambdaQueryWrapper<Schedule>()
                        .gt(Schedule::getReservedCount, 0)
                        .last("LIMIT 1"))
                .stream()
                .findFirst()
                .orElseThrow();

        mockMvc.perform(put("/api/schedules/" + reserved.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "doctorId":"%s",
                                  "workDate":"%s",
                                  "timeSlot":"%s",
                                  "totalQuota":%d
                                }
                                """.formatted(
                                        reserved.getDoctorId(),
                                        reserved.getWorkDate().plusYears(20),
                                        reserved.getTimeSlot(),
                                        reserved.getTotalQuota())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        LocalDate duplicateDate = LocalDate.now().plusYears(25);
        Schedule source = schedule(reserved.getDoctorId(), duplicateDate, "MORNING");
        Schedule target = schedule(reserved.getDoctorId(), duplicateDate.plusDays(1), "MORNING");
        scheduleMapper.insert(source);
        scheduleMapper.insert(target);

        mockMvc.perform(put("/api/schedules/" + source.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "doctorId":"%s",
                                  "workDate":"%s",
                                  "timeSlot":"MORNING",
                                  "totalQuota":10
                                }
                                """.formatted(source.getDoctorId(), target.getWorkDate())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    private Schedule schedule(Long doctorId, LocalDate workDate, String timeSlot) {
        Schedule schedule = new Schedule();
        schedule.setDoctorId(doctorId);
        schedule.setWorkDate(workDate);
        schedule.setTimeSlot(timeSlot);
        schedule.setTotalQuota(10);
        schedule.setReservedCount(0);
        schedule.setStatus("ACTIVE");
        schedule.setCreatedAt(LocalDateTime.now());
        schedule.setUpdatedAt(LocalDateTime.now());
        return schedule;
    }
}
