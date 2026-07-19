package com.hospital.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hospital.common.BizException;
import com.hospital.dto.Dtos;
import com.hospital.entity.Department;
import com.hospital.entity.Doctor;
import com.hospital.entity.SysUser;
import com.hospital.mapper.DepartmentMapper;
import com.hospital.mapper.DoctorMapper;
import com.hospital.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {
    private final DoctorMapper doctorMapper;
    private final SysUserMapper userMapper;
    private final DepartmentMapper departmentMapper;
    private final PasswordEncoder passwordEncoder;

    public List<Dtos.DoctorVO> list(String departmentId, String keyword, boolean includeDisabled) {
        LambdaQueryWrapper<Doctor> q = new LambdaQueryWrapper<>();
        if (!includeDisabled) q.eq(Doctor::getStatus, "ACTIVE");
        if (departmentId != null && !departmentId.isBlank()) {
            q.eq(Doctor::getDepartmentId, Dtos.parseId(departmentId));
        }
        return doctorMapper.selectList(q).stream()
                .map(this::toVO)
                .filter(d -> {
                    if (keyword == null || keyword.isBlank()) return true;
                    String k = keyword.trim();
                    return (d.getRealName() != null && d.getRealName().contains(k))
                            || (d.getSpecialty() != null && d.getSpecialty().contains(k))
                            || (d.getTitle() != null && d.getTitle().contains(k));
                })
                .toList();
    }

    public Dtos.DoctorVO get(Long id) {
        Doctor doctor = doctorMapper.selectById(id);
        if (doctor == null) throw new BizException("医生不存在");
        return toVO(doctor);
    }

    public Dtos.DoctorVO getByUserId(Long userId) {
        Doctor doctor = doctorMapper.selectOne(new LambdaQueryWrapper<Doctor>().eq(Doctor::getUserId, userId));
        if (doctor == null) throw new BizException("未绑定医生档案");
        return toVO(doctor);
    }

    public Doctor requireEntity(Long id) {
        Doctor doctor = doctorMapper.selectById(id);
        if (doctor == null) throw new BizException("医生不存在");
        return doctor;
    }

    public Doctor requireByUserId(Long userId) {
        Doctor doctor = doctorMapper.selectOne(new LambdaQueryWrapper<Doctor>().eq(Doctor::getUserId, userId));
        if (doctor == null) throw new BizException("未绑定医生档案");
        return doctor;
    }

    @Transactional
    public Dtos.DoctorVO save(Dtos.DoctorRequest req) {
        LocalDateTime now = LocalDateTime.now();
        Department dep = departmentMapper.selectById(Dtos.parseId(req.getDepartmentId()));
        if (dep == null) throw new BizException("科室不存在");

        if (req.getId() != null && !req.getId().isBlank()) {
            Doctor doctor = requireEntity(Dtos.parseId(req.getId()));
            SysUser user = userMapper.selectById(doctor.getUserId());
            if (user != null) {
                user.setRealName(req.getRealName());
                user.setPhone(req.getPhone());
                if (req.getStatus() != null) user.setStatus(req.getStatus());
                user.setUpdatedAt(now);
                userMapper.updateById(user);
            }
            doctor.setDepartmentId(Dtos.parseId(req.getDepartmentId()));
            doctor.setTitle(req.getTitle());
            doctor.setSpecialty(req.getSpecialty());
            doctor.setIntroduction(req.getIntroduction() == null ? "" : req.getIntroduction());
            if (req.getStatus() != null) doctor.setStatus(req.getStatus());
            doctor.setUpdatedAt(now);
            doctorMapper.updateById(doctor);
            return toVO(doctor);
        }

        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new BizException("请填写登录用户名");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new BizException("请填写初始密码");
        }
        if (req.getPassword().length() < 6 || req.getPassword().length() > 72) {
            throw new BizException("初始密码须为 6-72 位");
        }
        Long exists = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, req.getUsername().trim()));
        if (exists != null && exists > 0) throw new BizException("用户名已存在");

        SysUser user = new SysUser();
        user.setUsername(req.getUsername().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRealName(req.getRealName());
        user.setPhone(req.getPhone());
        user.setRole("DOCTOR");
        user.setStatus(req.getStatus() == null ? "ACTIVE" : req.getStatus());
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userMapper.insert(user);

        Doctor doctor = new Doctor();
        doctor.setUserId(user.getId());
        doctor.setDepartmentId(Dtos.parseId(req.getDepartmentId()));
        doctor.setTitle(req.getTitle());
        doctor.setSpecialty(req.getSpecialty());
        doctor.setIntroduction(req.getIntroduction() == null ? "" : req.getIntroduction());
        doctor.setStatus(user.getStatus());
        doctor.setCreatedAt(now);
        doctor.setUpdatedAt(now);
        doctorMapper.insert(doctor);
        return toVO(doctor);
    }

    public Dtos.DoctorVO toVO(Doctor doctor) {
        SysUser user = userMapper.selectById(doctor.getUserId());
        Department dep = departmentMapper.selectById(doctor.getDepartmentId());
        Dtos.DoctorVO vo = new Dtos.DoctorVO();
        vo.setId(Dtos.id(doctor.getId()));
        vo.setUserId(Dtos.id(doctor.getUserId()));
        vo.setDepartmentId(Dtos.id(doctor.getDepartmentId()));
        vo.setTitle(doctor.getTitle());
        vo.setSpecialty(doctor.getSpecialty());
        vo.setIntroduction(doctor.getIntroduction());
        vo.setStatus(doctor.getStatus());
        vo.setRealName(user == null ? "未知医生" : user.getRealName());
        vo.setPhone(user == null ? "" : user.getPhone());
        vo.setDepartmentName(dep == null ? "未分配" : dep.getName());
        return vo;
    }
}
