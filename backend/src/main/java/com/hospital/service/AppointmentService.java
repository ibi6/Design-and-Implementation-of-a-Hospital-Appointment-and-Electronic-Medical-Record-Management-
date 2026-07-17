package com.hospital.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hospital.common.BizException;
import com.hospital.dto.Dtos;
import com.hospital.entity.*;
import com.hospital.mapper.AppointmentMapper;
import com.hospital.mapper.DepartmentMapper;
import com.hospital.mapper.ScheduleMapper;
import com.hospital.mapper.SysUserMapper;
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
public class AppointmentService {
    private final AppointmentMapper appointmentMapper;
    private final ScheduleMapper scheduleMapper;
    private final SysUserMapper userMapper;
    private final DepartmentMapper departmentMapper;
    private final DoctorService doctorService;

    public List<Dtos.AppointmentVO> list(String patientId, String doctorId, String status) {
        SysUser operator = SecurityUtils.requireUser();
        LambdaQueryWrapper<Appointment> q = new LambdaQueryWrapper<>();

        if ("PATIENT".equals(operator.getRole())) {
            q.eq(Appointment::getPatientId, operator.getId());
        } else if ("DOCTOR".equals(operator.getRole())) {
            Doctor me = doctorService.requireByUserId(operator.getId());
            q.eq(Appointment::getDoctorId, me.getId());
            if (patientId != null && !patientId.isBlank()) {
                q.eq(Appointment::getPatientId, Dtos.parseId(patientId));
            }
        } else if ("ADMIN".equals(operator.getRole())) {
            if (patientId != null && !patientId.isBlank()) {
                q.eq(Appointment::getPatientId, Dtos.parseId(patientId));
            }
            if (doctorId != null && !doctorId.isBlank()) {
                q.eq(Appointment::getDoctorId, Dtos.parseId(doctorId));
            }
        } else {
            throw new BizException(403, "无权限访问");
        }

        if (status != null && !status.isBlank() && !"ALL".equals(status)) {
            q.eq(Appointment::getStatus, status);
        }
        q.orderByDesc(Appointment::getCreatedAt);
        return appointmentMapper.selectList(q).stream().map(this::toVO).toList();
    }

    public Dtos.AppointmentVO get(Long id) {
        Appointment apt = appointmentMapper.selectById(id);
        if (apt == null) throw new BizException("预约不存在");
        assertCanView(apt);
        return toVO(apt);
    }

    @Transactional
    public Dtos.AppointmentVO create(Dtos.AppointmentCreateRequest req) {
        SysUser patient = SecurityUtils.requireUser();
        if (!"PATIENT".equals(patient.getRole())) {
            throw new BizException(403, "仅患者可预约");
        }
        Long patientId = patient.getId();
        Schedule schedule = scheduleMapper.selectForUpdate(Dtos.parseId(req.getScheduleId()));
        if (schedule == null || !"ACTIVE".equals(schedule.getStatus())) {
            throw new BizException("号源不存在或已停用");
        }
        Long dup = appointmentMapper.selectCount(new LambdaQueryWrapper<Appointment>()
                .eq(Appointment::getPatientId, patientId)
                .eq(Appointment::getScheduleId, schedule.getId())
                .eq(Appointment::getStatus, "PENDING"));
        if (dup != null && dup > 0) throw new BizException("您已预约该时段，请勿重复预约");

        LocalDateTime now = LocalDateTime.now();
        if (scheduleMapper.reserveQuota(schedule.getId(), now) != 1) {
            throw new BizException("该时段号源已满或已停用");
        }

        Doctor doctor = doctorService.requireEntity(schedule.getDoctorId());
        Appointment apt = new Appointment();
        apt.setAppointmentNo(genNo("AP"));
        apt.setPatientId(patientId);
        apt.setDoctorId(doctor.getId());
        apt.setScheduleId(schedule.getId());
        apt.setDepartmentId(doctor.getDepartmentId());
        apt.setStatus("PENDING");
        apt.setSymptomNote(req.getSymptomNote() == null ? "" : req.getSymptomNote().trim());
        apt.setCreatedAt(now);
        appointmentMapper.insert(apt);

        return toVO(apt);
    }

