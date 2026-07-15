# 慧医通后端 · Spring Boot

医院预约挂号与电子病历管理系统后端。

## 技术栈

- Java 21
- Spring Boot 3.3
- Spring Security + JWT
- MyBatis-Plus
- 默认 H2 文件库（可切换 MySQL）
- springdoc OpenAPI

## 启动（默认 H2，无需安装 MySQL）

```bash
# 如未安装 Maven，可使用项目自带工具：
# ..\.tools\apache-maven-3.9.6\bin\mvn.cmd

cd backend
mvn -DskipTests package
java -jar target/hospital-backend-1.0.0.jar
```

或：

```bash
mvn spring-boot:run
```

服务地址：http://localhost:8080  
Swagger：http://localhost:8080/swagger-ui.html  
H2 控制台：http://localhost:8080/h2-console  
（JDBC URL: `jdbc:h2:file:./data/hospital`，用户 `sa`，密码空）

## 演示账号

| 账号 | 密码 | 角色 |
|------|------|------|
| patient | 123456 | 患者 |
| doctor | 123456 | 医生 |
| admin | 123456 | 管理员 |

首次启动会自动建表并写入种子数据。

## 切换 MySQL

1. 创建库（或启动时使用 `schema-mysql.sql`）
2. 修改 `application-mysql.yml` 中的账号密码
3. 启动：

```bash
java -jar target/hospital-backend-1.0.0.jar --spring.profiles.active=mysql
```

## 主要接口

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET/POST/PUT /api/departments`
- `GET/POST/PUT /api/doctors`
- `GET/POST/PUT /api/schedules`
- `GET/POST /api/appointments`，`POST /api/appointments/{id}/cancel`
- `GET/POST /api/records`
- `GET /api/users`（管理员）
- `GET /api/stats/overview`

统一响应：`{ code, message, data }`，`code=0` 表示成功。
