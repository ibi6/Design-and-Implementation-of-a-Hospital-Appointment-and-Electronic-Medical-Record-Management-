package com.hospital.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hospital.common.BizException;
import com.hospital.dto.Dtos;
import com.hospital.entity.Department;
import com.hospital.mapper.DepartmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {
    private final DepartmentMapper departmentMapper;

    public List<Dtos.DepartmentVO> list(boolean includeDisabled) {
        LambdaQueryWrapper<Department> q = new LambdaQueryWrapper<>();
        if (!includeDisabled) {
            q.eq(Department::getStatus, "ACTIVE");
        }
        q.orderByAsc(Department::getSortOrder);
        return departmentMapper.selectList(q).stream().map(this::toVO).toList();
    }

    @Transactional
    public Dtos.DepartmentVO save(Dtos.DepartmentRequest req) {
        LocalDateTime now = LocalDateTime.now();
        if (req.getId() != null && !req.getId().isBlank()) {
            Department dep = departmentMapper.selectById(Dtos.parseId(req.getId()));
            if (dep == null) throw new BizException("科室不存在");
            dep.setName(req.getName());
            dep.setDescription(req.getDescription() == null ? "" : req.getDescription());
            if (req.getSortOrder() != null) dep.setSortOrder(req.getSortOrder());
            if (req.getStatus() != null) dep.setStatus(req.getStatus());
            dep.setUpdatedAt(now);
            departmentMapper.updateById(dep);
            return toVO(dep);
        }
        Department dep = new Department();
        dep.setName(req.getName());
        dep.setDescription(req.getDescription() == null ? "" : req.getDescription());
        dep.setSortOrder(req.getSortOrder() == null ? 1 : req.getSortOrder());
        dep.setStatus(req.getStatus() == null ? "ACTIVE" : req.getStatus());
        dep.setCreatedAt(now);
        dep.setUpdatedAt(now);
        departmentMapper.insert(dep);
        return toVO(dep);
    }

    public Department require(Long id) {
        Department dep = departmentMapper.selectById(id);
        if (dep == null) throw new BizException("科室不存在");
        return dep;
    }

    public Dtos.DepartmentVO toVO(Department dep) {
        Dtos.DepartmentVO vo = new Dtos.DepartmentVO();
        vo.setId(Dtos.id(dep.getId()));
        vo.setName(dep.getName());
        vo.setDescription(dep.getDescription());
        vo.setSortOrder(dep.getSortOrder());
        vo.setStatus(dep.getStatus());
        return vo;
    }
}
