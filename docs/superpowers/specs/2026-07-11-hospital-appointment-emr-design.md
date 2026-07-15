# 医院预约挂号与电子病历管理系统 — 设计规格

**日期**: 2026-07-11  
**题目**: 基于 SpringBoot 的医院预约挂号与电子病历管理系统设计与实现  
**类型**: 本科毕业设计  
**状态**: 已确认方向，待实现

---

## 1. 目标与成功标准

### 1.1 目标

构建一套可运行、可演示、可写论文的医院业务管理系统，覆盖：

1. **预约挂号**：患者按科室/医生/时段预约，管理预约生命周期  
2. **电子病历**：医生接诊后书写病历，患者查看本人病历  
3. **后台管理**：科室、医生、排班/号源、用户与预约总览

### 1.2 成功标准

| 维度 | 标准 |
|------|------|
| 可运行 | 本地一条命令启动前端；三期后前后端均可启动并联调 |
| 可演示 | 三角色完整走通：挂号 → 接诊写病历 → 患者看病历 → 管理端维护 |
| 可写论文 | 有清晰架构、模块划分、数据库设计、核心流程说明 |
| UI 质量 | 现代医疗 SaaS 风格，非默认模板；含加载/空/错误状态 |
| 范围可控 | 不做支付、医保、住院、检验、IM 问诊 |

### 1.3 非目标（明确不做）

- 真实支付 / 医保结算  
- 检查检验、影像、住院护理  
- 在线问诊 / 即时通讯  
- 原生移动 App  
- 复杂多级 RBAC 权限树  
- 短信/邮件真实发送  

---

## 2. 用户角色

| 角色 | 代码 | 能力摘要 |
|------|------|----------|
| 患者 | `PATIENT` | 注册登录、浏览科室/医生、预约/取消、查看我的预约与病历、个人中心 |
| 医生 | `DOCTOR` | 登录、工作台、今日接诊、写/改病历、查看历史病历、查看本人排班 |
| 管理员 | `ADMIN` | 登录、数据看板、科室/医生/排班/用户/预约管理 |

演示账号（一期 Mock / 三期种子数据统一）：

| 账号 | 密码 | 角色 |
|------|------|------|
| patient | 123456 | 患者 |
| doctor | 123456 | 医生 |
| admin | 123456 | 管理员 |

---

## 3. 功能范围（MVP）

### 3.1 认证与账号

- 登录（用户名 + 密码）  
- 患者注册（用户名、姓名、手机号、密码）  
- 登录态保持（一期 localStorage；三期 JWT）  
- 按角色路由守卫，未登录跳转登录页  

### 3.2 预约挂号（患者）

1. 浏览科室列表  
2. 选择科室 → 医生列表（职称、擅长、所属科室）  
3. 选择医生 → 可选日期与时段号源（上午/下午或具体时间段）  
4. 确认预约（填写/确认就诊人信息）  
5. 我的预约列表：筛选状态、取消待就诊预约  
6. 预约状态机：`PENDING`（待就诊）→ `COMPLETED`（已就诊）/ `CANCELLED`（已取消）/ `NO_SHOW`（爽约）

规则：

- 同一患者不可对同一医生同一时段重复预约  
- 仅 `PENDING` 可取消  
- 号源剩余为 0 时不可约  

### 3.3 电子病历（医生 + 患者）

医生：

- 从待接诊预约进入「写病历」  
- 字段：主诉、现病史、体格检查、诊断、处理意见、处方说明（文本）  
- 提交后预约变为 `COMPLETED`，生成病历（与预约 1:1）  
- 可查看本人历史病历列表与详情  

患者：

- 我的病历列表与详情（只读）  
- 病历展示关联的科室、医生、就诊日期  

### 3.4 排班与号源

- 管理员维护医生排班：日期、时段、总号源数  
- 预约消耗号源；取消释放号源  
- 一期 Mock 预置未来 7 天号源  

### 3.5 管理端

- **看板**：今日预约数、待就诊、已完成、科室/医生数量等 KPI  
- **科室管理**：增删改查、启用/停用  
- **医生管理**：关联用户与科室、职称、擅长、简介  
- **排班管理**：按医生生成/编辑号源  
- **预约管理**：全量列表、按状态/日期筛选、必要时后台取消  
- **用户管理**：查看用户、重置演示密码（可选）、启用/禁用  

### 3.6 页面状态要求

每个核心列表/详情需具备：

- Loading 骨架或 spinner  
- Empty 空状态插画/文案 + 引导操作  
- Error 错误提示（一期 Mock 可较少触发）  
- 桌面 + 移动端基本可用布局  

---

## 4. 信息架构与页面清单

### 4.1 公共

