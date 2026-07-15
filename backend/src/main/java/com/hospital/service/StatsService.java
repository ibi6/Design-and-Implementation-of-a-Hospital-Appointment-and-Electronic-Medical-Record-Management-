package com.hospital.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hospital.dto.Dtos;
import com.hospital.entity.Appointment;
import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.Schedule;
import com.hospital.entity.SysUser;
import com.hospital.mapper.AppointmentMapper;
import com.hospital.mapper.DepartmentMapper;
import com.hospital.mapper.DoctorMapper;
import com.hospital.mapper.ScheduleMapper;
import com.hospital.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {
    private final SysUserMapper userMapper;
    private final DoctorMapper doctorMapper;
    private final DepartmentMapper departmentMapper;
    private final AppointmentMapper appointmentMapper;
    private final ScheduleMapper scheduleMapper;

    public Dtos.StatsOverview overview() {
        Dtos.StatsOverview vo = new Dtos.StatsOverview();
        vo.setUserCount(userMapper.selectCount(null));
        vo.setDoctorCount(doctorMapper.selectCount(new LambdaQueryWrapper<Doctor>().eq(Doctor::getStatus, "ACTIVE")));
        vo.setDepartmentCount(departmentMapper.selectCount(new LambdaQueryWrapper<Department>().eq(Department::getStatus, "ACTIVE")));
        vo.setPendingCount(appointmentMapper.selectCount(new LambdaQueryWrapper<Appointment>().eq(Appointment::getStatus, "PENDING")));
        vo.setCompletedCount(appointmentMapper.selectCount(new LambdaQueryWrapper<Appointment>().eq(Appointment::getStatus, "COMPLETED")));
        vo.setCancelledCount(appointmentMapper.selectCount(new LambdaQueryWrapper<Appointment>().eq(Appointment::getStatus, "CANCELLED")));

        LocalDate today = LocalDate.now();
        List<Schedule> todaySchedules = scheduleMapper.selectList(new LambdaQueryWrapper<Schedule>().eq(Schedule::getWorkDate, today));
        Set<Long> scheduleIds = todaySchedules.stream().map(Schedule::getId).collect(Collectors.toSet());
        if (scheduleIds.isEmpty()) {
            vo.setTodayAppointments(0);
        } else {
            long todayCount = appointmentMapper.selectList(null).stream()
                    .filter(a -> scheduleIds.contains(a.getScheduleId()))
                    .count();
            vo.setTodayAppointments(todayCount);
        }
        return vo;
    }
}