    @Transactional
    public Dtos.AppointmentVO cancel(Long id) {
        SysUser operator = SecurityUtils.requireUser();
        Appointment apt = appointmentMapper.selectById(id);
        if (apt == null) throw new BizException("预约不存在");
        if (!"PENDING".equals(apt.getStatus())) throw new BizException("仅待就诊预约可取消");
        if ("PATIENT".equals(operator.getRole()) && !apt.getPatientId().equals(operator.getId())) {
            throw new BizException(403, "无权取消他人预约");
        }
        if ("DOCTOR".equals(operator.getRole())) {
            Doctor me = doctorService.requireByUserId(operator.getId());
            if (!apt.getDoctorId().equals(me.getId())) {
                throw new BizException(403, "无权取消他人预约");
            }
        }
        LocalDateTime now = LocalDateTime.now();
        if (appointmentMapper.cancelPending(apt.getId(), now) != 1) {
            throw new BizException(409, "预约状态已变更，请刷新后重试");
        }

        if (scheduleMapper.releaseQuota(apt.getScheduleId(), now) != 1) {
            throw new BizException(409, "号源计数异常，请联系管理员");
        }
        apt.setStatus("CANCELLED");
        apt.setCancelledAt(now);
        return toVO(apt);
    }

    private void assertCanView(Appointment apt) {
        SysUser operator = SecurityUtils.requireUser();
        if ("ADMIN".equals(operator.getRole())) return;
        if ("PATIENT".equals(operator.getRole()) && apt.getPatientId().equals(operator.getId())) return;
        if ("DOCTOR".equals(operator.getRole())) {
            Doctor me = doctorService.requireByUserId(operator.getId());
            if (apt.getDoctorId().equals(me.getId())) return;
        }
        throw new BizException(403, "无权查看该预约");
    }

    public Dtos.AppointmentVO toVO(Appointment apt) {
        SysUser patient = userMapper.selectById(apt.getPatientId());
        Doctor doctor = doctorService.requireEntity(apt.getDoctorId());
        SysUser doctorUser = userMapper.selectById(doctor.getUserId());
        Department dep = departmentMapper.selectById(apt.getDepartmentId());
        Schedule schedule = scheduleMapper.selectById(apt.getScheduleId());

        Dtos.AppointmentVO vo = new Dtos.AppointmentVO();
        vo.setId(Dtos.id(apt.getId()));
        vo.setAppointmentNo(apt.getAppointmentNo());
        vo.setPatientId(Dtos.id(apt.getPatientId()));
        vo.setDoctorId(Dtos.id(apt.getDoctorId()));
        vo.setScheduleId(Dtos.id(apt.getScheduleId()));
        vo.setDepartmentId(Dtos.id(apt.getDepartmentId()));
        vo.setStatus(apt.getStatus());
        vo.setSymptomNote(apt.getSymptomNote());
        vo.setCreatedAt(Dtos.dt(apt.getCreatedAt()));
        vo.setCancelledAt(Dtos.dt(apt.getCancelledAt()));
        vo.setPatientName(patient == null ? "未知患者" : patient.getRealName());
        vo.setDoctorName(doctorUser == null ? "未知医生" : doctorUser.getRealName());
        vo.setDepartmentName(dep == null ? "未知科室" : dep.getName());
        vo.setWorkDate(schedule == null ? "" : Dtos.d(schedule.getWorkDate()));
        vo.setTimeSlot(schedule == null ? "MORNING" : schedule.getTimeSlot());
        vo.setDoctorTitle(doctor.getTitle());
        return vo;
    }

    private String genNo(String prefix) {
        String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int r = ThreadLocalRandom.current().nextInt(1000, 9999);
        return prefix + stamp + r;
    }
}
