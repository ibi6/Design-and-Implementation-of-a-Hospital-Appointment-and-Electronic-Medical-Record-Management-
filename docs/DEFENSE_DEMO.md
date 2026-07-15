# 答辩演示脚本（约 8–12 分钟）

## 0. 开场（30 秒）

> 本系统是「医院预约挂号与电子病历管理系统」，采用 Spring Boot + React 前后端分离。  
> 覆盖患者预约、医生接诊写病历、管理员维护与统计三类角色。

演示账号（密码均为 `123456`）：

| 账号 | 角色 |
|------|------|
| patient | 患者 |
| doctor | 医生 |
| admin | 管理员 |

访问地址：

- 前端：http://localhost:5173
- 后端 Swagger：http://localhost:8080/swagger-ui.html

---

## 1. 启动系统（1 分钟，可提前开好）

默认 H2（推荐答辩现场）：

```powershell
# 终端 1
powershell -File scripts/start-backend.ps1

# 终端 2
powershell -File scripts/start-frontend.ps1
```

可选 MySQL：

```powershell
powershell -File scripts/start-mysql.ps1
powershell -File scripts/start-backend.ps1 mysql
powershell -File scripts/start-frontend.ps1
```

---

## 2. 患者端：预约挂号（2–3 分钟）

1. 打开 http://localhost:5173  
2. 登录 `patient / 123456`  
3. 展示工作台：待就诊、病历数量  
4. 进入「找科室」→ 选内科  
5. 进入医生详情 → 选一个有余号的时段  
6. 填写症状备注（如：头晕三天）→ 确认预约  
7. 打开「我的预约」→ 展示待就诊状态  
8. （可选）再约一条后取消，说明号源会释放  

**讲解点**：号源扣减、状态机 `PENDING`、角色路由守卫。

---

## 3. 医生端：接诊写病历（2–3 分钟）

1. 退出，登录 `doctor / 123456`  
2. 工作台展示今日/待接诊  
3. 进入「接诊列表」→ 找到刚才的患者  
4. 点「接诊写病历」  
5. 填写主诉、诊断、处理意见、处方 → 提交  
6. 列表中该预约变为已完成；「历史病历」可查看  

**讲解点**：病历与预约 1:1；提交后事务内完成就诊。

---

## 4. 患者端：查看电子病历（1 分钟）

1. 重新登录 `patient`  
2. 「我的病历」→ 打开刚生成的病历详情  
3. 对照主诉/诊断/处方  

**讲解点**：患者只读本人病历；数据隔离。

---

## 5. 管理端：资源与看板（2 分钟）

1. 登录 `admin / 123456`  
2. 看板：用户数、医生数、预约状态分布  
3. 科室管理：新增/编辑科室  
4. 排班管理：为医生增加未来号源  
5. 预约管理 / 用户管理快速扫一眼  

**讲解点**：后台支撑前台业务；管理员权限分离。

---

## 6. 技术收尾（1–2 分钟）

可打开：

- Swagger：展示 API 文档  
- 架构一句话：React SPA + JWT + Spring Security + MyBatis-Plus + H2/MySQL  
- 安全：密码 BCrypt、JWT 鉴权、患者/医生数据隔离  

若被问「如何重置演示数据」：

- H2：停止后端，删除 `backend/data` 后重启  
- MySQL：重建库或清空表后重启后端（种子数据自动写入）

---

## 7. 可能提问与简答

| 问题 | 简答 |
|------|------|
| 为何前后端分离？ | 职责清晰、便于联调与扩展，符合 SpringBoot 毕设主流 |
| 为何默认 H2？ | 现场零依赖可演示；生产可切 MySQL profile |
| 并发如何处理？ | 预约扣号在服务层事务中完成；极端高并发非本课题目标 |
| 还有哪些扩展？ | 支付、短信、细粒度叫号、Docker 全栈、接口自动化测试 |

---

## 8. 应急预案

- 前端起不来：`cd frontend && npm install && npm run dev`  
- 后端起不来：确认 JDK 21；`cd backend && java -jar target/hospital-backend-1.0.0.jar`  
- 端口占用：结束 8080/5173 占用进程后重启  
- 数据乱了：删 `backend/data` 重启（H2）  
