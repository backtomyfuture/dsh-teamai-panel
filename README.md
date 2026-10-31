# dsh-teamai-panel

DeepSeek Harness 的侧边栏页面。它在本机读取 TeamAI 配置，分成三份清单：

1. 团队仓库里的技能，以及 `pull` 会不会按目录名下发。
2. 当前工作区合并后真正生效的那一份，并标出目录和优先级。项目副本不会被标成团队副本。
3. TeamAI 使用记录里 `tool` 为 `dsh` 的次数和最近时间。

插件只读。排除名单仍然用 `teamai` 命令修改。页面不嵌入 TeamAI 仪表盘，响应里没有绝对路径、`SKILL.md` 正文或环境变量。

## 安装

本机需要 `dsh`，并且已经运行过 `teamai init`。侧边栏属于 **web** profile：

```sh
dsh plugin --profile web add github:backtomyfuture/dsh-teamai-panel#39aede54d5419acef0df4f8404f2142e0dd5ca27
```

`#` 后面是这次发布的代码提交。去掉它会跟踪 `main`。安装包是手写的 JavaScript，没有 `prepare` 构建，因此不需要给这个包打开 `allowBuilds`。装好后重新加载 web profile，侧边栏会出现「团队技能」。

团队仓库、`usage.jsonl` 和 `~/.dsh/skills` 都留在每台机器上，不会跟着插件走。

## 使用记录可能一直是 0

DSH 默认 `DSH_PERMISSION_MODE=workspace-write`，钩子只能写 `dsh` 的启动目录。启动目录不是用户主目录时，TeamAI 写不下使用记录。从主目录启动 `dsh`，或设置 `DSH_PERMISSION_MODE=danger-full-access`，记录才会出现。页面上的 0 在这种情况下不表示「没有使用」。

## 这份清单没有重做 pull

对照的是磁盘上的技能目录：

| 优先级 | 目录 |
| --- | --- |
| 100 | `<项目>/.dsh/skills` |
| 200 | `<项目>/.agents/skills` |
| 400 | `$DSH_HOME/skills`，默认 `~/.dsh/skills` |
| 500 | `~/.agents/skills` |

优先级 300 的自定义目录不读，因为这份插件不解析 DSH 的 Config。命名空间会装平。标签和 `deliveredInstead` 不在这里重算。

## 开发

```sh
npm install
npm test
```

侧边栏和客户端契约对照的是 DeepSeek Harness 提交 `ce7073d51254c26cd63b22a60835b8f948deb447`（2026-10-29）。可行性记录在 [docs/dsh-teamai-plugin-feasibility.md](docs/dsh-teamai-plugin-feasibility.md)。

## 许可

MIT
