package com.hospital.security;

import com.hospital.common.BizException;
import com.hospital.entity.SysUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
    private SecurityUtils() {}

    public static LoginUser requireLoginUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof LoginUser loginUser)) {
            throw new BizException(401, "未登录或登录已过期");
        }
        return loginUser;
    }

    public static SysUser requireUser() {
        return requireLoginUser().getUser();
    }
}
