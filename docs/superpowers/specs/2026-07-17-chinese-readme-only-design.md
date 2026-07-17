# GitHub 纯中文 README 设计规格

**日期：** 2026-07-17
**状态：** 用户已批准方案 A，等待书面规格确认

## 目标

让 `ibi6/Hospital` 的 GitHub 默认仓库首页只展示中文项目介绍，不再提供英文 README 或中英文切换入口。

## 文件调整

1. 以现有 `README.zh-CN.md` 为内容基础重建根目录 `README.md`。
2. 删除顶部和底部的 `English / 简体中文` 切换链接。
3. 删除英文项目副标题，导航、章节标题、说明、演示步骤和安全提示全部使用中文。
4. 保留 Java、Spring Boot、React、JWT、API、Docker 等不可替代的技术名称和代码标识符。
5. 删除重复文件 `README.zh-CN.md`。
6. 将 `frontend/README.md` 等有效文档中的中文 README 链接改为根目录 `README.md`。
7. 更新 README 目录树，确保不再列出 `README.zh-CN.md`。

## 保持不变

- 项目代码、界面、数据库、接口和部署配置不变。
- 截图、徽章、中文项目名称和现有技术说明结构不变。
- `LICENSE` 仍使用 MIT，技术命令和路径保持原样。

## 验收标准

- GitHub 默认打开 `README.md` 时，项目标题、导航和正文均为中文。
- 仓库中不存在 `README.zh-CN.md`。
- 面向使用者的有效文档不存在指向 `README.zh-CN.md` 的失效链接。
- `git diff --check` 通过，工作区改动仅包含本规格约定的文档调整。
- 提交后推送到 `origin/main`，远程提交与本地一致。
