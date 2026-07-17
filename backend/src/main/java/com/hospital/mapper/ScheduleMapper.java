package com.hospital.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hospital.entity.Schedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;

@Mapper
public interface ScheduleMapper extends BaseMapper<Schedule> {
    /** Locks a schedule row for the duration of the surrounding transaction. */
    @Select("""
            SELECT *
              FROM schedule
             WHERE id = #{scheduleId}
               AND deleted = 0
             FOR UPDATE
            """)
    Schedule selectForUpdate(@Param("scheduleId") Long scheduleId);

    /** Atomically reserves one place only while capacity is available. */
    @Update("""
            UPDATE schedule
               SET reserved_count = reserved_count + 1,
                   updated_at = #{updatedAt}
             WHERE id = #{scheduleId}
               AND status = 'ACTIVE'
               AND deleted = 0
               AND reserved_count < total_quota
            """)
    int reserveQuota(@Param("scheduleId") Long scheduleId, @Param("updatedAt") LocalDateTime updatedAt);

    /** Atomically releases one place without allowing a negative count. */
    @Update("""
            UPDATE schedule
               SET reserved_count = reserved_count - 1,
                   updated_at = #{updatedAt}
             WHERE id = #{scheduleId}
               AND deleted = 0
               AND reserved_count > 0
            """)
    int releaseQuota(@Param("scheduleId") Long scheduleId, @Param("updatedAt") LocalDateTime updatedAt);
}
