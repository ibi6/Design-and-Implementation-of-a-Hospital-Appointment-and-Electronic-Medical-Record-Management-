package com.hospital.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hospital.entity.*;
import com.hospital.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.demo-data", name = "enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {
    private final SysUserMapper userMapper;
    private final DepartmentMapper departmentMapper;
    private final DoctorMapper doctorMapper;
    private final ScheduleMapper scheduleMapper;
    private final AppointmentMapper appointmentMapper;
    private final MedicalRecordMapper recordMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        Long count = userMapper.selectCount(null);
        if (count == null || count == 0) {
            seed();
        }
        ensureFutureSchedules();
    }

    /**
     * Keeps the demo environment useful over time by filling a rolling seven-day
     * schedule window without changing existing reservations.
     */
    private void ensureFutureSchedules() {
        LocalDateTime now = LocalDateTime.now();
        List<Doctor> activeDoctors = doctorMapper.selectList(new LambdaQueryWrapper<Doctor>()
                .eq(Doctor::getStatus, "ACTIVE"));
        for (Doctor doctor : activeDoctors) {
            for (int day = 0; day < 7; day++) {
                LocalDate workDate = LocalDate.now().plusDays(day);
                for (String slot : List.of("MORNING", "AFTERNOON")) {
                    Long exists = scheduleMapper.selectCount(new LambdaQueryWrapper<Schedule>()
                            .eq(Schedule::getDoctorId, doctor.getId())
                            .eq(Schedule::getWorkDate, workDate)
                            .eq(Schedule::getTimeSlot, slot));
                    if (exists != null && exists > 0) continue;

                    Schedule schedule = new Schedule();
                    schedule.setDoctorId(doctor.getId());
                    schedule.setWorkDate(workDate);
                    schedule.setTimeSlot(slot);
                    schedule.setTotalQuota(10);
                    schedule.setReservedCount(0);
                    schedule.setStatus("ACTIVE");
                    schedule.setCreatedAt(now);
                    schedule.setUpdatedAt(now);
                    scheduleMapper.insert(schedule);
                }
            }
        }
    }

    private void seed() {
        LocalDateTime now = LocalDateTime.now();
        String pwd = passwordEncoder.encode("123456");

        SysUser patient = user("patient", pwd, "张小明", "13800001111", "PATIENT", now);
        SysUser patient2 = user("patient2", pwd, "王芳", "13800001112", "PATIENT", now);
        SysUser doctorUser = user("doctor", pwd, "李华", "13800002222", "DOCTOR", now);
        SysUser doctorUser2 = user("doctor2", pwd, "王强", "13800002223", "DOCTOR", now);
        SysUser doctorUser3 = user("doctor3", pwd, "陈敏", "13800002224", "DOCTOR", now);
        SysUser doctorUser4 = user("doctor4", pwd, "赵雪", "13800002225", "DOCTOR", now);
        SysUser doctorUser5 = user("doctor5", pwd, "刘洋", "13800002226", "DOCTOR", now);
        SysUser doctorUser6 = user("doctor6", pwd, "孙婷", "13800002227", "DOCTOR", now);
        user("admin", pwd, "系统管理员", "13800003333", "ADMIN", now);

        Department d1 = dep("内科", "呼吸、消化、心血管等常见内科疾病诊治", 1, now);
        Department d2 = dep("外科", "普通外科门诊与术前评估", 2, now);
        Department d3 = dep("儿科", "儿童常见病、生长发育咨询", 3, now);
        Department d4 = dep("妇科", "妇科常见病与健康体检", 4, now);
        Department d5 = dep("骨科", "骨关节疼痛、运动损伤", 5, now);
        Department d6 = dep("皮肤科", "皮肤过敏、痤疮、皮炎等", 6, now);

        Doctor doc1 = doctor(doctorUser.getId(), d1.getId(), "主任医师", "高血压、冠心病、慢性胃炎",
                "从事内科临床工作 20 年，擅长慢病综合管理与个性化用药方案。", now);
        Doctor doc2 = doctor(doctorUser2.getId(), d2.getId(), "副主任医师", "疝气、胆囊结石、体表肿物",
                "专注微创外科，注重术后康复指导。", now);
        Doctor doc3 = doctor(doctorUser3.getId(), d3.getId(), "主治医师", "小儿呼吸道感染、消化不良",
                "亲和耐心，擅长与家长沟通儿童护理要点。", now);
        Doctor doc4 = doctor(doctorUser4.getId(), d4.getId(), "副主任医师", "月经不调、妇科炎症",
                "强调规范诊疗与隐私保护。", now);
        Doctor doc5 = doctor(doctorUser5.getId(), d5.getId(), "主治医师", "颈椎病、腰腿痛、运动损伤",
                "结合康复训练给出综合治疗建议。", now);
        Doctor doc6 = doctor(doctorUser6.getId(), d6.getId(), "主治医师", "湿疹、痤疮、荨麻疹",
                "关注皮肤屏障修复与生活方式干预。", now);

        List<Doctor> doctors = List.of(doc1, doc2, doc3, doc4, doc5, doc6);
        List<Schedule> allSchedules = new ArrayList<>();
        for (Doctor doctor : doctors) {
            for (int day = 0; day < 7; day++) {
                for (String slot : List.of("MORNING", "AFTERNOON")) {
                    Schedule s = new Schedule();
                    s.setDoctorId(doctor.getId());
                    s.setWorkDate(LocalDate.now().plusDays(day));
                    s.setTimeSlot(slot);
                    s.setTotalQuota(10);
                    s.setReservedCount(0);
                    s.setStatus("ACTIVE");
                    s.setCreatedAt(now);
                    s.setUpdatedAt(now);
                    scheduleMapper.insert(s);
                    allSchedules.add(s);
                }
            }
        }

        Schedule schPending = allSchedules.stream()
                .filter(s -> s.getDoctorId().equals(doc1.getId()) && s.getWorkDate().equals(LocalDate.now().plusDays(1)) && "MORNING".equals(s.getTimeSlot()))
                .findFirst().orElse(allSchedules.get(0));
        Schedule schCompleted = allSchedules.stream()
                .filter(s -> s.getDoctorId().equals(doc6.getId()) && s.getWorkDate().equals(LocalDate.now()) && "AFTERNOON".equals(s.getTimeSlot()))
                .findFirst().orElse(allSchedules.get(1));
        Schedule schPending2 = allSchedules.stream()
                .filter(s -> s.getDoctorId().equals(doc1.getId()) && s.getWorkDate().equals(LocalDate.now().plusDays(2)) && "AFTERNOON".equals(s.getTimeSlot()))
                .findFirst().orElse(allSchedules.get(2));

        Appointment apt1 = appointment("AP20260711001", patient.getId(), doc1.getId(), schPending.getId(), d1.getId(),
                "PENDING", "最近头晕、血压偏高", now.minusDays(1));
        Appointment apt2 = appointment("AP20260710002", patient.getId(), doc6.getId(), schCompleted.getId(), d6.getId(),
                "COMPLETED", "手臂红疹瘙痒", now.minusDays(3));
        Appointment apt3 = appointment("AP20260711003", patient2.getId(), doc1.getId(), schPending2.getId(), d1.getId(),
                "PENDING", "胃部不适一周", now.minusDays(1));

        schPending.setReservedCount(1);
        scheduleMapper.updateById(schPending);
        schCompleted.setReservedCount(1);
        scheduleMapper.updateById(schCompleted);
        schPending2.setReservedCount(1);
        scheduleMapper.updateById(schPending2);

        MedicalRecord rec = new MedicalRecord();
        rec.setRecordNo("MR20260710001");
        rec.setAppointmentId(apt2.getId());
        rec.setPatientId(patient.getId());
        rec.setDoctorId(doc6.getId());
        rec.setChiefComplaint("双前臂红疹伴瘙痒 3 天");
        rec.setPresentIllness("患者 3 天前接触清洁剂后出现红疹，夜间加重，无发热。");
        rec.setPhysicalExam("双前臂散在红斑丘疹，无破溃，浅表淋巴结未触及肿大。");
        rec.setDiagnosis("接触性皮炎");
        rec.setTreatment("避免刺激物，保持皮肤清洁湿润，口服抗组胺药。");
        rec.setPrescription("氯雷他定片 10mg 每晚一次 × 5 天；炉甘石洗剂外用");
        rec.setCreatedAt(now.minusDays(2));
        rec.setUpdatedAt(now.minusDays(2));
        recordMapper.insert(rec);

        // silence unused warnings for patient2/apt1/apt3 references used above
        LambdaQueryWrapper<SysUser> ignore = new LambdaQueryWrapper<>();
        ignore.eq(SysUser::getUsername, patient2.getUsername());
        userMapper.selectCount(ignore);
        appointmentMapper.selectById(apt1.getId());
        appointmentMapper.selectById(apt3.getId());
    }

    private SysUser user(String username, String pwd, String realName, String phone, String role, LocalDateTime now) {
        SysUser u = new SysUser();
        u.setUsername(username);
        u.setPasswordHash(pwd);
        u.setRealName(realName);
        u.setPhone(phone);
        u.setRole(role);
        u.setStatus("ACTIVE");
        u.setCreatedAt(now);
        u.setUpdatedAt(now);
        userMapper.insert(u);
        return u;
    }

    private Department dep(String name, String desc, int sort, LocalDateTime now) {
        Department d = new Department();
        d.setName(name);
        d.setDescription(desc);
        d.setSortOrder(sort);
        d.setStatus("ACTIVE");
        d.setCreatedAt(now);
        d.setUpdatedAt(now);
        departmentMapper.insert(d);
        return d;
    }

    private Doctor doctor(Long userId, Long depId, String title, String specialty, String intro, LocalDateTime now) {
        Doctor d = new Doctor();
        d.setUserId(userId);
        d.setDepartmentId(depId);
        d.setTitle(title);
        d.setSpecialty(specialty);
        d.setIntroduction(intro);
        d.setStatus("ACTIVE");
        d.setCreatedAt(now);
        d.setUpdatedAt(now);
        doctorMapper.insert(d);
        return d;
    }

    private Appointment appointment(String no, Long patientId, Long doctorId, Long scheduleId, Long depId,
                                    String status, String note, LocalDateTime createdAt) {
        Appointment a = new Appointment();
        a.setAppointmentNo(no);
        a.setPatientId(patientId);
        a.setDoctorId(doctorId);
        a.setScheduleId(scheduleId);
        a.setDepartmentId(depId);
        a.setStatus(status);
        a.setSymptomNote(note);
        a.setCreatedAt(createdAt);
        appointmentMapper.insert(a);
        return a;
    }
}
