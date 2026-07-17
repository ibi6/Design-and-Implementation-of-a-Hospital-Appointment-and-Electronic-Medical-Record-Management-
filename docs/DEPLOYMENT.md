# 部署、备份与回滚

## Docker Compose 部署

要求：Docker Desktop / Docker Engine 24+，Compose v2。

```powershell
Copy-Item .env.example .env
# 编辑 .env：替换 APP_JWT_SECRET、MYSQL_PASSWORD、MYSQL_ROOT_PASSWORD
powershell -File scripts/start-stack.ps1
docker compose ps
```

默认访问 `http://localhost:8088`。数据库仅绑定 `127.0.0.1:3306`，后端只在内部网络暴露，由 Nginx 同源代理 `/api`。

| 变量 | 必填 | 说明 |
|---|---|---|
| `APP_JWT_SECRET` | 是 | 至少 32 个随机字节 |
| `MYSQL_PASSWORD` | 是 | 应用数据库用户密码 |
| `MYSQL_ROOT_PASSWORD` | 是 | 与应用密码不同 |
| `WEB_PORT` | 否 | 默认 8088 |
| `MYSQL_PORT` | 否 | 默认 3306，仅本机绑定 |
| `APP_COOKIE_SECURE` | 生产 HTTPS 是 | HTTPS 部署设为 `true` |

生成密钥：`[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))`。

## HTTPS

生产必须增加 TLS 终止层，并设置 `APP_COOKIE_SECURE=true`、`APP_COOKIE_SAME_SITE=Lax`。外层代理必须传递 `X-Forwarded-Proto`。

## 健康与日志

```powershell
docker compose ps
docker compose logs --tail 200 backend
docker compose logs --tail 200 frontend
Invoke-RestMethod http://localhost:8088/api/health
```

## MySQL 备份与恢复

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
docker compose exec -T mysql sh -c 'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --single-transaction --routines --triggers "$MYSQL_DATABASE"' | Set-Content -Encoding utf8 "backup-$stamp.sql"
```

校验备份非空并加密复制到异机/对象存储，至少保留 7 天。恢复前停止写入：

```powershell
docker compose stop frontend backend
Get-Content -Raw .\backup-YYYYMMDD-HHMMSS.sql | docker compose exec -T mysql sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
docker compose start backend frontend
```

## 发布与回滚

1. 镜像使用不可变版本标签；发布前执行 `docs/TESTING.md` 并备份数据库。
2. 记录当前镜像标签和 Git 提交。
3. 回滚时切回上一镜像标签并执行 `docker compose up -d`。
4. 若数据库不向后兼容，停止写入后恢复发布前备份。

当前使用幂等建表脚本；长期迭代建议接入 Flyway。

## 本地非容器运行

```powershell
powershell -File scripts/start-backend.ps1
powershell -File scripts/start-frontend.ps1
```

Vite 将 `/api` 代理到 `127.0.0.1:8080`，避免本地跨域和 Cookie 差异。
