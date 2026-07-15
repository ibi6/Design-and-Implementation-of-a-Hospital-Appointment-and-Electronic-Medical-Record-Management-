package com.hospital.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("medical_record")
public class MedicalRecord {
    @TableId
    private Long id;
    private String recordNo;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String chiefComplaint;
    private String presentIllness;
    private String physicalExam;
    private String diagnosis;
    private String treatment;
    private String prescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