| 路由 | 页面 |
|------|------|
| `/` | 落地首页（产品介绍 + 登录/挂号入口） |
| `/login` | 登录（可一键填入演示账号） |
| `/register` | 患者注册 |

### 4.2 患者端（前缀 `/patient`）

| 路由 | 页面 |
|------|------|
| `/patient` | 患者工作台 |
| `/patient/departments` | 科室列表 |
| `/patient/doctors` | 医生列表（可按科室筛选） |
| `/patient/doctors/:id` | 医生详情 + 选号预约 |
| `/patient/appointments` | 我的预约 |
| `/patient/records` | 我的病历 |
| `/patient/records/:id` | 病历详情 |
| `/patient/profile` | 个人中心 |

### 4.3 医生端（前缀 `/doctor`）

| 路由 | 页面 |
|------|------|
| `/doctor` | 医生工作台 |
| `/doctor/appointments` | 接诊列表 |
| `/doctor/appointments/:id/record` | 写病历 / 查看已写病历 |
| `/doctor/schedules` | 我的排班 |
| `/doctor/records` | 历史病历 |
| `/doctor/profile` | 个人中心 |

### 4.4 管理端（前缀 `/admin`）

| 路由 | 页面 |
|------|------|
| `/admin` | 管理看板 |
| `/admin/departments` | 科室管理 |
| `/admin/doctors` | 医生管理 |
| `/admin/schedules` | 排班管理 |
| `/admin/appointments` | 预约管理 |
| `/admin/users` | 用户管理 |

---

## 5. 技术架构

### 5.1 总体

前后端分离：

```
[浏览器] → [React SPA] → [HTTP/JSON] → [Spring Boot API] → [MySQL]
                 ↑ 一期
              Mock 层
```

### 5.2 一期：前端展示版（当前优先）

| 项 | 选型 |
|----|------|
| 框架 | React 18 + TypeScript + Vite |
| 路由 | React Router v6 |
| 样式 | Tailwind CSS |
| 图标 | lucide-react |
| 状态 | React Context 或轻量 store（auth + mock 数据） |
| 数据 | `src/mocks/*` 内存数据 + 假延迟 API 封装 |
| UI 风格 | 医疗青绿/医疗蓝 SaaS：大圆角卡片、柔和阴影、清晰层级 |

交付物：

- `frontend/` 可 `npm install && npm run dev` 运行  
- 三角色页面与主流程可点击走通  
- README 写明启动命令、访问地址、Mock 范围  

### 5.3 三期：后端成品（用户确认前端后）

| 项 | 选型 |
|----|------|
| 语言 | Java 17 |
| 框架 | Spring Boot 3.x |
| 安全 | Spring Security + JWT |
| ORM | MyBatis-Plus |
| 数据库 | MySQL 8 |
| 文档 | springdoc-openapi (Swagger UI) |
| 构建 | Maven |
| 统一响应 | `{ code, message, data }` |

目录建议：

```
hospital-system/
  frontend/          # React 展示与联调
  backend/           # Spring Boot
  docs/              # 设计/计划/论文素材
  README.md
```

### 5.4 API 边界（三期契约，一期 Mock 对齐）

统一前缀：`/api`

| 模块 | 示例 |
|------|------|
| 认证 | `POST /api/auth/login` `POST /api/auth/register` `GET /api/auth/me` |
| 科室 | `GET/POST/PUT/DELETE /api/departments` |
| 医生 | `GET/POST/PUT /api/doctors` |
| 排班 | `GET/POST/PUT /api/schedules` |
| 预约 | `GET/POST /api/appointments` `POST /api/appointments/:id/cancel` |
| 病历 | `GET/POST /api/records` `GET /api/records/:id` |
| 用户 | `GET /api/users`（管理员） |
| 统计 | `GET /api/stats/overview`（管理员/医生工作台） |

权限：

- 患者只能访问本人预约/病历  
- 医生只能操作本人接诊与病历  
- 管理端接口需 `ADMIN`  

---

## 6. 数据模型

### 6.1 实体关系（概念）

```
User 1──1 Doctor（医生角色扩展）
Department 1──* Doctor
Doctor 1──* Schedule
User(患者) 1──* Appointment
Schedule 1──* Appointment
Appointment 1──0..1 MedicalRecord
Doctor 1──* MedicalRecord
User(患者) 1──* MedicalRecord
```

### 6.2 表字段（核心）

**sys_user**

- id, username, password_hash, real_name, phone, role, status, avatar_url, created_at, updated_at  

**department**

- id, name, description, sort_order, status, created_at, updated_at  

**doctor**

- id, user_id, department_id, title（主治/副主任/主任等）, specialty, introduction, status  

**schedule**

- id, doctor_id, work_date, time_slot（如 AM/PM 或 09:00-10:00）, total_quota, reserved_count, status  

