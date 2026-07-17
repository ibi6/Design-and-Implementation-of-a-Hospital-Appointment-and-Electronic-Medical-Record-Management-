# 慧医通全栈优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The user requested inline continuous execution; do not dispatch subagents.

**Goal:** 在不重写现有 React + Spring Boot 架构的前提下，修复高风险安全与数据一致性问题，完成 UI/响应式、测试和容器交付优化。

**Architecture:** 浏览器通过 Vite 开发代理或 Nginx 生产代理同源访问 `/api`；Spring Security 同时接受 HttpOnly Cookie 与 Bearer Token；业务服务通过数据库原子更新维护号源。前端建立可访问的状态与浮层组件，后端以真实 HTTP 状态返回统一错误体。

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Vitest, Spring Boot 3.3, Java 21, MyBatis-Plus, H2/MySQL 8, Docker, Nginx

## Global Constraints

- 保留 `{ code, message, data }` 响应体和既有成功页面契约。
- 浏览器不得把 JWT 持久化到 localStorage/sessionStorage。
- 患者只能访问本人预约/病历，医生只能访问本人接诊/病历，统计仅管理员访问。
- 所有新业务行为先写失败测试并观察预期失败，再写生产代码。
- 手机交互目标最小高度 44px；弹窗/抽屉必须支持键盘与焦点管理。
- 生产密钥只来自环境变量；生产关闭 H2 Console 与 OpenAPI。

---

### Task 1: 标准 HTTP 错误与安全会话

**Files:**
- Modify: `backend/src/test/java/com/hospital/CoreApiIntegrationTest.java`
- Create: `backend/src/main/java/com/hospital/security/AuthCookieService.java`
- Create: `backend/src/main/java/com/hospital/security/LoginAttemptService.java`
- Modify: `backend/src/main/java/com/hospital/controller/AuthController.java`
- Modify: `backend/src/main/java/com/hospital/security/JwtAuthFilter.java`
- Modify: `backend/src/main/java/com/hospital/security/SecurityConfig.java`
- Modify: `backend/src/main/java/com/hospital/common/GlobalExceptionHandler.java`
- Modify: `backend/src/main/resources/application.yml`

**Interfaces:**
- `AuthCookieService.write(HttpServletResponse, String)` writes the JWT Cookie.
- `AuthCookieService.clear(HttpServletResponse)` expires the Cookie.
- `LoginAttemptService.assertAllowed(String)`, `recordFailure(String)`, `recordSuccess(String)` enforce five failures per 15 minutes.
- `POST /api/auth/logout` returns success and clears Cookie.

- [ ] **Step 1: Write failing integration tests**

Add assertions equivalent to:

```java
mockMvc.perform(post("/api/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"username\":\"patient\",\"password\":\"wrong\"}"))
    .andExpect(status().isUnauthorized())
    .andExpect(jsonPath("$.code").value(401));

mockMvc.perform(get("/api/auth/me"))
    .andExpect(status().isUnauthorized());

mockMvc.perform(post("/api/auth/logout"))
    .andExpect(status().isOk())
    .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
```

- [ ] **Step 2: Verify RED**

Run: `..\.tools\apache-maven-3.9.6\bin\mvn.cmd -Dtest=CoreApiIntegrationTest test`
Expected: current endpoints return HTTP 200 for failures and logout is 404.

- [ ] **Step 3: Implement minimal session and status mapping**

Map `BizException.code` to `HttpStatus`, return generic 500 messages, add Cookie read/write/clear and logout. Keep Bearer parsing as the first authentication option, Cookie as browser fallback.

- [ ] **Step 4: Add and verify login limit tests**

Use a unique username, submit six bad passwords, and assert the sixth response is HTTP/code 429. Run the focused test and then the full backend suite.

---

### Task 2: 输入校验、RBAC 与生产配置

**Files:**
- Modify: `backend/src/main/java/com/hospital/dto/Dtos.java`
- Modify: `backend/src/main/java/com/hospital/controller/StatsController.java`
- Modify: `backend/src/main/java/com/hospital/controller/DepartmentController.java`
- Modify: `backend/src/main/java/com/hospital/controller/DoctorController.java`
- Create: `backend/src/main/resources/application-prod.yml`
- Modify: `.env.example`

