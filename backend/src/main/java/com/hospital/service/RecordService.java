package com.hospital.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hospital.common.BizException;
import com.hospital.dto.Dtos;
import com.hospital.entity.*;
import com.hospital.mapper.*;
import com.hospital.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class RecordService {
    private final MedicalRecordMapper recordMapper;
    private final AppointmentMapper appointmentMapper;
    private final ScheduleMapper scheduleMapper;
    private final SysUserMapper userMapper;
    private final DepartmentMapper departmentMapper;
    private final DoctorService doctorService;

    public List<Dtos.RecordVO> list(String patientId, String doctorId) {
        SysUser operator = SecurityUtils.requireUser();
        LambdaQueryWrapper<MedicalRecord> q = new LambdaQueryWrapper<>();

        if ("PATIENT".equals(operator.getRole())) {
            q.eq(MedicalRecord::getPatientId, operator.getId());
        } else if ("DOCTOR".equals(operator.getRole())) {
            Doctor me = doctorService.requireByUserId(operator.getId());
            q.eq(MedicalRecord::getDoctorId, me.getId());
            if (patientId != null && !patientId.isBlank()) {
                q.eq(MedicalRecord::getPatientId, Dtos.parseId(patientId));
            }
        } else if ("ADMIN".equals(operator.getRole())) {
            if (patientId != null && !patientId.isBlank()) {
                q.eq(MedicalRecord::getPatientId, Dtos.parseId(patientId));
            }
            if (doctorId != null && !doctorId.isBlank()) {
                q.eq(MedicalRecord::getDoctorId, Dtos.parseId(doctorId));
            }
        } else {
            throw new BizException(403, "无权限访问");
        }

        q.orderByDesc(MedicalRecord::getCreatedAt);
        return recordMapper.selectList(q).stream().map(this::toVO).toList();
    }

    public Dtos.RecordVO get(Long id) {
        MedicalRecord rec = recordMapper.selectById(id);
        if (rec == null) throw new BizException("病历不存在");
        assertCanView(rec);
        return toVO(rec);
    }

    public Dtos.RecordVO getByAppointment(Long appointmentId) {
        MedicalRecord rec = recordMapper.selectOne(new LambdaQueryWrapper<MedicalRecord>()
                .eq(MedicalRecord::getAppointmentId, appointmentId));
        if (rec == null) return null;
        assertCanView(rec);
        return toVO(rec);
    }

    @Transactional
    public Dtos.RecordVO create(Dtos.RecordCreateRequest req) {
        SysUser operator = SecurityUtils.requireUser();
        Appointment apt = appointmentMapper.selectById(Dtos.parseId(req.getAppointmentId()));
        if (apt == null) throw new BizException("预约不存在");
        if (!"PENDING".equals(apt.getStatus())) throw new BizException("该预约不可接诊");

        Doctor doctor = doctorService.requireEntity(apt.getDoctorId());
        if (!"ADMIN".equals(operator.getRole()) && !doctor.getUserId().equals(operator.getId())) {
            throw new BizException(403, "无权操作该预约");
        }
        Long exists = recordMapper.selectCount(new LambdaQueryWrapper<MedicalRecord>()
                .eq(MedicalRecord::getAppointmentId, apt.getId()));
        if (exists != null && exists > 0) throw new BizException("病历已存在");

        if (appointmentMapper.completePending(apt.getId()) != 1) {
            throw new BizException(409, "预约状态已变更，请刷新后重试");
        }

        LocalDateTime now = LocalDateTime.now();
        MedicalRecord rec = new MedicalRecord();
        rec.setRecordNo(genNo("MR"));
        rec.setAppointmentId(apt.getId());
        rec.setPatientId(apt.getPatientId());
        rec.setDoctorId(doctor.getId());
        rec.setChiefComplaint(req.getChiefComplaint().trim());
        rec.setPresentIllness(nullToEmpty(req.getPresentIllness()));
        rec.setPhysicalExam(nullToEmpty(req.getPhysicalExam()));
        rec.setDiagnosis(req.getDiagnosis().trim());
        rec.setTreatment(nullToEmpty(req.getTreatment()));
        rec.setPrescription(nullToEmpty(req.getPrescription()));
        rec.setCreatedAt(now);
        rec.setUpdatedAt(now);
        recordMapper.insert(rec);

        return toVO(rec);
    }

    private void assertCanView(MedicalRecord rec) {
        SysUser operator = SecurityUtils.requireUser();
        if ("ADMIN".equals(operator.getRole())) return;
        if ("PATIENT".equals(operator.getRole()) && rec.getPatientId().equals(operator.getId())) return;
        if ("DOCTOR".equals(operator.getRole())) {
            Doctor me = doctorService.requireByUserId(operator.getId());
            if (rec.getDoctorId().equals(me.getId())) return;
        }
        throw new BizException(403, "无权查看该病历");
    }

    public Dtos.RecordVO toVO(MedicalRecord rec) {
        SysUser patient = userMapper.selectById(rec.getPatientId());
        Doctor doctor = doctorService.requireEntity(rec.getDoctorId());
        SysUser doctorUser = userMapper.selectById(doctor.getUserId());
        Department dep = departmentMapper.selectById(doctor.getDepartmentId());
        Appointment apt = appointmentMapper.selectById(rec.getAppointmentId());
        Schedule schedule = apt == null ? null : scheduleMapper.selectById(apt.getScheduleId());

        Dtos.RecordVO vo = new Dtos.RecordVO();
        vo.setId(Dtos.id(rec.getId()));
        vo.setRecordNo(rec.getRecordNo());
        vo.setAppointmentId(Dtos.id(rec.getAppointmentId()));
        vo.setPatientId(Dtos.id(rec.getPatientId()));
        vo.setDoctorId(Dtos.id(rec.getDoctorId()));
        vo.setChiefComplaint(rec.getChiefComplaint());
        vo.setPresentIllness(rec.getPresentIllness());
        vo.setPhysicalExam(rec.getPhysicalExam());
        vo.setDiagnosis(rec.getDiagnosis());
        vo.setTreatment(rec.getTreatment());
        vo.setPrescription(rec.getPrescription());
        vo.setCreatedAt(Dtos.dt(rec.getCreatedAt()));
        vo.setUpdatedAt(Dtos.dt(rec.getUpdatedAt()));
        vo.setPatientName(patient == null ? "未知患者" : patient.getRealName());
        vo.setDoctorName(doctorUser == null ? "未知医生" : doctorUser.getRealName());
        vo.setDepartmentName(dep == null ? "未知科室" : dep.getName());
        vo.setAppointmentNo(apt == null ? "" : apt.getAppointmentNo());
        vo.setWorkDate(schedule == null ? null : Dtos.d(schedule.getWorkDate()));
        return vo;
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s.trim();
    }

    private String genNo(String prefix) {
        String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int r = ThreadLocalRandom.current().nextInt(1000, 9999);
        return prefix + stamp + r;
    }
}
