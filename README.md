<div align="center">

# 🏥 慧医通 · 医院预约挂号与电子病历系统

### 患者预约 · 医生接诊 · 电子病历 · 后台管理

**Spring Boot 3 · React 19 · HttpOnly JWT Cookie · MyBatis-Plus · H2 / MySQL**

<p>
  <img alt="GitHub stars" src="https://img.shields.io/github/stars/ibi6/Hospital?style=for-the-badge&logo=github" />
  <img alt="GitHub forks" src="https://img.shields.io/github/forks/ibi6/Hospital?style=for-the-badge&logo=github" />
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ibi6/Hospital?style=for-the-badge" />
</p>

<p>
  <img alt="Java" src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<img src="docs/assets/social-preview.png" alt="项目封面" width="92%" />

<br/>

<img src="docs/assets/login.png" alt="登录页" width="88%" />

<sub>完整业务闭环：预约挂号 → 医生接诊 → 电子病历 → 管理运营</sub>

</div>

---

## ✨ 项目亮点

很多“医院系统”只是简单 CRUD。
本项目交付的是**可运行、可演示的产品闭环**：

| 能力 | 你得到什么 |
|---|---|
| 🔐 真实鉴权 | Spring Security + HttpOnly JWT Cookie + 角色隔离 |
| 📅 真实预约 | 号源扣减/释放 + 状态机 |
| 📝 真实病历 | 预约与病历 1:1 联动 |
| 🎛️ 三角色门户 | 患者 / 医生 / 管理员统一 SPA |
| 🐳 部署选择 | 默认 H2 零依赖，或全栈 Docker Compose |
| ✅ 测试 | 后端集成测试 + 前端组件测试 |

---

## 🧩 功能清单

### 患者端
- 注册 / 登录
- 浏览科室与医生
- 预约 / 取消预约
- 查看本人电子病历

### 医生端
- 接诊工作台
- 书写结构化病历（主诉、诊断、处理、处方）
- 查看排班与历史病历

### 管理端
- 数据看板
- 科室 / 医生 / 排班维护
- 预约与用户管理

### 工程能力
- 统一响应体 `{ code, message, data }`，并返回真实 HTTP 状态码
- 全局异常处理与登录失败限流
- 本地开发启动演示种子数据（生产 profile 强制关闭）
- Swagger 文档
- 环境变量管理密钥（见 `.env.example`）

---

## 🖼️ 界面截图

| 患者工作台 | 预约挂号 |
|:---:|:---:|
| <img src="docs/assets/patient-dashboard.png" width="100%" /> | <img src="docs/assets/appointment.png" width="100%" /> |
| **我的预约** | **医生写病历** |
| <img src="docs/assets/my-appointments.png" width="100%" /> | <img src="docs/assets/doctor-emr.png" width="100%" /> |
| **病历详情** | **管理看板** |
| <img src="docs/assets/record-detail.png" width="100%" /> | <img src="docs/assets/admin-dashboard.png" width="100%" /> |

---

## 🏗 系统架构

```text
┌──────────────────────┐      HTTPS/JSON       ┌──────────────────────────┐
│  React SPA (Vite)    │ ───────────────────▶ │  Spring Boot 3 API       │
│  患者/医生/管理员     │ ◀─────────────────── │  Security + JWT          │
└──────────────────────┘                      │  MyBatis-Plus Services   │
                                              └────────────┬─────────────┘
                                                           │
                                              ┌────────────▼─────────────┐
                                              │  H2（默认） / MySQL 8     │
                                              └──────────────────────────┘
```

<div align="center">
  <img src="docs/assets/architecture.png" alt="架构图" width="86%" />
  <br/>
  <img src="docs/assets/flow.png" alt="预约流程图" width="86%" />
</div>

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19、TypeScript 6、Vite 8、Tailwind CSS 4、React Router |
| 后端 | Spring Boot 3、Spring Security、JWT Cookie/Bearer、Validation、springdoc OpenAPI |
| 数据 | MyBatis-Plus、H2 文件库（默认）、MySQL 8（可选） |
| 运维 | Docker Compose（Nginx + 后端 + MySQL）、健康检查、PowerShell 脚本 |

---

## 🚀 快速开始

### 环境要求
- **JDK 21+**
- **Node.js 18+**
- **Maven 3.9+**

> 本地开发和验收不依赖 Docker。项目内置 Maven，可直接使用下方 Windows 脚本；本次验收全程使用 H2、Node.js、JDK 和本机 Maven，未调用 Docker。