**Interfaces:**
- Username: 3–32 letters, digits, `_` or `-`.
- Phone: 11 mainland-mobile digits for the current product scope.
- Text fields have database-aligned maximum lengths.
- `StatsController.overview()` requires `ADMIN`.

- [ ] **Step 1: Write invalid-input and RBAC tests**

Test malformed phone, oversized symptom text, invalid time slot, non-positive quota, and patient access to stats. Expected HTTP 400/403.

- [ ] **Step 2: Verify RED**

Run the focused backend tests and confirm at least one invalid payload currently succeeds.

- [ ] **Step 3: Add Bean Validation and production profile**

Add `@Pattern`, `@Size`, `@Positive`, `@FutureOrPresent` and explicit role annotations. Production profile disables developer consoles and requires `${APP_JWT_SECRET}`.

- [ ] **Step 4: Verify GREEN**

Run the focused tests and full `mvn test`.

---

### Task 3: 原子号源、数据约束与演示数据保鲜

**Files:**
- Modify: `backend/src/main/java/com/hospital/mapper/ScheduleMapper.java`
- Modify: `backend/src/main/java/com/hospital/service/AppointmentService.java`
- Modify: `backend/src/main/java/com/hospital/config/DataSeeder.java`
- Modify: `backend/src/main/resources/schema.sql`
- Modify: `backend/src/main/resources/schema-mysql-tables.sql`
- Modify: `backend/src/main/resources/schema-mysql.sql`
- Modify: `docker/mysql-init/01-schema.sql`
- Modify: `backend/src/test/java/com/hospital/CoreApiIntegrationTest.java`

**Interfaces:**
- `int reserveQuota(Long scheduleId, LocalDateTime updatedAt)` returns 1 only when a slot is available.
- `int releaseQuota(Long scheduleId, LocalDateTime updatedAt)` never decrements below zero.
- `DataSeeder.ensureFutureSchedules()` creates only missing active schedules for today through day +6.

- [ ] **Step 1: Write quota boundary and future-schedule tests**

Create a one-quota schedule, book once, assert the second patient receives 400 and `reservedCount` remains 1. Assert active doctors have a schedule on day +6 after seeding.

- [ ] **Step 2: Verify RED**

Run focused tests; confirm the current read-then-write reservation path or non-refreshing seed fails the new contract.

- [ ] **Step 3: Implement atomic mapper operations and schema indexes**

Use parameter-bound `@Update` statements. Add unique schedule/doctor constraints, foreign keys, check constraints and query indexes consistently to H2 and MySQL scripts.

- [ ] **Step 4: Verify GREEN**

Run backend tests twice to prove idempotent schema/seed startup.

---

### Task 4: Frontend Cookie 客户端、错误契约与测试基线

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/test/setup.ts`
- Create: `frontend/src/services/http.test.ts`
- Modify: `frontend/src/services/http.ts`
- Modify: `frontend/src/services/api.ts`
- Modify: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/context/auth-routing.ts`

**Interfaces:**
- `http<T>()` uses relative `/api`, `credentials: 'include'`, and preserves envelope messages for non-2xx responses.
- `logout()` calls `/api/auth/logout` before clearing user state.
- `homePathFor()` moves to a non-component module to satisfy fast-refresh lint.

- [ ] **Step 1: Install test tooling and write failing HTTP tests**

Use Vitest with jsdom. Mock `fetch` and assert `credentials: 'include'`, non-2xx envelope messages, malformed response handling and absence of localStorage token writes.

- [ ] **Step 2: Verify RED**

Run: `npm test -- --run src/services/http.test.ts`
Expected: current client writes/reads `hospital_token` and omits credentials.

- [ ] **Step 3: Implement Cookie client and Vite proxy**

Proxy `/api` to `http://127.0.0.1:8080` during development; use same-origin paths in production.

- [ ] **Step 4: Verify GREEN**

Run focused tests, lint, and TypeScript build.

---

### Task 5: 可访问设计系统与浮层行为

