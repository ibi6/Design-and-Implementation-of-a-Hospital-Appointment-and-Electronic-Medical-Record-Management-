# 慧医通 API 文档

Base URL：`/api`。浏览器通过 HttpOnly Cookie 鉴权；非浏览器客户端也可发送 `Authorization: Bearer <jwt>`。

统一成功体：`{"code":0,"message":"ok","data":{}}`。统一失败体：`{"code":400,"message":"参数错误说明","data":null}`。

HTTP 状态与 `code` 同步：400 参数错误，401 未认证，403 无权限，404 不存在，409 并发状态冲突，429 登录失败过多，500 服务端错误。

## 认证

| 名称 | 方法与地址 | 请求 | 返回 | 权限 |
|---|---|---|---|---|
| 登录 | `POST /auth/login` | `username`, `password` | `token`, `user`；同时写 HttpOnly Cookie | 公开，5 次失败后限流 |
| 注册 | `POST /auth/register` | `username`, `password`, `realName`, `phone` | `token`, `user` | 公开，仅创建患者 |
| 当前用户 | `GET /auth/me` | 无 | `UserPublic` | 已登录 |
| 退出 | `POST /auth/logout` | 无 | `null`，清除 Cookie | 公开、幂等 |
| 健康检查 | `GET /health` | 无 | `{"status":"UP"}` | 公开 |

```bash
curl -i -c cookies.txt http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"patient","password":"123456"}'
curl -b cookies.txt http://localhost:8080/api/auth/me
```

`UserPublic`：`id`, `username`, `realName`, `phone`, `role`, `status`, `avatarUrl`, `createdAt`。

## 科室

| 名称 | 方法与地址 | 参数/请求 | 返回 | 权限 |
|---|---|---|---|---|
| 科室列表 | `GET /departments` | Query `includeDisabled=false` | `Department[]` | 登录；停用数据仅管理员 |
| 新增科室 | `POST /departments` | `name`, `description`, `sortOrder`, `status` | `Department` | ADMIN |
| 更新科室 | `PUT /departments/{id}` | 同新增 | `Department` | ADMIN |

`Department`：`id`, `name`, `description`, `sortOrder`, `status`。

## 医生

| 名称 | 方法与地址 | 参数/请求 | 返回 | 权限 |
|---|---|---|---|---|
| 医生列表 | `GET /doctors` | Query `departmentId`, `keyword`, `includeDisabled=false` | `DoctorView[]` | 登录；停用数据仅管理员 |
| 医生详情 | `GET /doctors/{id}` | Path `id` | `DoctorView` | 登录 |
| 用户关联医生 | `GET /doctors/by-user/{userId}` | Path `userId` | `DoctorView` | 登录 |
| 新增医生 | `POST /doctors` | 账号、姓名、手机、科室、职称、擅长、简介、状态 | `DoctorView` | ADMIN |
| 更新医生 | `PUT /doctors/{id}` | 同新增，账号密码可省略 | `DoctorView` | ADMIN |

`DoctorView`：`id`, `userId`, `departmentId`, `realName`, `phone`, `departmentName`, `title`, `specialty`, `introduction`, `status`。

## 排班

| 名称 | 方法与地址 | 参数/请求 | 返回 | 权限 |
|---|---|---|---|---|
| 排班列表 | `GET /schedules` | Query `doctorId`, `fromDate` | `Schedule[]` | 登录 |
| 新增排班 | `POST /schedules` | `doctorId`, `workDate`, `timeSlot`, `totalQuota` | `Schedule` | ADMIN |
| 更新排班 | `PUT /schedules/{id}` | 同新增 | `Schedule` | ADMIN |

`timeSlot` 仅为 `MORNING` 或 `AFTERNOON`；日期不得早于今天；号源为 1–500。`Schedule` 还返回 `reservedCount`, `status`。

## 预约

| 名称 | 方法与地址 | 参数/请求 | 返回 | 权限 |
|---|---|---|---|---|
| 预约列表 | `GET /appointments` | Query `patientId`, `doctorId`, `status` | `AppointmentView[]` | 按角色自动隔离 |
| 预约详情 | `GET /appointments/{id}` | Path `id` | `AppointmentView` | 本人医生/患者或 ADMIN |
| 创建预约 | `POST /appointments` | `scheduleId`, `symptomNote` | `AppointmentView` | PATIENT |
| 取消预约 | `POST /appointments/{id}/cancel` | Path `id` | `AppointmentView` | 归属患者/医生或 ADMIN |

创建示例：`{"scheduleId":"2077000000000000001","symptomNote":"持续头晕两天"}`。

状态：`PENDING`, `COMPLETED`, `CANCELLED`, `NO_SHOW`。号源预占/释放及预约取消/完成均采用数据库条件更新；并发状态已变化时返回 409。

## 电子病历

| 名称 | 方法与地址 | 参数/请求 | 返回 | 权限 |
|---|---|---|---|---|
| 病历列表 | `GET /records` | Query `patientId`, `doctorId` | `RecordView[]` | 按角色自动隔离 |
| 病历详情 | `GET /records/{id}` | Path `id` | `RecordView` | 归属患者/医生或 ADMIN |
| 按预约查询 | `GET /records/by-appointment/{appointmentId}` | Path | `RecordView/null` | 归属校验 |
| 创建病历 | `POST /records` | 见下方 | `RecordView` | 接诊医生或 ADMIN |

```json
{"appointmentId":"2077000000000000001","chiefComplaint":"咳嗽两天","presentIllness":"无高热","physicalExam":"咽部轻度充血","diagnosis":"上呼吸道感染","treatment":"休息、多饮水","prescription":"按医嘱用药"}
```

## 用户与统计

| 名称 | 方法与地址 | 参数/请求 | 返回 | 权限 |
|---|---|---|---|---|
| 用户列表 | `GET /users` | Query `role` | `UserPublic[]` | ADMIN |
| 用户状态 | `PUT /users/{id}/status` | `status: ACTIVE/DISABLED` | `UserPublic` | ADMIN |
| 运营统计 | `GET /stats/overview` | 无 | 用户、医生、科室、今日预约及状态数量 | ADMIN |

开发环境完整交互文档：`http://localhost:8080/swagger-ui.html`。生产 profile 默认关闭 Swagger 与 H2 Console。
