# 毕业论文素材包

**题目**：基于 SpringBoot 的医院预约挂号与电子病历管理系统设计与实现  
**更新**：2026-07-12  
**用途**：直接改写成学校格式正文；括号内为建议字数

---

## 摘要（中文，约 300–500 字）

随着互联网医疗与智慧医院建设推进，传统窗口挂号排队时间长、病历纸质流转效率低等问题日益突出。本文设计并实现了一套基于 Spring Boot 的医院预约挂号与电子病历管理系统。系统采用前后端分离架构：前端使用 React + Vite + TypeScript + Tailwind CSS 构建患者端、医生端与管理端；后端基于 Spring Boot 3、Spring Security、JWT 与 MyBatis-Plus，默认使用 H2 文件库，可切换 MySQL。系统实现科室与医生维护、排班号源管理、在线预约与取消、医生接诊书写电子病历、患者病历查询及运营看板等功能，并通过角色鉴权与数据隔离保障业务安全。测试结果表明，核心业务流程可闭环运行，能够满足本科毕业设计对完整性、可演示性与可扩展性的要求。

**关键词**：Spring Boot；预约挂号；电子病历；前后端分离；JWT

### Abstract（英文，约 150–250 词）

This paper presents the design and implementation of a hospital appointment and electronic medical record (EMR) management system based on Spring Boot. The system adopts a front-end/back-end separation architecture. The front end is built with React, Vite, TypeScript and Tailwind CSS, providing portals for patients, doctors and administrators. The back end is implemented with Spring Boot 3, Spring Security, JWT and MyBatis-Plus, using H2 by default and supporting MySQL. Core features include department and doctor management, schedule/quota control, online appointment and cancellation, EMR writing after consultation, patient record viewing and operational dashboards. Role-based authorization and data isolation improve security. Experimental results show that the main business flow works end-to-end and meets graduation-project requirements for completeness and demonstrability.

**Keywords**: Spring Boot; Appointment; Electronic Medical Record; Frontend-Backend Separation; JWT

---

## 第 1 章 绪论（约 2000–3000 字）

### 1.1 研究背景

- 医院门诊量大，窗口挂号高峰拥堵  
- 纸质病历不便保存、检索与共享  
- 互联网医院 / 智慧医疗政策推动线上预约与电子病历普及  
- 中小型医院/教学演示需要轻量可部署方案  

### 1.2 研究意义

| 对象 | 意义 |
|------|------|
| 患者 | 减少排队，随时查看预约与病历 |
| 医生 | 接诊信息集中，结构化书写病历 |
| 医院管理 | 科室/号源/预约统一管理，数据可视化 |
| 教学科研 | 完整可运行案例，便于二次扩展 |

### 1.3 国内外研究现状（写作提示）

可从三方面检索并引用 8–15 篇文献：

1. 医院信息系统（HIS）与智慧医院  
2. 在线预约挂号系统设计  
3. 电子病历（EMR）标准与安全  

对比点：功能完整性、技术栈新旧、是否前后端分离、是否含权限隔离。

### 1.4 研究内容与目标

1. 分析预约挂号与电子病历业务需求  
2. 设计系统架构、数据库与接口  
3. 实现三角色业务功能  
4. 完成联调、测试与演示  

### 1.5 论文结构

第 2 章相关技术 → 第 3 章需求分析 → 第 4 章系统设计 → 第 5 章系统实现 → 第 6 章测试 → 第 7 章总结展望。

---

## 第 2 章 相关技术（约 2000 字）

### 2.1 Spring Boot

- 约定优于配置，快速构建 REST 服务  
- 本系统使用 3.x + 内嵌 Tomcat  

### 2.2 Spring Security 与 JWT

- 无状态认证，适合前后端分离  
- 密码 BCrypt 加密存储  
- 请求头 `Authorization: Bearer <token>`  

### 2.3 MyBatis-Plus

- 简化 CRUD，逻辑删除、主键雪花 ID  

### 2.4 React 前端技术栈

- React + TypeScript 组件化  
- Vite 构建  
- Tailwind 医疗青绿 UI  
- React Router 角色路由  

### 2.5 数据库

- 演示默认 H2 文件库，零依赖启动  
- 生产可切换 MySQL 8（Docker Compose 提供）  

