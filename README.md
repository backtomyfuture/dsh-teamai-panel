# dsh-teamai-panel

DeepSeek Harness 的侧边栏页面。安装之后，TeamAI 的安装、初始化、技能同步、MCP 和提示词都在这个页面里完成。页面调用本机的 `teamai`，改仓库时只提交那一个文件，不重做 TeamAI，也不嵌入它的仪表盘。

技能仍然分成三份清单：

1. 团队仓库里的技能，以及 `pull` 会不会按目录名下发。
2. 当前工作区合并后真正生效的那一份，并标出目录和优先级。项目副本不会被标成团队副本。
3. TeamAI 使用记录里 `tool` 为 `dsh` 的次数和最近时间。

页面有三个选项卡。

- 技能：三份清单、DSH 能收到什么，以及排除或恢复下发。排除只改这台机器的名单。同步执行 `teamai pull`，会安装当前配置应该收到的全部技能，并同步规则、文档、环境变量和钩子。没有按单个技能拉取的命令。
- MCP：查看团队 MCP，以及新增、替换、删除根 `mcp/mcp.yaml` 里的服务器。保存和删除只提交这一个文件。命令、参数、请求头、环境变量值和地址写进仓库之后不再显示。注入执行 `teamai mcp inject`，写的是 TeamAI 支持的其他代理。DeepSeek Harness 不加载这些服务器。从其他代理移除执行 `teamai mcp remove`，只清本机工具配置，不改团队仓库。
- 提示词：读取、保存和删除 `prompts/` 下的 Markdown。保存和删除只提交那个文件。

同一仓库里的规则、文档、环境变量键名、子代理、钩子、模型、工作流和其他资源仍然只读。0 表示这份仓库还没放。环境变量只显示键名。模型这一栏是仓库里的网关配置，不是模型市场，这个页面也不切换模型。

如果仓库还没有 `teamai.yaml`，初始化会向默认分支推送一份空骨架。页面不收集令牌，认证用这台机器上已经登录的 Git。已经有配置时，初始化不加 `--force`，所以不会静默覆盖。响应里没有绝对路径、变量值、密钥值、MCP 命令、参数、请求头、环境变量或地址。提示词正文只在打开那一条时返回。

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

团队 MCP 是 `mcp/mcp.yaml` 和 `mcp/<命名空间>/mcp.yaml`，跟技能、规则、钩子走同一个仓库和同一次发现。再做一个插件会把工作区发现、本机接口和安装步骤复制一份。DeepSeek Harness 自己没有 MCP 安装路径。这个页面可以改根 `mcp/mcp.yaml`，`teamai mcp inject` 写的仍然是别的代理。列表里只说明服务器在不在、用哪种传输、有没有写命令或地址、工具名和所需键名。命令文本、参数、请求头、环境变量值和地址留在仓库里，保存之后页面不再显示。

## 开发

```sh
npm install
npm test
```

侧边栏和客户端契约对照的是 DeepSeek Harness 提交 `ce7073d51254c26cd63b22a60835b8f948deb447`（2026-10-29）。可行性记录在 [docs/dsh-teamai-plugin-feasibility.md](docs/dsh-teamai-plugin-feasibility.md)。

## 许可

MIT