**Files:**
- Create: `frontend/src/components/ui/Dialog.tsx`
- Create: `frontend/src/components/ui/Dialog.test.tsx`
- Modify: `frontend/src/components/ui/Modal.tsx`
- Modify: `frontend/src/components/ui/Button.tsx`
- Modify: `frontend/src/components/ui/Input.tsx`
- Modify: `frontend/src/components/ui/Select.tsx`
- Modify: `frontend/src/components/ui/Textarea.tsx`
- Modify: `frontend/src/components/layout/AppShell.tsx`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Dialog supports Escape, initial focus, focus restore and body scroll lock.
- Button defaults to `type="button"`; `sm`, `md`, `lg` all meet 44px touch height.
- Form controls connect errors with `aria-invalid` and `aria-describedby`.

- [ ] **Step 1: Write failing accessibility tests**

Render a modal, verify `role=dialog`, `aria-modal=true`, Escape close, focus transfer/restore and scroll locking. Render button sizes and assert the shared minimum-height class.

- [ ] **Step 2: Verify RED**

Run the component tests and confirm current Modal lacks the dialog/focus behavior.

- [ ] **Step 3: Implement the shared primitives**

Use React effects and refs without external dialog libraries; respect `prefers-reduced-motion` and retain the restrained clinical palette.

- [ ] **Step 4: Verify GREEN**

Run component tests, lint and build.

---

### Task 6: 页面状态、管理端响应式与文案

**Files:**
- Create: `frontend/src/components/ui/AsyncState.tsx`
- Create: `frontend/src/components/errors/AppErrorBoundary.tsx`
- Modify: data-loading pages under `frontend/src/pages/**`
- Modify: `frontend/src/pages/admin/AdminUsersPage.tsx`
- Modify: `frontend/src/pages/admin/AdminDashboard.tsx`
- Modify: `frontend/src/pages/patient/ProfilePage.tsx`
- Modify: `frontend/src/pages/LoginPage.tsx`

**Interfaces:**
- Load failures render an alert with retry action instead of an empty list.
- Mobile user management uses cards; desktop uses the full table.
- UI contains no stale “Mock” or browser-local data claims.

- [ ] **Step 1: Write page tests for error and mobile content contracts**

Mock a rejected API call and assert visible error/retry; render user management and assert card and table views have explicit responsive classes.

- [ ] **Step 2: Verify RED**

Run page tests and confirm current load failures have no error UI.

- [ ] **Step 3: Implement states and page polish**

Add error capture to all initial-load effects, fix missing hook dependencies, replace stale copy and improve login connection diagnostics.

- [ ] **Step 4: Verify GREEN**

Run all frontend tests, lint and build.

---

### Task 7: 性能、Docker/Nginx 与交付文档

**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `frontend/nginx.conf`
- Modify: `docker-compose.yml`
- Modify: `scripts/start-mysql.ps1`
- Create: `scripts/start-stack.ps1`
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `frontend/README.md`
- Modify: `backend/README.md`
- Create: `docs/OPTIMIZATION_REPORT.md`
- Create: `docs/DEPLOYMENT.md`
- Create: `docs/API.md`
- Create: `docs/TESTING.md`

**Interfaces:**
- React routes are lazy-loaded behind one Suspense fallback.
- Compose services: `mysql`, `backend`, `frontend` with health-aware dependencies.
- Nginx serves SPA fallback, proxies `/api`, caches hashed assets and adds security headers.

- [ ] **Step 1: Add container definitions and validate configuration**

Run: `docker compose config`
Expected: no unresolved variable or invalid service error.

- [ ] **Step 2: Add route lazy loading and measure build output**

Run `npm run build`; expected output contains multiple route chunks and a smaller entry chunk than the 325.20 kB baseline.

- [ ] **Step 3: Complete run/deploy/backup/rollback/API/test documentation**

Document exact commands, environment variables, demo credentials, MySQL initialization, `mysqldump` backup, restore and image rollback.

- [ ] **Step 4: Run complete release verification**

Run frontend lint/tests/build/audit, backend tests/package, Docker config validation, local API smoke test and browser tests at 375/768/1440.

## Self-Review

- Spec coverage: security, data consistency, UI, responsive, error states, tests, performance, deployment and docs all map to a task.
- Placeholder scan: no TBD/TODO/“implement later”.
- Type consistency: Cookie/HTTP interfaces, mapper return types and route helpers are defined once and consumed by later tasks.
- Execution: inline only, matching the user request and the no-subagent constraint.