### 1）启动后端

```bash
cd backend
mvn -DskipTests package
java -jar target/hospital-backend-1.0.0.jar
```

- API：http://localhost:8080
- Swagger：http://localhost:8080/swagger-ui.html

### 2）启动前端

```bash
cd frontend
npm install
npm run dev
```

- 前端：http://localhost:5173

### Windows 快捷脚本

```powershell
powershell -File scripts/start-backend.ps1
powershell -File scripts/start-frontend.ps1
# 端口占用时可显式指定，例如：
powershell -File scripts/start-frontend.ps1 -Port 5188
```

### 可选：全栈 Docker Compose

仅在 Docker 环境可用时使用；本机开发不需要执行本节。

```powershell
Copy-Item .env.example .env
# 先替换 .env 中全部占位密钥
powershell -File scripts/start-stack.ps1
```

访问 http://localhost:8088。HTTPS、备份和回滚操作见[部署文档](./docs/DEPLOYMENT.md)。

---

## 👤 演示账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| `patient` | `123456` | 患者 |
| `doctor` | `123456` | 医生 |
| `admin` | `123456` | 管理员 |

> 仅用于演示，上线前请修改密码。

### 3 分钟演示路径

1. 用 **patient** 登录 → 预约
2. 用 **doctor** 登录 → 写病历完成就诊
3. 再切 **patient** → 查看病历
4. 用 **admin** 登录 → 查看看板与管理功能

---

## 🔌 接口概览

统一前缀：`/api`

| 模块 | 主要接口 |
|------|----------|
| 认证 | `GET /auth/csrf` `POST /auth/login` `POST /auth/logout` `POST /auth/register` `GET /auth/me` |
| 科室 | `GET/POST/PUT /departments` |
| 医生 | `GET/POST/PUT /doctors` |
| 排班 | `GET/POST/PUT /schedules` |
| 预约 | `GET/POST /appointments` `POST /appointments/{id}/cancel` |
| 病历 | `GET/POST /records` `GET /records/by-appointment/{id}` |
| 用户 | `GET /users` `PUT /users/{id}/status` |
| 统计 | `GET /stats/overview` |
| 健康检查 | `GET /health` |

浏览器使用 HttpOnly `hospital_session` Cookie，不会把 JWT 持久化到 Web Storage。非浏览器客户端仍可使用：

```http
Authorization: Bearer <jwt>
```

---

## 🧪 测试

```bash
cd backend
mvn test

cd ../frontend
npm run lint
npm test -- --run
npm run build
```

覆盖：
- 登录成功/失败
- 权限拦截
- 患者数据隔离
- 预约 → 病历闭环
- 管理统计

完整验证矩阵见 [docs/TESTING.md](./docs/TESTING.md)。

---

## 📁 目录结构

```text
.
├── backend/                 # Spring Boot 后端
├── frontend/                # React 前端
├── docs/                    # 设计文档、演示说明、截图
├── docker/                  # MySQL 初始化
├── scripts/                 # 本地启动脚本
├── docker-compose.yml
└── README.md
```

---

## 🔐 安全说明

- 密码 **BCrypt** 存储
- 通过 HttpOnly、SameSite Cookie 实现无状态 **JWT** 鉴权，API 客户端仍可使用 Bearer
- 浏览器写操作使用双提交 CSRF Token；Bearer API 客户端不依赖浏览器 Cookie
- 登录失败限流及明确的 `401` / `403` / `429` 状态码
- 前后端角色守卫
- 患者/医生业务层数据隔离
- 密钥外置（`APP_JWT_SECRET` 等）
- 生产 profile 禁止自动创建固定演示账号和滚动演示排班

---

## 🗺 后续规划

- [ ] 支付 / 医保模块
- [ ] 短信 / 邮件通知
- [ ] 叫号系统
- [x] 前后端一体 Docker Compose（Nginx + 后端 + MySQL）
- [ ] CI（构建 + 测试）

---

## 📚 交付文档

- [API 接口契约](./docs/API.md)
- [部署、备份与回滚](./docs/DEPLOYMENT.md)
- [测试方案与用例](./docs/TESTING.md)
- [整体优化报告](./docs/OPTIMIZATION_REPORT.md)

---

## 📄 许可证

MIT，详见 [LICENSE](./LICENSE)。

---

<div align="center">

**如果这个项目对你有帮助，欢迎点一个 ⭐**

Spring Boot + React · 可演示 · 适合学习

</div>
