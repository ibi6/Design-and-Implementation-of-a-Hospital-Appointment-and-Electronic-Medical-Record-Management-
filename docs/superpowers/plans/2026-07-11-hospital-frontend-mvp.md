# 医院预约挂号与电子病历 — 前端展示版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付可本地运行的 React 前端展示版，三角色（患者/医生/管理员）主流程用 Mock 数据完整可点。

**Architecture:** 单仓 `frontend/` SPA。Mock API 层与真实后端路径对齐（`/api/*`），内存+localStorage 持久化。按角色分路由与布局；UI 为医疗青绿 SaaS 风格。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, lucide-react, date-fns（可选）

## Global Constraints

- 文案：中文
- 演示账号：`patient` / `doctor` / `admin`，密码均为 `123456`
- 主色：医疗青绿 + 靛蓝（非默认紫粉 AI 风）
- 一期不做真实后端；所有数据走 `src/mocks` + `src/services/api.ts`
- 预约状态：`PENDING | COMPLETED | CANCELLED | NO_SHOW`
- 角色：`PATIENT | DOCTOR | ADMIN`
- 规格来源：`docs/superpowers/specs/2026-07-11-hospital-appointment-emr-design.md`
- 每个列表页必须有 loading / empty 状态
- 提交前保证 `npm run build` 通过

---

## File Structure

```
frontend/
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  tailwind.config.js
  postcss.config.js
  index.html
  README.md
  src/
    main.tsx
    App.tsx
    index.css
    types/index.ts
    mocks/seed.ts
    mocks/store.ts
    services/api.ts
    context/AuthContext.tsx
    lib/utils.ts
    components/ui/
      Button.tsx
      Input.tsx
      Card.tsx
      Badge.tsx
      Empty.tsx
      Spinner.tsx
      Modal.tsx
      Textarea.tsx
      Select.tsx
      StatCard.tsx
    components/layout/
      AppShell.tsx
      Sidebar.tsx
      Topbar.tsx
      ProtectedRoute.tsx
    pages/
      LandingPage.tsx
      LoginPage.tsx
      RegisterPage.tsx
      NotFoundPage.tsx
      patient/
        PatientDashboard.tsx
        DepartmentsPage.tsx
        DoctorsPage.tsx
        DoctorDetailPage.tsx
        AppointmentsPage.tsx
        RecordsPage.tsx
        RecordDetailPage.tsx
        ProfilePage.tsx
      doctor/
        DoctorDashboard.tsx
        DoctorAppointmentsPage.tsx
        WriteRecordPage.tsx
        DoctorSchedulesPage.tsx
        DoctorRecordsPage.tsx
        DoctorProfilePage.tsx
      admin/
        AdminDashboard.tsx
        AdminDepartmentsPage.tsx
        AdminDoctorsPage.tsx
        AdminSchedulesPage.tsx
        AdminAppointmentsPage.tsx
        AdminUsersPage.tsx
```

---

### Task 1: 脚手架与 Tailwind

**Files:**
- Create: `frontend/` 全部 Vite 配置与入口
- Create: `frontend/src/index.css`, `frontend/src/main.tsx`, `frontend/src/App.tsx`（占位）
- Create: `frontend/README.md`（启动说明骨架）

**Interfaces:**
- Produces: 可 `npm run dev` 的空应用，页面显示「医院预约系统」

- [ ] **Step 1: 用 Vite 创建项目**

```bash
cd <project-root>
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom lucide-react clsx
```

若 `create vite` 交互失败，手动创建 `package.json`：

```json
{
  "name": "hospital-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.6.2",
    "vite": "^5.4.11"
  }
}
```

- [ ] **Step 2: 配置 Vite + Tailwind v4**

`frontend/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173, host: true },
})
```

`frontend/src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #ecfdf8;
  --color-brand-100: #d1faf0;
  --color-brand-200: #a7f3e1;
  --color-brand-300: #6ee7cb;
  --color-brand-400: #34d3ad;
  --color-brand-500: #0d9488;
  --color-brand-600: #0f766e;
  --color-brand-700: #115e59;
  --color-brand-800: #134e4a;
  --color-brand-900: #134e4a;
  --color-ink: #0f172a;
  --color-muted: #64748b;
  --font-sans: "Segoe UI", "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif;
}

html, body, #root {
  height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--color-ink);
  background: #f8fafc;
  -webkit-font-smoothing: antialiased;
}
```

