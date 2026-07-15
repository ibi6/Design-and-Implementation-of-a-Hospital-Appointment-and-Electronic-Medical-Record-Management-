package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class Dtos {
    private Dtos() {}

    @Data
    public static class LoginRequest {
        @NotBlank(message = "用户名不能为空")
        private String username;
        @NotBlank(message = "密码不能为空")
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "用户名不能为空")
        private String username;
        @NotBlank(message = "密码不能为空")
        @Size(min = 6, message = "密码至少 6 位")
        private String password;
        @NotBlank(message = "姓名不能为空")
        private String realName;
        @NotBlank(message = "手机号不能为空")
        private String phone;
    }

    @Data
    public static class UserPublic {
        private String id;
        private String username;
        private String realName;
        private String phone;
        private String role;
        private String status;
        private String avatarUrl;
        private String createdAt;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private UserPublic user;
    }

    @Data
    public static class DepartmentRequest {
        private String id;
        @NotBlank(message = "科室名称不能为空")
        private String name;
        private String description;
        private Integer sortOrder;
        private String status;
    }

    @Data
    public static class DepartmentVO {
        private String id;
        private String name;
        private String description;
        private Integer sortOrder;
        private String status;
    }

    @Data
    public static class DoctorRequest {
        private String id;
        private String username;
        private String password;
        @NotBlank(message = "姓名不能为空")
        private String realName;
        @NotBlank(message = "手机号不能为空")
        private String phone;
        @NotBlank(message = "科室不能为空")
        private String departmentId;
        @NotBlank(message = "职称不能为空")
        private String title;
        @NotBlank(message = "擅长不能为空")
        private String specialty;
        private String introduction;
        private String status;
    }

    @Data
    public static class DoctorVO {
        private String id;
        private String userId;
        private String departmentId;
        private String title;
        private String specialty;
        private String introduction;
        private String status;
        private String realName;
        private String phone;
        private String departmentName;
    }

    @Data
    public static class ScheduleRequest {
        private String id;
        @NotBlank(message = "医生不能为空")
        private String doctorId;
        @NotNull(message = "日期不能为空")
        private LocalDate workDate;
        @NotBlank(message = "时段不能为空")
        private String timeSlot;
        @NotNull(message = "号源总数不能为空")
        private Integer totalQuota;
    }

    @Data
    public static class ScheduleVO {
        private String id;
        private String doctorId;
        private String workDate;
        private String timeSlot;
        private Integer totalQuota;
        private Integer reservedCount;
        private String status;
    }

    @Data
    public static class AppointmentCreateRequest {
        @NotBlank(message = "号源不能为空")
        private String scheduleId;
        private String symptomNote;
    }

    @Data
    public static class AppointmentVO {
        private String id;
        private String appointmentNo;
        private String patientId;
        private String doctorId;
        private String scheduleId;
        private String departmentId;
        private String status;
        private String symptomNote;
        private String createdAt;
        private String cancelledAt;
        private String patientName;
        private String doctorName;
        private String departmentName;
        private String workDate;
        private String timeSlot;
        private String doctorTitle;
    }

    @Data
    public static class RecordCreateRequest {
        @NotBlank(message = "预约不能为空")
        private String appointmentId;
        @NotBlank(message = "主诉不能为空")
        private String chiefComplaint;
        private String presentIllness;
        private String physicalExam;
        @NotBlank(message = "诊断不能为空")
        private String diagnosis;
        private String treatment;
        private String prescription;
    }

    @Data
    public static class RecordVO {
        private String id;
        private String recordNo;
        private String appointmentId;
        private String patientId;
        private String doctorId;
        private String chiefComplaint;
        private String presentIllness;
        private String physicalExam;
        private String diagnosis;
        private String treatment;
        private String prescription;
        private String createdAt;
        private String updatedAt;
        private String patientName;
        private String doctorName;
        private String departmentName;
        private String appointmentNo;
        private String workDate;
    }

    @Data
    public static class UserStatusRequest {
        @NotBlank
        private String status;
    }

    @Data
    public static class StatsOverview {
        private long userCount;
        private long doctorCount;
        private long departmentCount;
        private long todayAppointments;
        private long pendingCount;
        private long completedCount;
        private long cancelledCount;
    }

    public static String id(Long id) {
        return id == null ? null : String.valueOf(id);
    }

    public static Long parseId(String id) {
        if (id == null || id.isBlank()) return null;
        return Long.valueOf(id);
    }

    public static String dt(LocalDateTime t) {
        return t == null ? null : t.toString();
    }

    public static String d(LocalDate d) {
        return d == null ? null : d.toString();
    }
}
