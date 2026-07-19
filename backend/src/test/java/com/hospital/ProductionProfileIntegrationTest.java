package com.hospital;

import com.hospital.config.DataSeeder;
import com.hospital.mapper.SysUserMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:hospital_prod_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema.sql",
        "app.jwt.secret=production-profile-test-secret-at-least-32-bytes"
})
@ActiveProfiles("prod")
class ProductionProfileIntegrationTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private SysUserMapper userMapper;

    @Test
    void productionProfileDoesNotCreateDemoAccounts() {
        assertThat(applicationContext.getBeansOfType(DataSeeder.class)).isEmpty();
        assertThat(userMapper.selectCount(null)).isZero();
    }
}
