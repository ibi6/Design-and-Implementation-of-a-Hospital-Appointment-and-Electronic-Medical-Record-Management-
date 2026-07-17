package com.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class Dtos {
    private Dtos() {}

    @Data
    public static class LoginRequest {
        @NotBlank(message = "用户名不能为空")
        @Size(max = 64, message = "用户名不能超过 64 位")
        private String username;
        @NotBlank(message = "密码不能为空")
        @Size(max = 72, message = "密码不能超过 72 位")
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "用户名不能为空")
        @Pattern(regexp = "^[A-Za-z0-9_-]{3,32}$", message = "用户名须为 3-32 位字母、数字、下划线或短横线")
        private String username;
        @NotBlank(message = "密码不能为空")
        @Size(min = 6, max = 72, message = "密码须为 6-72 位")
        private String password;
        @NotBlank(message = "姓名不能为空")
        @Size(min = 2, max = 32, message = "姓名须为 2-32 位")
        private String realName;
        @NotBlank(message = "手机号不能为空")
        @Pattern(regexp = "^1[3-9]\\d{9}$", message = "请输入有效的 11 位手机号")
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
        @Size(max = 64, message = "科室名称不能超过 64 位")
        private String name;
        @Size(max = 512, message = "科室描述不能超过 512 位")
        private String description;
        @Min(value = 0, message = "排序值不能小于 0")
        private Integer sortOrder;
        @Pattern(regexp = "ACTIVE|DISABLED", message = "状态无效")
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
        @Pattern(regexp = "^$|^.{6,72}$", message = "密码须为 6-72 位")
        private String password;
        @NotBlank(message = "姓名不能为空")
        @Size(max = 32, message = "姓名不能超过 32 位")
        private String realName;
        @NotBlank(message = "手机号不能为空")
        @Pattern(regexp = "^1[3-9]\\d{9}$", message = "请输入有效的 11 位手机号")
        private String phone;
        @NotBlank(message = "科室不能为空")
        private String departmentId;
        @NotBlank(message = "职称不能为空")
        @Size(max = 64, message = "职称不能超过 64 位")
        private String title;
        @NotBlank(message = "擅长不能为空")
        @Size(max = 255, message = "擅长描述不能超过 255 位")
        private String specialty;
        @Size(max = 1024, message = "医生简介不能超过 1024 位")
        private String introduction;
        @Pattern(regexp = "ACTIVE|DISABLED", message = "状态无效")
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
        @FutureOrPresent(message = "排班日期不能早于今天")
        private LocalDate workDate;
        @NotBlank(message = "时段不能为空")
        @Pattern(regexp = "MORNING|AFTERNOON", message = "排班时段无效")
        private String timeSlot;
        @NotNull(message = "号源总数不能为空")
        @Min(value = 1, message = "号源总数至少为 1")
        @Max(value = 500, message = "号源总数不能超过 500")
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
        @Size(max = 512, message = "症状描述不能超过 512 位")
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
        @Size(max = 512, message = "主诉不能超过 512 位")
        private String chiefComplaint;
        @Size(max = 1024, message = "现病史不能超过 1024 位")
        private String presentIllness;
        @Size(max = 1024, message = "体格检查不能超过 1024 位")
        private String physicalExam;
        @NotBlank(message = "诊断不能为空")
        @Size(max = 512, message = "诊断不能超过 512 位")
        private String diagnosis;
        @Size(max = 1024, message = "处理意见不能超过 1024 位")
        private String treatment;
        @Size(max = 1024, message = "处方说明不能超过 1024 位")
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
        @Pattern(regexp = "ACTIVE|DISABLED", message = "状态无效")
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
