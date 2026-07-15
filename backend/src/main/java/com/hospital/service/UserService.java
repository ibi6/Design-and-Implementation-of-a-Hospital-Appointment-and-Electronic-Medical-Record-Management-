package com.hospital.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hospital.common.BizException;
import com.hospital.dto.Dtos;
import com.hospital.entity.Doctor;
import com.hospital.entity.SysUser;
import com.hospital.mapper.DoctorMapper;
import com.hospital.mapper.SysUserMapper;
import com.hospital.security.JwtService;
import com.hospital.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final SysUserMapper userMapper;
    private final DoctorMapper doctorMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public Dtos.LoginResponse login(Dtos.LoginRequest req) {
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, req.getUsername().trim()));
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new BizException(401, "用户名或密码错误");
        }
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BizException(403, "账号已停用");
        }
        String token = jwtService.generate(user.getId(), user.getUsername(), user.getRole());
        Dtos.LoginResponse resp = new Dtos.LoginResponse();
        resp.setToken(token);
        resp.setUser(toPublic(user));
        return resp;
    }

    @Transactional
    public Dtos.LoginResponse register(Dtos.RegisterRequest req) {
        Long exists = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, req.getUsername().trim()));
        if (exists != null && exists > 0) {
            throw new BizException("用户名已存在");
        }
        LocalDateTime now = LocalDateTime.now();
        SysUser user = new SysUser();
        user.setUsername(req.getUsername().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRealName(req.getRealName().trim());
        user.setPhone(req.getPhone().trim());
        user.setRole("PATIENT");
        user.setStatus("ACTIVE");
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userMapper.insert(user);
        String token = jwtService.generate(user.getId(), user.getUsername(), user.getRole());
        Dtos.LoginResponse resp = new Dtos.LoginResponse();
        resp.setToken(token);
        resp.setUser(toPublic(user));
        return resp;
    }

    public Dtos.UserPublic me() {
        return toPublic(SecurityUtils.requireUser());
    }

    public List<Dtos.UserPublic> listUsers(String role) {
        LambdaQueryWrapper<SysUser> q = new LambdaQueryWrapper<>();
        if (role != null && !role.isBlank()) {
            q.eq(SysUser::getRole, role);
        }
        q.orderByAsc(SysUser::getCreatedAt);
        return userMapper.selectList(q).stream().map(this::toPublic).toList();
    }

    @Transactional
    public Dtos.UserPublic setStatus(Long userId, String status) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) throw new BizException("用户不存在");
        if ("ADMIN".equals(user.getRole())) throw new BizException("不能停用管理员账号");
        if (!"ACTIVE".equals(status) && !"DISABLED".equals(status)) {
            throw new BizException("状态无效");
        }
        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);
        if ("DOCTOR".equals(user.getRole())) {
            Doctor doctor = doctorMapper.selectOne(new LambdaQueryWrapper<Doctor>().eq(Doctor::getUserId, userId));
            if (doctor != null) {
                doctor.setStatus(status);
                doctor.setUpdatedAt(LocalDateTime.now());
                doctorMapper.updateById(doctor);
            }
        }
        return toPublic(user);
    }

    public Dtos.UserPublic toPublic(SysUser user) {
        Dtos.UserPublic vo = new Dtos.UserPublic();
        vo.setId(Dtos.id(user.getId()));
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setPhone(user.getPhone());
        vo.setRole(user.getRole());
        vo.setStatus(user.getStatus());
        vo.setAvatarUrl(user.getAvatarUrl());
        vo.setCreatedAt(Dtos.dt(user.getCreatedAt()));
        return vo;
    }

    public SysUser requireById(Long id) {
        SysUser user = userMapper.selectById(id);
        if (user == null) throw new BizException("用户不存在");
        return user;
    }
}