`frontend/tsconfig.app.json` 确保 paths：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

（保留 Vite 模板其余 compilerOptions，合并 paths。）

- [ ] **Step 3: 最小入口**

`frontend/src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

`frontend/src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100">
      <h1 className="text-3xl font-semibold text-brand-700 tracking-tight">
        医院预约挂号与电子病历系统
      </h1>
    </div>
  )
}
```

`frontend/index.html` title 改为：`智慧医院 · 预约挂号与电子病历`

- [ ] **Step 4: 验证启动**

```bash
cd frontend
npm run dev
```

Expected: 浏览器 `http://localhost:5173` 显示标题，无控制台报错。

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: scaffold hospital frontend with Vite React Tailwind"
```

---

### Task 2: 类型、种子数据与 Mock Store

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/mocks/seed.ts`
- Create: `frontend/src/mocks/store.ts`
- Create: `frontend/src/lib/utils.ts`

**Interfaces:**
- Produces:
  - Types: `UserRole`, `User`, `Department`, `Doctor`, `Schedule`, `Appointment`, `MedicalRecord`, `AppointmentStatus`
  - `loadStore(): AppStore` / `saveStore(store: AppStore): void` / `resetStore(): AppStore`
  - `cn(...classes): string`

- [ ] **Step 1: 定义类型**

`frontend/src/types/index.ts`:

```ts
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN'
export type AppointmentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type EntityStatus = 'ACTIVE' | 'DISABLED'
export type TimeSlot = 'MORNING' | 'AFTERNOON'

export interface User {
  id: string
  username: string
  password: string
  realName: string
  phone: string
  role: UserRole
  status: EntityStatus
  avatarUrl?: string
  createdAt: string
}

export interface Department {
  id: string
  name: string
  description: string
  sortOrder: number
  status: EntityStatus
}

export interface Doctor {
  id: string
  userId: string
  departmentId: string
  title: string
  specialty: string
  introduction: string
  status: EntityStatus
}

export interface Schedule {
  id: string
  doctorId: string
  workDate: string // YYYY-MM-DD
  timeSlot: TimeSlot
  totalQuota: number
  reservedCount: number
  status: EntityStatus
}

export interface Appointment {
  id: string
  appointmentNo: string
  patientId: string
  doctorId: string
  scheduleId: string
  departmentId: string
  status: AppointmentStatus
  symptomNote: string
  createdAt: string
  cancelledAt?: string
}

export interface MedicalRecord {
  id: string
  recordNo: string
  appointmentId: string
  patientId: string
  doctorId: string
  chiefComplaint: string
  presentIllness: string
  physicalExam: string
  diagnosis: string
  treatment: string
  prescription: string
  createdAt: string
  updatedAt: string
}

export interface AppStore {
  users: User[]
  departments: Department[]
  doctors: Doctor[]
  schedules: Schedule[]
  appointments: Appointment[]
  records: MedicalRecord[]
}
```

- [ ] **Step 2: utils**

`frontend/src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function delay(ms = 350) {
  return new Promise((r) => setTimeout(r, ms))
}

export function formatDate(iso: string) {
  return iso.slice(0, 10)
}

export function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function genNo(prefix: string) {
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `${prefix}${stamp}${Math.floor(Math.random() * 9000 + 1000)}`
}

export const TIME_SLOT_LABEL: Record<string, string> = {
  MORNING: '上午 08:30-12:00',
  AFTERNOON: '下午 14:00-17:30',
}

export const STATUS_LABEL: Record<string, string> = {
  PENDING: '待就诊',
  COMPLETED: '已就诊',
  CANCELLED: '已取消',
  NO_SHOW: '爽约',
}
```

- [ ] **Step 3: 种子数据**

`frontend/src/mocks/seed.ts` — 至少包含：

- 3 用户：patient/doctor/admin（密码 `123456`）
- 6 个科室（内科、外科、儿科、妇科、骨科、皮肤科）
- 6 名医生（含 doctor 用户对应的 1 名，挂内科）
- 未来 7 天 × 上午/下午 号源（每班 totalQuota=10）
- 2～3 条示例预约（含 PENDING）
- 1 条示例病历（可选）