---

## 第 3 章 需求分析（约 2500–3500 字）

### 3.1 可行性

| 维度 | 结论 |
|------|------|
| 技术 | Java/React 生态成熟 |
| 经济 | 开源组件，无额外授权费用 |
| 操作 | 浏览器访问，学习成本低 |

### 3.2 角色用例

**患者**：注册登录、浏览科室医生、预约/取消、查看病历、个人中心  
**医生**：登录、查看待接诊、写病历、看排班与历史病历  
**管理员**：看板、科室/医生/排班/预约/用户管理  

### 3.3 功能性需求

1. 认证授权  
2. 预约挂号（号源扣减/释放）  
3. 电子病历（与预约 1:1）  
4. 基础数据管理  
5. 统计看板  

### 3.4 非功能需求

- 安全性：JWT、角色权限、数据隔离  
- 可用性：加载/空状态、中文界面  
- 可维护性：模块分层、统一响应体  
- 可演示性：种子账号与一键脚本  

### 3.5 业务规则

- 预约状态：`PENDING | COMPLETED | CANCELLED | NO_SHOW`  
- 仅 `PENDING` 可取消  
- 号源满不可约；同患者同时段不可重复约  
- 写病历后预约变 `COMPLETED`  

---

## 第 4 章 系统设计（约 4000–6000 字，重点章）

### 4.1 总体架构

```
浏览器(React SPA)
    |  HTTP/JSON + JWT
Spring Boot API
    |  MyBatis-Plus
H2 / MySQL
```

分层：Controller → Service → Mapper → Entity

### 4.2 功能模块

| 模块 | 说明 |
|------|------|
| 认证模块 | 登录注册、Token 签发与校验 |
| 患者业务 | 科室医生浏览、预约取消、病历查询 |
| 医生业务 | 接诊、写病历、排班与历史 |
| 管理业务 | 资源 CRUD、预约用户管理、统计 |
| 公共支撑 | 统一异常、CORS、Swagger |

### 4.3 数据库设计

**概念关系**

- User 1—1 Doctor（医生扩展）  
- Department 1—* Doctor  
- Doctor 1—* Schedule  
- Patient 1—* Appointment  
- Schedule 1—* Appointment  
- Appointment 1—0..1 MedicalRecord  

**核心表**

| 表 | 作用 |
|----|------|
| sys_user | 用户账号与角色 |
| department | 科室 |
| doctor | 医生档案 |
| schedule | 排班号源 |
| appointment | 预约单 |
| medical_record | 电子病历 |

字段细节见：`docs/superpowers/specs/2026-07-11-hospital-appointment-emr-design.md` 第 6 节与 `schema.sql`。

### 4.4 接口设计

统一响应：

```json
{ "code": 0, "message": "ok", "data": {} }
```

| 模块 | 方法 | 路径 |
|------|------|------|
| 登录 | POST | /api/auth/login |
| 注册 | POST | /api/auth/register |
| 当前用户 | GET | /api/auth/me |
| 科室 | GET/POST/PUT | /api/departments |
| 医生 | GET/POST/PUT | /api/doctors |
| 排班 | GET/POST/PUT | /api/schedules |
| 预约 | GET/POST | /api/appointments |
| 取消 | POST | /api/appointments/{id}/cancel |
| 病历 | GET/POST | /api/records |
| 用户 | GET | /api/users |
| 统计 | GET | /api/stats/overview |

### 4.5 安全设计

1. 登录校验密码哈希  
2. JWT 携带 userId/role  
3. 接口按角色授权（`@PreAuthorize` / Security 配置）  
4. 业务层强制数据隔离：患者仅本人预约/病历，医生仅本人接诊数据  

### 4.6 核心流程

**预约成功**：校验登录与号源 → 防重复 → 写预约 → reserved_count++  
**取消预约**：校验归属与 PENDING → CANCELLED → reserved_count--  
**写病历**：校验医生归属 → 插病历 → 预约 COMPLETED（事务）  

---

## 第 5 章 系统实现（约 4000–6000 字）

### 5.1 开发环境

| 项 | 版本/说明 |
|----|-----------|
| JDK | 21 |
| Spring Boot | 3.3.x |
| Node.js | 18+ |
| 前端 | React + Vite + TS |
| 构建 | Maven / npm |

