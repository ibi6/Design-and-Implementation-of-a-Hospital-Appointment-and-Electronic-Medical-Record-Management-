# 纯中文仓库 README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `ibi6/Hospital` 的 GitHub 默认首页只保留一份中文 README，并清除失效的双语入口。

**Architecture:** 根目录只保留 `README.md` 作为仓库门面，以当前 `README.zh-CN.md` 为权威中文内容来源。删除重复文件后，只修改仍面向使用者的有效链接；历史规格和计划文件保留原始实施记录。

**Tech Stack:** GitHub Flavored Markdown、Git

## Global Constraints

- 面向仓库访问者的标题、导航、章节和说明必须使用中文。
- Java、Spring Boot、React、JWT、API、Docker 等技术专名和命令保持原样。
- 不修改前后端代码、数据库、接口、部署配置或截图资源。
- 最终推送到 `origin/main`，不得强制推送。

---

### Task 1: 合并为唯一中文 README

**Files:**
- Modify: `README.md`
- Delete: `README.zh-CN.md`
- Modify: `frontend/README.md`

**Interfaces:**
- Consumes: 当前 `README.zh-CN.md` 的完整中文章节结构、图片、徽章和命令。
- Produces: GitHub 默认读取的唯一中文入口 `README.md`。

- [ ] **Step 1: 记录改动前的双语入口**

Run:

```powershell
rg -n "English|简体中文|README\.zh-CN|Features|Quick Start" README.md README.zh-CN.md frontend/README.md
```

Expected: 根目录两个 README 存在语言切换，`frontend/README.md` 指向 `README.zh-CN.md`。

- [ ] **Step 2: 用中文内容重建默认 README**

使用 `README.zh-CN.md` 的完整内容替换 `README.md`，并执行以下精确调整：

```text
删除顶部：English · 简体中文
将英文副标题替换为：患者预约 · 医生接诊 · 电子病历 · 后台管理
目录树末尾改为：└── README.md
删除底部：English · 简体中文
```

保留现有中文章节、截图、徽章、API、测试、部署、安全、路线图和交付文档链接。

- [ ] **Step 3: 删除重复中文文件并修正有效引用**

删除 `README.zh-CN.md`，并将 `frontend/README.md` 中：

```markdown
[README.zh-CN.md](../README.zh-CN.md)
```

替换为：

```markdown
[README.md](../README.md)
```

- [ ] **Step 4: 验证中文单版本结果**

Run:

```powershell
if (Test-Path README.zh-CN.md) { throw "README.zh-CN.md still exists" }
rg -n "English|简体中文|Features|Screenshots|Architecture|Quick Start|Demo Accounts" README.md
rg -n "README\.zh-CN" README.md frontend/README.md backend/README.md docs -g "*.md" -g "!docs/superpowers/**"
git diff --check
```

Expected: 两次 `rg` 均无结果，文件不存在，`git diff --check` 通过。

### Task 2: 提交并发布到 GitHub

**Files:**
- Create: `docs/superpowers/plans/2026-07-17-chinese-readme-only.md`
- Verify: Git index、`origin/main`

**Interfaces:**
- Consumes: Task 1 已验证的纯中文文档改动。
- Produces: `ibi6/Hospital` 的中文默认仓库首页。

- [ ] **Step 1: 审核提交范围**

Run:

```powershell
git status --short
git diff --stat
git diff --check
```

Expected: 仅 README、引用修正和本计划文件发生变化。

- [ ] **Step 2: 创建提交**

Run:

```powershell
git add README.md README.zh-CN.md frontend/README.md docs/superpowers/plans/2026-07-17-chinese-readme-only.md
git diff --cached --check
git commit -m "docs: make repository README Chinese-only"
```

Expected: 提交成功且工作区干净。

- [ ] **Step 3: 快进推送并校验远程**

Run:

```powershell
git push origin HEAD:main
git ls-remote origin refs/heads/main
git rev-parse HEAD
```

Expected: 远程 `main` 与本地 `HEAD` 哈希一致，不使用 `--force`。

## Self-Review

- Spec coverage: 唯一中文入口、删除重复文件、有效链接修正、验证、提交和推送均映射到具体步骤。
- Placeholder scan: 未发现任何占位符。
- Consistency: 文件名、提交目标和验收命令前后一致；历史规格目录明确排除在有效链接扫描之外。
