package com.hospital.config;

import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.Arrays;

@Component
@Order(0)
public class SchemaInitializer {
    public SchemaInitializer(DataSource dataSource, Environment environment) {
        boolean mysql = Arrays.asList(environment.getActiveProfiles()).contains("mysql");
        String script = mysql ? "schema-mysql-tables.sql" : "schema.sql";
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(new ClassPathResource(script));
        populator.setContinueOnError(true);
        populator.setSeparator(";");
        populator.execute(dataSource);
    }
}