关键字段示例（完整数组在实现时写满）：

```ts
import type { AppStore } from '@/types'

export function createSeed(): AppStore {
  const users = [
    {
      id: 'u_patient',
      username: 'patient',
      password: '123456',
      realName: '张小明',
      phone: '13800001111',
      role: 'PATIENT' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_doctor',
      username: 'doctor',
      password: '123456',
      realName: '李华',
      phone: '13800002222',
      role: 'DOCTOR' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'u_admin',
      username: 'admin',
      password: '123456',
      realName: '系统管理员',
      phone: '13800003333',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-07-01T08:00:00.000Z',
    },
  ]
  // ... departments, doctors, schedules for next 7 days, sample appointments
  return { users, departments: [], doctors: [], schedules: [], appointments: [], records: [] }
}
```

实现时必须把 departments/doctors/schedules 填完整（不要留空数组）。

- [ ] **Step 4: Store 持久化**

`frontend/src/mocks/store.ts`:

```ts
import type { AppStore } from '@/types'
import { createSeed } from './seed'

const KEY = 'hospital_mvp_store_v1'

export function loadStore(): AppStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AppStore
  } catch {
    /* ignore */
  }
  const seed = createSeed()
  saveStore(seed)
  return seed
}

export function saveStore(store: AppStore) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function resetStore(): AppStore {
  const seed = createSeed()
  saveStore(seed)
  return seed
}

export function updateStore(mutator: (draft: AppStore) => void): AppStore {
  const store = loadStore()
  mutator(store)
  saveStore(store)
  return store
}
```

- [ ] **Step 5: 浏览器控制台快速校验**

在任意临时页面 `import { loadStore } from '@/mocks/store'` 并 `console.log(loadStore())`，确认 users≥3、departments≥6、schedules≥20。

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types frontend/src/mocks frontend/src/lib
git commit -m "feat: add domain types, seed data and mock store"
```

---

### Task 3: Mock API 与 AuthContext

**Files:**
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/context/AuthContext.tsx`

**Interfaces:**
- Consumes: `loadStore`, `updateStore`, types
- Produces API functions（均返回 `Promise<T>`，内置 `delay()`）：
  - `login(username, password): Promise<UserPublic>`
  - `register(payload): Promise<UserPublic>`
  - `getDepartments()`, `getDoctors(filters?)`, `getDoctor(id)`
  - `getSchedules(doctorId)`, `createAppointment(...)`, `getAppointments(filters)`, `cancelAppointment(id)`
  - `getRecords(filters)`, `getRecord(id)`, `createRecord(payload)`
  - Admin CRUD: departments/doctors/schedules/users + `getStats()`
- AuthContext: `{ user, login, logout, register, loading }`

- [ ] **Step 1: 实现 api.ts 核心认证与查询**

`UserPublic` = 去掉 `password` 的 User。

`login` 逻辑：找 username+password+ACTIVE，失败 throw `Error('用户名或密码错误')`。

`createAppointment` 逻辑：
1. schedule 存在且 `reservedCount < totalQuota`
2. 同 patient+schedule 无 PENDING 重复
3. reservedCount++，push appointment PENDING

`cancelAppointment`：仅 PENDING，归属校验在调用方或 api 内传 patientId。

`createRecord`：写病历 + appointment → COMPLETED，禁止重复病历。

Admin 的 create/update 直接改 store。

所有方法开头 `await delay(300~500)`。

- [ ] **Step 2: AuthContext**

