package com.hospital.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hospital.entity.Appointment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;

@Mapper
public interface AppointmentMapper extends BaseMapper<Appointment> {
    /** Cancels exactly one still-pending appointment. */
    @Update("""
            UPDATE appointment
               SET status = 'CANCELLED',
                   cancelled_at = #{cancelledAt}
             WHERE id = #{appointmentId}
               AND status = 'PENDING'
               AND deleted = 0
            """)
    int cancelPending(
            @Param("appointmentId") Long appointmentId,
            @Param("cancelledAt") LocalDateTime cancelledAt);

    /** Completes exactly one still-pending appointment. */
    @Update("""
            UPDATE appointment
               SET status = 'COMPLETED'
             WHERE id = #{appointmentId}
               AND status = 'PENDING'
               AND deleted = 0
            """)
    int completePending(@Param("appointmentId") Long appointmentId);
}