**appointment**

- id, appointment_no, patient_id, doctor_id, schedule_id, department_id, status, symptom_note, visit_time, created_at, cancelled_at  

**medical_record**

- id, record_no, appointment_id, patient_id, doctor_id, chief_complaint, present_illness, physical_exam, diagnosis, treatment, prescription, created_at, updated_at  

### 6.3 状态枚举

**AppointmentStatus**: `PENDING` | `COMPLETED` | `CANCELLED` | `NO_SHOW`  
**EntityStatus**: `ACTIVE` | `DISABLED`  
**UserRole**: `PATIENT` | `DOCTOR` | `ADMIN`  
**TimeSlot**（一期简化）: `MORNING` | `AFTERNOON` 或具体字符串时段  

---

## 7. 关键流程

### 7.1 预约成功

1. 患者选择 schedule  
2. 校验：登录、号源剩余、无重复预约  
3. 创建 appointment = PENDING；schedule.reserved_count++  
4. 返回预约单  

### 7.2 取消预约

1. 校验归属与状态 = PENDING  
2. status → CANCELLED；reserved_count--  

### 7.3 写病历完成就诊

1. 医生打开 PENDING 预约  
2. 填写病历并提交  
3. 事务内：插入 medical_record；appointment → COMPLETED  

### 7.4 错误处理

| 场景 | 处理 |
|------|------|
| 未登录访问受保护页 | 跳转 `/login`，带回跳路径 |
| 无权限角色 | 403 页或提示并回角色首页 |
| 号源不足 / 重复预约 | 表单级错误提示，不静默失败 |
| 服务端异常（三期） | 统一错误码 + toast/页面提示 |

---

## 8. UI / UX 设计原则

- 风格：医疗可信 + 现代 SaaS（青绿/靛蓝主色，白底卡片，柔和渐变背景）  
- 布局：侧边栏（桌面）+ 顶部栏；移动端折叠导航  
- 组件统一：Button、Input、Card、Badge、Table、Modal、Empty、Skeleton  
- 文案中文；状态用彩色 Badge（待就诊琥珀、已完成绿、已取消灰）  
- 避免：默认蓝链、大面积空白、未样式化原生控件、过度霓虹渐变  

一期使用 `beautiful-saas-ui-builder` 标准实现前端质感。

---

## 9. 开发阶段

### 阶段一：前端展示版（当前）

1. 初始化 Vite React TS + Tailwind  
2. 布局、路由、鉴权 Mock  
3. Mock 数据与 API 层  
4. 公共 + 患者端页面  
5. 医生端页面  
6. 管理端页面  
7. 走通主流程与状态页  
8. README 启动说明  

**暂停点**：交付后等待用户确认 UI 与交互方向。

### 阶段二：用户确认

用户明确说「继续 / 可以 / 做后端 / 成品化」后再进入阶段三。

### 阶段三：SpringBoot 成品

1. 建库建表 + 种子数据  
2. 认证与 JWT  
3. 各业务 API  
4. 前端 Mock 切换为真实 API  
5. 联调、边界与错误处理  
6. Swagger、基础安全  

### 阶段四：交付

- 完整 README：启动、环境变量、库表初始化、账号  
- 功能清单与后续优化建议  
- 可选：Docker Compose  

---

## 10. 测试与验收（演示脚本）

1. 使用 `patient` 登录 → 选科室 → 选医生 → 预约成功 → 我的预约可见  
2. 使用 `doctor` 登录 → 接诊列表看到该预约 → 写病历提交  
3. 患者刷新 → 我的病历可见详情；预约状态为已就诊  
4. `admin` 登录 → 看板数字合理；可维护科室/排班  
5. 患者取消另一条 PENDING 预约成功  

一期全部在 Mock 内存中完成，刷新可重置或持久化到 localStorage（实现时二选一，默认 localStorage 以便演示连贯）。

---

## 11. 风险与假设

| 假设 | 说明 |
|------|------|
| 单院区 | 不建多院区/分院模型 |
| 号源粒度 | 按医生+日期+时段，不做到分钟级叫号 |
| 病历结构 | 文本字段为主，满足毕设即可 |
| 密码 | 一期明文 Mock；三期 BCrypt |
| 并发 | 三期预约扣号使用事务；极端高并发非目标 |

---

## 12. 交付目录规划

```
hospital-system/
  docs/
    superpowers/
      specs/2026-07-11-hospital-appointment-emr-design.md
      plans/...
  frontend/
  backend/         # 阶段三
  README.md
```

---

## 13. 变更记录

| 日期 | 内容 |
|------|------|
| 2026-07-11 | 初版设计，用户确认方案 A + 三角色 MVP |
