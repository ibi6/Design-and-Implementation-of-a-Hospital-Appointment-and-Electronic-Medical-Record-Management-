# 慧医通前端

慧医通患者、医生、管理员三角色 SPA。前端使用 React 19、TypeScript 6、Vite 8 和 Tailwind CSS 4，并对接 Spring Boot `/api` 接口。

## 本地开发

先启动根目录中的后端服务，然后执行：

```powershell
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173。Vite 会把同源 `/api` 请求代理到 http://127.0.0.1:8080。

## 质量检查

```powershell
npm run lint
npm test -- --run
npm run build
```

测试覆盖 HTTP Cookie/CSRF 会话、错误响应、可访问 Modal、触控尺寸和异步错误重试状态。

## 认证与安全

- 浏览器使用后端设置的 HttpOnly、SameSite `hospital_session` Cookie。
- 请求统一使用 `credentials: include`，JWT 不写入 `localStorage` 或 `sessionStorage`。
- POST/PUT/DELETE 等浏览器写操作会先获取 CSRF Token 并自动写入请求头。
- 前端路由守卫用于用户体验；最终权限仍由后端角色和数据归属校验决定。
- 开发环境通过 Vite 同源代理访问 API；生产环境由 Nginx 反向代理 `/api`。

## 页面范围

- 公共：落地页、登录、注册、404。
- 患者：工作台、科室、医生、预约、病历、个人中心。
- 医生：工作台、接诊、病历书写、排班、历史病历。
- 管理员：数据看板、科室、医生、排班、预约和用户管理。

完整启动与部署流程见根目录 [README.md](../README.md) 和 [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)。