### 5.2 后端关键实现点

- `SecurityConfig`：放行登录注册，其余鉴权  
- `JwtAuthFilter`：解析 Token 注入 SecurityContext  
- `AppointmentService` / `RecordService`：事务与隔离  
- `DataSeeder`：首次启动种子数据  
- `SchemaInitializer`：自动建表  

### 5.3 前端关键实现点

- `AuthContext`：登录态与 Token  
- `ProtectedRoute`：角色路由守卫  
- 三角色 `AppShell` 布局  
- `services/api.ts` + `http.ts` 对接后端  

### 5.4 界面实现说明（配图建议）

论文中建议截图：

1. 登录页  
2. 患者预约流程  
3. 医生写病历  
4. 患者病历详情  
5. 管理看板  

### 5.5 部署与运行

```powershell
powershell -File scripts/start-backend.ps1
powershell -File scripts/start-frontend.ps1
```

可选 MySQL：

```powershell
powershell -File scripts/start-mysql.ps1
powershell -File scripts/start-backend.ps1 mysql
```

---

## 第 6 章 系统测试（约 2000–3000 字）

### 6.1 测试环境

与开发环境一致；接口测试使用 Spring Boot Test + MockMvc。

### 6.2 功能测试用例

| 编号 | 用例 | 预期 | 结果 |
|------|------|------|------|
| T1 | 正确账号登录 | 返回 token | 通过 |
| T2 | 错误密码 | code=401 | 通过 |
| T3 | 患者访问 /api/users | 403 | 通过 |
| T4 | 患者查他人预约 | 仅返回本人数据 | 通过 |
| T5 | 预约→写病历 | 病历生成且预约 COMPLETED | 通过 |
| T6 | 取消 PENDING 预约 | 状态 CANCELLED，号源释放 | 通过 |
| T7 | 管理统计 | 返回计数 | 通过 |

### 6.3 自动化测试

```powershell
cd backend
mvn test
```

`CoreApiIntegrationTest`：5 个用例全部通过。

### 6.4 结果分析

系统满足预约与电子病历核心需求；安全隔离有效；适合教学演示。不足：未覆盖高并发压测、未实现支付短信等扩展。

---

## 第 7 章 总结与展望（约 1000–1500 字）

### 7.1 工作总结

完成了需求分析、架构设计、数据库设计、前后端实现、联调与测试，形成可运行的毕设系统。

### 7.2 不足

1. 默认 H2，生产仍需规范运维 MySQL  
2. 病历结构较简单  
3. 缺少完整 CI/CD 与压测  

### 7.3 展望

- 支付与短信通知  
- 细粒度叫号与候诊屏  
- 病历导出 PDF / 打印  
- Docker 全栈一键部署  
- 与国家/医院 EMR 标准对接  

---

## 致谢（模板）

感谢导师在选题、系统设计与论文撰写过程中的指导；感谢同学在测试阶段的帮助……

---

## 参考文献（示例格式，需替换为真实检索结果）

[1] 某某. 智慧医院建设路径研究[J]. …  
[2] 某某. 基于 Spring Boot 的医院预约系统设计与实现[D]. …  
[3] Walls C. Spring in Action[M]. …  
[4] 国家卫生健康委. 电子病历系统应用水平分级评价标准…  
[5] Fielding R T. Architectural Styles and the Design of Network-based Software Architectures[D]. …  

> 请用中国知网 / Google Scholar 检索后替换为真实文献，并按学校 GB/T 7714 格式排版。

---

## 附录建议

- 附录 A：主要 API 列表  
- 附录 B：数据库表结构  
- 附录 C：核心代码清单（Controller/Service 关键片段）  
- 附录 D：系统运行截图  

---

## 图表清单建议

| 图号 | 内容 |
|------|------|
| 图3-1 | 用例图（患者/医生/管理员） |
| 图4-1 | 系统总体架构图 |
| 图4-2 | 功能模块图 |
| 图4-3 | E-R 图 |
| 图4-4 | 预约流程图 |
| 图4-5 | 写病历流程图 |
| 图5-1~5-5 | 界面截图 |
| 表4-1 | 数据表说明 |
| 表4-2 | 接口一览 |
| 表6-1 | 测试用例与结果 |
