# dsh-teamai-panel

DeepSeek Harness 的侧边栏页面。它在本机读取 TeamAI 配置。技能仍然分成三份清单：

1. 团队仓库里的技能，以及 `pull` 会不会按目录名下发。
2. 当前工作区合并后真正生效的那一份，并标出目录和优先级。项目副本不会被标成团队副本。
3. TeamAI 使用记录里 `tool` 为 `dsh` 的次数和最近时间。

页面分成两个选项卡。技能一页是三份清单和 DSH 能收到什么。MCP 一页是团队 MCP，下面再列同一仓库里的其他资源：规则、文档、环境变量键名、密钥声明、子代理、钩子、模型、工作流、提示词、评分器、说明块、学习记录、知识库、角色、项目和成员。0 表示这份仓库还没放。

插件只读。排除、注入和删除仍然用 `teamai` 命令。页面不嵌入 TeamAI 仪表盘。响应里没有绝对路径、正文、变量值、密钥值、MCP 命令、参数、请求头、环境变量或地址。

## 安装

本机需要 `dsh`，并且已经运行过 `teamai init`。Desktop 应用用的是 desktop profile。先完全退出 DeepSeek Harness，再安装：

```sh
dsh plugin --profile desktop add github:backtomyfuture/dsh-teamai-panel#266b6727ffc8babed56d20ef023ae5ac51cafec8
```

浏览器里的 `dsh web` 则装到 web profile，把上面的 `desktop` 换成 `web`。`#` 后面是包含这份界面的提交。去掉它会跟踪 `main`。安装包是手写的 JavaScript，没有 `prepare` 构建，因此不需要给这个包打开 `allowBuilds`。重新打开后，侧边栏会出现「团队技能」。

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

## MCP 放在这个插件里

团队 MCP 是 `mcp/mcp.yaml` 和 `mcp/<命名空间>/mcp.yaml`，跟技能、规则、钩子走同一个仓库和同一次发现。再做一个插件会把工作区发现、本机只读接口和安装步骤复制一份。DeepSeek Harness 自己没有 MCP 安装路径，`teamai mcp inject` 写的是别的代理，所以这一栏只说明服务器在不在、用哪种传输、有没有写命令或地址、工具名和所需键名。命令文本、参数、请求头、环境变量值和地址留在仓库里，不进这个页面。

## 开发

```sh
npm install
npm test
```

侧边栏和客户端契约对照的是 DeepSeek Harness 提交 `ce7073d51254c26cd63b22a60835b8f948deb447`（2026-10-29）。可行性记录在 [docs/dsh-teamai-plugin-feasibility.md](docs/dsh-teamai-plugin-feasibility.md)。

## 许可

MIT