```tsx
// 关键结构
const AuthContext = createContext<AuthContextValue | null>(null)
const AUTH_KEY = 'hospital_mvp_auth_user_id'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // load user id from localStorage, hydrate from store
  // login/register/logout
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

`main.tsx` 用 `AuthProvider` 包裹 `App`。

- [ ] **Step 3: 手动验证**

临时按钮调用 `login('patient','123456')`，应拿到 `role: PATIENT`。

- [ ] **Step 4: Commit**

```bash
git add frontend/src/services frontend/src/context frontend/src/main.tsx
git commit -m "feat: mock API layer and auth context"
```

---

### Task 4: UI 基础组件与布局壳

**Files:**
- Create: `frontend/src/components/ui/*`（Button, Input, Card, Badge, Empty, Spinner, Modal, Textarea, Select, StatCard）
- Create: `frontend/src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `ProtectedRoute.tsx`

**Interfaces:**
- `ProtectedRoute` props: `{ roles?: UserRole[], children }`
- `AppShell` props: `{ nav: NavItem[], title: string, children }`
- `NavItem`: `{ to, label, icon }`

- [ ] **Step 1: UI 组件**

统一风格：
- Button variants: `primary | secondary | ghost | danger`；sizes `sm | md`
- primary: `bg-brand-600 hover:bg-brand-700 text-white rounded-xl`
- Card: `bg-white rounded-2xl border border-slate-100 shadow-sm`
- Badge 按状态色：PENDING 琥珀、COMPLETED 绿、CANCELLED 灰、NO_SHOW 红
- Empty: 图标 + 标题 + 描述 + 可选 action
- Spinner: brand 色旋转环

- [ ] **Step 2: 布局**

- 桌面：左侧固定 240px 侧栏（品牌名「慧医通」+ 导航 + 底部用户）
- 顶栏：页面标题 + 角色标签 + 退出
- 移动：顶栏汉堡展开抽屉导航
- 背景：`bg-slate-50`，内容区 `p-4 md:p-6 max-w-7xl`

- [ ] **Step 3: ProtectedRoute**

未登录 → `/login?redirect=...`  
角色不匹配 → 重定向到该用户角色首页（`/patient` | `/doctor` | `/admin`）

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components
git commit -m "feat: UI primitives and app shell layout"
```

---

### Task 5: 公共页 + 路由总表

**Files:**
- Create: `frontend/src/pages/LandingPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `NotFoundPage.tsx`
- Modify: `frontend/src/App.tsx` — 完整 Routes

**Interfaces:**
- 登录成功按 role 跳转：`PATIENT→/patient`, `DOCTOR→/doctor`, `ADMIN→/admin`
- 登录页提供三个「一键填入演示账号」按钮

- [ ] **Step 1: Landing**

英雄区：标题「慧医通 · 预约挂号与电子病历」、副文案、主按钮「立即预约/登录」、三列特性卡片（在线预约、电子病历、智能管理）。

- [ ] **Step 2: Login / Register**

卡片居中、品牌色、表单校验（必填）。Register 仅创建 PATIENT，成功后自动登录进患者端。

- [ ] **Step 3: App 路由**

```tsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  {/* patient / doctor / admin nested routes — 页面可先占位再下任务填满 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

本任务把三角色子路由都挂上，对应页面可先简单标题占位，后续 Task 替换为完整页。

- [ ] **Step 4: 验证**

访问 `/`、`/login`，一键登录 patient 进入 `/patient`。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages frontend/src/App.tsx
git commit -m "feat: landing, auth pages and route table"
```

---

### Task 6: 患者端完整页面

**Files:**
- Create/Modify: `frontend/src/pages/patient/*`

**Interfaces:**
- 使用 api：`getDepartments`, `getDoctors`, `getDoctor`, `getSchedules`, `createAppointment`, `getAppointments`, `cancelAppointment`, `getRecords`, `getRecord`

- [ ] **Step 1: PatientDashboard**

KPI：待就诊数、历史就诊、病历数；快捷入口「去挂号」「我的预约」；最近 3 条预约列表。

- [ ] **Step 2: 科室 / 医生列表 / 医生详情预约**

- Departments：网格卡片
- Doctors：筛选科室、搜索姓名
- DoctorDetail：医生信息 + 未来号源表（日期、时段、剩余）+ 症状备注 +「确认预约」
- 成功后 toast/提示并跳转我的预约

- [ ] **Step 3: 我的预约**

Tabs 或筛选：全部/待就诊/已完成/已取消；取消按钮仅 PENDING；Empty 引导去挂号。

- [ ] **Step 4: 病历列表与详情**

只读展示主诉/诊断/处方等；无数据 Empty。

- [ ] **Step 5: 个人中心**

展示姓名手机角色；「重置演示数据」调用 `resetStore()` 并 logout 或刷新（便于答辩重来）。

- [ ] **Step 6: 走查**

patient 登录 → 预约 → 列表可见 → 取消另一条。

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/patient
git commit -m "feat: patient portal appointment and records UI"
```

---

### Task 7: 医生端完整页面

**Files:**
- Create/Modify: `frontend/src/pages/doctor/*`

- [ ] **Step 1: DoctorDashboard**

今日待接诊、已完成；快捷进入接诊列表。

- [ ] **Step 2: 接诊列表 + 写病历**

- 列表显示患者、时段、症状、状态
- PENDING 显示「接诊写病历」
- WriteRecordPage：表单字段齐全，提交调用 `createRecord`，成功返回列表

- [ ] **Step 3: 我的排班 + 历史病历 + 个人中心**

排班只读展示本人 schedule；历史病历可点详情（复用只读组件或同页）。

- [ ] **Step 4: 跨角色走查**

patient 预约 → doctor 写病历 → patient 病历可见、预约 COMPLETED。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/doctor
git commit -m "feat: doctor portal consultation and EMR write UI"
```

---

### Task 8: 管理端完整页面

**Files:**
- Create/Modify: `frontend/src/pages/admin/*`

- [ ] **Step 1: AdminDashboard**

StatCard：用户数、医生数、今日预约、待就诊、已完成、科室数。可用简单条形/占比展示（纯 CSS 或 div 进度条，不强制图表库）。

- [ ] **Step 2: 科室 / 医生 CRUD UI**

表格 + Modal 新增/编辑；状态启用停用。

- [ ] **Step 3: 排班管理**

按医生筛选；新增排班（日期、时段、号源）；列表展示剩余。

- [ ] **Step 4: 预约管理 + 用户管理**

全量预约筛选；用户列表只读为主，可禁用/启用。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin
git commit -m "feat: admin dashboard and management pages"
```

---

### Task 9: 打磨、README 与验收

**Files:**
- Modify: 全局样式与空/加载状态查漏
- Create/Modify: `frontend/README.md`
- Create/Modify: 根目录 `README.md`

- [ ] **Step 1: 全局检查清单**

- [ ] 所有角色导航无死链
- [ ] 加载态与空态
- [ ] 移动端侧栏可用
- [ ] `npm run build` 零错误
- [ ] 演示脚本 5 步可走通（见设计文档 §10）

- [ ] **Step 2: README**

`frontend/README.md` 与根 `README.md` 写明：

```markdown
# 慧医通 · 医院预约挂号与电子病历

## 阶段一：前端展示版

### 启动
cd frontend
npm install
npm run dev
# http://localhost:5173

### 演示账号
| 账号 | 密码 | 角色 |
| patient | 123456 | 患者 |
| doctor | 123456 | 医生 |
| admin | 123456 | 管理员 |

### 已完成页面
（列表）

### 仍为 Mock
全部业务数据与鉴权均为前端 Mock（localStorage），待确认 UI 后接入 SpringBoot。
```

- [ ] **Step 3: 最终 commit**

```bash
git add frontend README.md
git commit -m "docs: frontend MVP README and polish for demo"
```

- [ ] **Step 4: 交付说明（给用户）**

输出：完成内容、启动命令、访问地址、Mock 范围、下一步（等确认后做 SpringBoot）。

---

## Spec Coverage Check

| 规格项 | 任务 |
|--------|------|
| 三角色登录/注册 | T3, T5 |
| 预约挂号流程 | T3, T6 |
| 电子病历读写 | T3, T6, T7 |
| 排班号源 | T2, T6, T7, T8 |
| 管理端 CRUD/看板 | T8 |
| 加载/空状态 | T4, T6–T8, T9 |
| 演示账号 | T2, T5, T9 |
| 不做支付/住院等 | 全任务未包含 |
| API 路径可对齐后端 | T3 |

## Placeholder Scan

无 TBD；种子数据在 T2 要求写满；API 行为在 T3 写明状态机。

## Type Consistency

统一使用 `types/index.ts` 中的 `AppointmentStatus`、`UserRole`、`TimeSlot`；API 与页面不得另造状态字符串。

---

## Execution Handoff

计划完成后，推荐 **Subagent-Driven** 按 Task 1→9 执行；或本会话 **Inline Execution** 连续推进。

阶段一完成后暂停大规模后端，等待用户确认 UI。
