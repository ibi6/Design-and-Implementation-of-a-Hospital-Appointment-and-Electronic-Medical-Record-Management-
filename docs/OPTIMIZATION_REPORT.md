# 项目整体审计与优化报告

## 结论

项目保持 React + Spring Boot 单体架构最合适。主要风险集中在生产边界：错误返回 HTTP 200、JWT 存浏览器、号源读改写竞态、演示排班过期、异步失败无反馈、移动管理表格不友好，以及 Compose 只包含 MySQL。

## 已实施

### 后端与安全

- 401/403/429/500 使用真实 HTTP 状态并保留统一响应体。
- HttpOnly Cookie 浏览器会话；Bearer 兼容自动化/非浏览器客户端。
- 登录失败 5 次/15 分钟限流；输入长度、手机、枚举、日期、号源范围校验。
- 统计与停用数据限制管理员；500 不泄露内部消息。
- 生产 profile 要求外部 JWT/数据库配置并关闭 H2 Console、Swagger。

### 数据库与性能

- 号源通过条件 `UPDATE` 原子预占/释放；排班行锁防同患者并发重复预约，预约取消/完成使用比较并交换式状态更新。
- 增加 CHECK、外键、唯一约束和查询索引。
- 统计由数据库 `COUNT` 完成；演示库启动时补齐未来 7 天排班。

### UI / UX

- 保留医疗青绿品牌，强化信息层级和状态色。
- 全按钮 44px；表单错误有 ARIA 关联。
- Modal/抽屉支持 dialog、Esc、焦点恢复和滚动锁。
- 核心数据页有加载、空、失败、重试状态；顶层错误边界防白屏。
- 管理用户页手机卡片化，清除失真的 Mock/浏览器存储文案。
- 开发环境改为同源 API 代理，清理遗留直连配置；医院日期固定按 `Asia/Shanghai` 计算，避免 UTC 跨日偏移。
- 路由拆包后入口 JS 从 326.68 kB 降至 253.34 kB，约减少 22.4%。

### 测试与部署

- 新增 Vitest/Testing Library；后端 13 个集成测试和 1 个限流单元测试覆盖认证、权限、Cookie、限流、输入、号源、状态竞争和滚动排班，前端 13 个测试覆盖 HTTP、组件可访问性、时区与安全跳转。
- Compose 覆盖 MySQL、后端、Nginx；含健康检查、内部网络和必填密钥。
- Nginx 提供 SPA fallback、同源 API、gzip、缓存、CSP 和安全头。
- 真实浏览器已在 375×812、768×1024、1440×1000 验证 Cookie 会话、响应式布局、抽屉/Modal 焦点与滚动锁，页面控制台无错误或警告。

## ER 关系

```text
sys_user 1 ── 0..1 doctor
department 1 ── * doctor
doctor 1 ── * schedule
sys_user(PATIENT) 1 ── * appointment
schedule 1 ── * appointment
appointment 1 ── 0..1 medical_record
```

建表脚本：H2 `backend/src/main/resources/schema.sql`；MySQL `backend/src/main/resources/schema-mysql-tables.sql`；Docker `docker/mysql-init/01-schema.sql`。

## 后续按规模演进

- 多实例时把登录限流迁移到 Redis。
- 医疗生产需增加审计日志、隐私合规、KMS、灾备演练和第三方渗透测试。
- 长期数据库变更接入 Flyway。
- 通知、支付、医保、多院区仍为范围外功能。
