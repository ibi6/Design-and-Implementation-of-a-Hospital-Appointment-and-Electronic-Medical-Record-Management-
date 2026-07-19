package com.hospital.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hospital.common.BizException;
import com.hospital.dto.Dtos;
import com.hospital.entity.Schedule;
import com.hospital.mapper.ScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ScheduleMapper scheduleMapper;
    private final DoctorService doctorService;

    public List<Dtos.ScheduleVO> list(String doctorId, LocalDate fromDate) {
        LocalDate from = fromDate == null ? LocalDate.now() : fromDate;
        LambdaQueryWrapper<Schedule> q = new LambdaQueryWrapper<Schedule>()
                .eq(Schedule::getStatus, "ACTIVE")
                .ge(Schedule::getWorkDate, from)
                .orderByAsc(Schedule::getWorkDate)
                .orderByAsc(Schedule::getTimeSlot);
        if (doctorId != null && !doctorId.isBlank()) {
            q.eq(Schedule::getDoctorId, Dtos.parseId(doctorId));
        }
        return scheduleMapper.selectList(q).stream().map(this::toVO).toList();
    }

    public Schedule require(Long id) {
        Schedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) throw new BizException("号源不存在");
        return schedule;
    }

    @Transactional
    public Dtos.ScheduleVO save(Dtos.ScheduleRequest req) {
        Long requestedDoctorId = Dtos.parseId(req.getDoctorId());
        doctorService.requireEntity(requestedDoctorId);
        LocalDateTime now = LocalDateTime.now();
        if (req.getId() != null && !req.getId().isBlank()) {
            Schedule schedule = require(Dtos.parseId(req.getId()));
            if (req.getTotalQuota() < schedule.getReservedCount()) {
                throw new BizException("号源总数不能小于已预约数");
            }
            boolean slotChanged = !schedule.getDoctorId().equals(requestedDoctorId)
                    || !schedule.getWorkDate().equals(req.getWorkDate())
                    || !schedule.getTimeSlot().equals(req.getTimeSlot());
            if (schedule.getReservedCount() > 0 && slotChanged) {
                throw new BizException("已有预约的排班不能修改医生、日期或时段");
            }
            Long duplicate = scheduleMapper.selectCount(new LambdaQueryWrapper<Schedule>()
                    .eq(Schedule::getDoctorId, requestedDoctorId)
                    .eq(Schedule::getWorkDate, req.getWorkDate())
                    .eq(Schedule::getTimeSlot, req.getTimeSlot())
                    .eq(Schedule::getStatus, "ACTIVE")
                    .ne(Schedule::getId, schedule.getId()));
            if (duplicate != null && duplicate > 0) {
                throw new BizException("该医生此时段已有排班");
            }
            schedule.setDoctorId(requestedDoctorId);
            schedule.setWorkDate(req.getWorkDate());
            schedule.setTimeSlot(req.getTimeSlot());
            schedule.setTotalQuota(req.getTotalQuota());
            schedule.setUpdatedAt(now);
            scheduleMapper.updateById(schedule);
            return toVO(schedule);
        }
        Long exists = scheduleMapper.selectCount(new LambdaQueryWrapper<Schedule>()
                .eq(Schedule::getDoctorId, requestedDoctorId)
                .eq(Schedule::getWorkDate, req.getWorkDate())
                .eq(Schedule::getTimeSlot, req.getTimeSlot())
                .eq(Schedule::getStatus, "ACTIVE"));
        if (exists != null && exists > 0) throw new BizException("该医生此时段已有排班");

        Schedule schedule = new Schedule();
        schedule.setDoctorId(requestedDoctorId);
        schedule.setWorkDate(req.getWorkDate());
        schedule.setTimeSlot(req.getTimeSlot());
        schedule.setTotalQuota(req.getTotalQuota());
        schedule.setReservedCount(0);
        schedule.setStatus("ACTIVE");
        schedule.setCreatedAt(now);
        schedule.setUpdatedAt(now);
        scheduleMapper.insert(schedule);
        return toVO(schedule);
    }

    public Dtos.ScheduleVO toVO(Schedule schedule) {
        Dtos.ScheduleVO vo = new Dtos.ScheduleVO();
        vo.setId(Dtos.id(schedule.getId()));
        vo.setDoctorId(Dtos.id(schedule.getDoctorId()));
        vo.setWorkDate(Dtos.d(schedule.getWorkDate()));
        vo.setTimeSlot(schedule.getTimeSlot());
        vo.setTotalQuota(schedule.getTotalQuota());
        vo.setReservedCount(schedule.getReservedCount());
        vo.setStatus(schedule.getStatus());
        return vo;
    }
}
