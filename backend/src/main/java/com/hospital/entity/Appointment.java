package com.hospital.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("appointment")
public class Appointment {
    @TableId
    private Long id;
    private String appointmentNo;
    private Long patientId;
    private Long doctorId;
    private Long scheduleId;
    private Long departmentId;
    private String status;
    private String symptomNote;
    private LocalDateTime createdAt;
    private LocalDateTime cancelledAt;
    @TableLogic
    private Integer deleted;
}
