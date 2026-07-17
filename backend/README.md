# 慧医通后端 · Spring Boot

医院预约挂号与电子病历管理系统 API，使用 Java 21、Spring Boot 3.3、Spring Security、MyBatis-Plus、H2/MySQL 和 springdoc OpenAPI。

## 本地启动（默认 H2）

```powershell
cd backend
mvn -DskipTests package
java -jar target/hospital-backend-1.0.0.jar
```

未全局安装 Maven 时，可使用仓库内的 `..\.tools\apache-maven-3.9.6\bin\mvn.cmd`。

- API：http://localhost:8080/api
- 健康检查：http://localhost:8080/api/health
- Swagger：http://localhost:8080/swagger-ui.html
- H2 控制台：http://localhost:8080/h2-console

H2 和 Swagger 仅用于默认开发配置，`prod` profile 会关闭两者并要求外部提供数据库与 JWT 密钥。

## MySQL 与生产配置

开发用 MySQL：

```powershell
java -jar target/hospital-backend-1.0.0.jar --spring.profiles.active=mysql
```

生产或 Compose 使用 `prod,mysql`，至少设置 `SPRING_DATASOURCE_URL`、`SPRING_DATASOURCE_USERNAME`、`SPRING_DATASOURCE_PASSWORD` 和不少于 32 字节的 `APP_JWT_SECRET`。完整变量、Docker、备份与回滚说明见 [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)。

## 认证与错误语义

- 登录成功设置 HttpOnly、SameSite 会话 Cookie；Bearer Token 仍兼容非浏览器 API 客户端。
- `POST /api/auth/logout` 清除会话 Cookie。
- 同一用户名连续失败会触发 `429 Too Many Requests`。
- 统一响应体为 `{ code, message, data }`，并使用对应的 `400`、`401`、`403`、`404`、`409`、`429`、`500` HTTP 状态。

接口契约与错误码见 [docs/API.md](../docs/API.md)。

## 测试

```powershell
mvn test
```

集成测试覆盖登录、Cookie、权限隔离、限流、预约与病历闭环、原子号源更新、管理统计及健康检查。完整测试方案见 [docs/TESTING.md](../docs/TESTING.md)。
