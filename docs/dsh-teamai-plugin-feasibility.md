# TeamAI 作为 DeepSeek Harness 侧边栏插件：可行性

日期：2026-10-31。只读核对官方仓库当前默认分支，没有改两边的代码。

上一场 Amp 对话（Paseo agent `7c029137-2006-4c5c-a611-b465bb4e2ca3`，线程 `T-01a19069-6dec-774b-ab49-4dac9e07ab8c`）在核实 TeamAI 数据接口时因额度失败中断。本文接上那次未完成的源码核对。

## 结论

可行，而且不需要改 DSH 主程序，也不需要重做技能同步。

TeamAI 已经把 DeepSeek Harness 当成受支持的工具：用户级技能写到 `~/.dsh/skills`，规则写到 `~/.dsh/AGENTS.md`，钩子通过 `$DSH_HOME/cordis.patch.yml` 挂上官方的 Claude hook 桥。DSH Web UI 也已经提供侧边栏菜单槽 `sidebar.panellist` 和与之配对的 `main` 页面。插件要补的是这一页管理界面，以及把两份数据分开显示。

建议做成一个普通 DSH 插件（宿主 Cordis 插件 + 浏览器 client module），安装方式与现有社区侧边栏插件相同。开发预览期的破坏性变更是主要外部风险；本机沙箱写不进 TeamAI 状态，是使用统计能否记上的主要内部风险。

## 用户要的界面

侧边栏一个菜单，点开后看到：

- 团队仓库里的全部技能
- 这些技能的使用情况

## DSH 侧：菜单怎么挂

来源：[packages/client/ui-sidebar/README.md](https://github.com/deepseek-ai/DeepSeek-Harness/blob/master/packages/client/ui-sidebar/README.md)（master `ce7073d`，2026-10-29），以及 [第一个插件](https://deepseek-harness.github.io/deepseek-harness/develop/basic/)。

- 插件是导出 `apply(ctx)` 的模块，用 `cordis.yml` / `dsh plugin add` 加载。官方教程用 `pnpm dsh web --patch ./scratch-plugin/cordis.yml` 把本地绝对路径插进去。
- 侧边栏的全局面板：向根作用域列表 `sidebar.panellist` 注册一个带 `id`、可选 `order`、以及 `label` 的图标组件。同一个 `id` 必须在布局的根作用域 `main` 键槽里有对应页面。缺页面时，选择会抛错，当前选中项不变。
- 没有注册任何面板时，这段列表不渲染。官方组合本身不带示例面板，这个位置就是给插件的。
- 面板可以进「更多」菜单，并支持钉住。钉住状态只在内存里，插件重载后重置。
- 第三方面板行的点击不会打 `sidebar_menu_click`。只有 Plugins 和 Automation tasks 会打点。
- 槽位注入可以在插件的 `apply` 里关闭 Cordis 服务，把数据和回调交给页面组件。见 [Web Client Slots](https://github.com/deepseek-ai/DeepSeek-Harness/blob/master/docs/subsystems/slots.md)。

社区里已经有侧边栏面板插件（例如 dsh-weekly-hot、dshwiki）。这只说明这个槽被用过，不构成 API 契约。契约以 ui-sidebar README 为准。

DSH 处于开发预览，README 写明会有不兼容变更。插件应钉住一次验证过的 DSH 版本。

## DSH 侧：当前工作区实际能用哪些技能

来源：[@deepseek-ai/dsh-skill-filesystem](https://github.com/deepseek-ai/DeepSeek-Harness/blob/master/packages/skill/skill-filesystem/README.md)。

默认扫描顺序（数字小的优先）：

| 优先级 | 来源 | 路径 |
| --- | --- | --- |
| 100 | project-dsh | `<projectRoot>/.dsh/skills` |
| 200 | project-agents | `<projectRoot>/.agents/skills` |
| 300 | custom | `Config.customSkillDirs` |
| 400 | user-dsh | `<dshHome>/skills`，默认 `~/.dsh/skills` |
| 500 | user-agents | `<agentsHome>/skills`，默认 `~/.agents/skills` |

项目根是最近的含 `.git` 的祖先。只认根下一级的 `<name>/SKILL.md` 或 `<name>.md`，嵌套目录不会被发现。同名时高优先级根覆盖低优先级根。发现失败的那一整棵根会被跳过，同名的低优先级技能会顶上来。目录有监听，增删技能不用重启。

因此「团队仓库里的全部技能」和「这次 DSH 会话目录里出现的技能」是两份列表。页面应分开标：仓库有、本次 pull 会下发、磁盘上这份安装、以及合并后真正进入目录的那一条。

## TeamAI 侧：已经为 DSH 写了什么

来源均为 `Tencent/teamai-cli` 默认分支，本次通过 Contents API 读到的文件。代码搜索命中的树版本是 `22a9f2d`。

支持矩阵（[README](https://github.com/Tencent/teamai-cli/blob/main/README.md)）：

| 能力 | DSH |
| --- | --- |
| skills | 有 |
| rules | 有，且不受路径限制（脚注 1） |
| culture | 有 |
| agents | 无 |
| hooks | 有 |
| mcp | 无 |
| workflows | 有 |
| env | 仅 `teamai env exec`（脚注 2） |
| models | 无 |
| Team Context | 有 |
| usage | 有 |
| sessions | 无 |
| scorers | 仅 skill driver 跑的 workflow（脚注 3） |

落盘位置（[docs/guide/tool-support.md](https://github.com/Tencent/teamai-cli/blob/main/docs/guide/tool-support.md)，由 `src/tools.ts` 生成）：

- 用户级 home：`~/.dsh`，可被 `DSH_HOME` 挪走。
- 用户级技能：`~/.dsh/skills`。证据等级 `v`（真实工具跑过）。与 DSH 的 user-dsh 根一致。
- 用户级规则 / 指令块：写进 `~/.dsh/AGENTS.md`。证据等级 `s`（DSH 源码）。
- 项目级技能：TeamAI 会写，但描述符把读取标成 `unknown`（tool-support 里是 `written; reads ?`）。DSH 自己的 skill-filesystem 会扫 `<projectRoot>/.dsh/skills`。两边路径对得上，TeamAI 尚未把「DSH 会读」标成已验证。
- 项目级规则：session-start 钩子注入，证据等级 `s`。
- 会话：`sessions: 'none'`。仪表盘里的会话列表、token、打断次数不包含 DSH。
- 技能安装是按技能名摊平的：`path.join(baseDir, configuredSkillsPath, skillName)`（`src/resources/skills.ts` 的 `resolveSkillDestination`）。命名空间只影响仓库路径和是否下发，不会在 DSH 技能根下多套一层目录，因此能通过 DSH「只扫一层」的发现。

钩子（`src/dsh-hooks.ts`）：

- 配置放在 TeamAI 自己的数据目录 `hooks.json`，不写 Claude 的 settings。
- 在 `$DSH_HOME/cordis.patch.yml` 插入一行：`id: teamai-hooks-claude-code`，包 `@deepseek-ai/dsh-hooks-claude-code`，`config.configPath` 指向那份 hooks.json。
- 适配器故意是用户级的：即使用户在项目里 init，钩子仍挂在这台机器的 DSH home 上。
- 沙箱说明写在 `dshSandboxNote`：默认 `DSH_PERMISSION_MODE=workspace-write` 时，钩子只能写 dsh 启动目录。启动目录不是 `$HOME`，且没有设 `DSH_PERMISSION_MODE=danger-full-access` 时，session-start 同步和使用统计写不进 TeamAI 的状态，需要用户自己跑 `teamai pull`。

## TeamAI 侧：两份「技能」数据和一份「使用」数据

团队仓库清单已经有现成读接口，不必从零解析 git。

`teamai dashboard` 默认听 `http://localhost:3721`（[docs/guide/dashboard.md](https://github.com/Tencent/teamai-cli/blob/main/docs/guide/dashboard.md)）。`src/dashboard.ts`：

- `GET /api/resources/skills?workspace=<id>` 返回该工作区的技能清单：名称、命名空间、仓库路径、description、贡献者、标签、`delivered`、未下发原因（`namespace` / `tags` / `replaced` / `shadowed` / `excluded`）、被谁替换、哪些 agent 的磁盘上已经有这个目录（`installedAgents`）。
- `GET /api/resources/skills/detail` 返回一条。
- 读请求 CORS 是 `*`。写请求（例如 `POST /api/resources/skills/exclusions`）必须来自本机仪表盘页面，外站页面发不了。
- 清单明确不返回 SKILL.md 正文和环境变量（`src/dashboard/resources-skills.ts`）。

这条接口描述的是「pull 会不会把仓库里的这条发到当前 scope」，外加「哪些 agent 的技能目录里有同名目录」。它不描述 DSH 合并优先级之后，模型这次实际看到的是哪一份。

使用事件（`src/types.ts` 的 `UsageEvent`，`src/usage-tracker.ts`）：

```ts
{ skill: string; timestamp: string; tool: string }
```

写入当前 scope 的 `usage.jsonl`（用户级是 `~/.teamai/user-usage.jsonl`）。触发链是 PostToolUse / 读 SKILL.md / 提示里的技能提及，经 `skill-use.ts` 记一笔。DSH 的技能工具名是 `skill`，证据等级 `verified`（`src/tools.ts` 的 `dsh.skillLoad`）。测试夹具 `src/__tests__/fixtures/skill-use/dsh-skill.json` 就是一条 `PostToolUse`、`tool_name: "skill"`。汇总后的团队统计在 `stats/<user>.yaml`：`skills[name].count` 和 `lastUsed`。

工具支持表把 DSH 的 Stats 标成 `✓t`，注释是「A1 (#1245) records its skill loads; not rerun」。代码路径在，矩阵作者没有把这次记录再跑一遍。token、会话条数、人工打断不从 DSH 来，因为没有会话适配器。

## 插件里建议怎么取数

页面分三块，数据各走各的：

1. 团队仓库技能：读仪表盘的 `GET /api/resources/skills`，或在宿主插件里调用同一套清单逻辑。展示下发状态和替换关系。仪表盘进程没开时，这条 HTTP 不可用。
2. 本工作区 DSH 实际目录：在宿主插件里读 skill registry（`ctx.skills`，`@deepseek-ai/dsh-skill`），拿到合并后的名字、来源根和优先级。浏览器不要自己扫磁盘。
3. 使用情况：读本 scope 的 `usage.jsonl`，按 `tool === "dsh"` 过滤后做次数和 `lastUsed`。团队汇总再读 `stats/<user>.yaml`。不要把仪表盘的会话、token、打断面板嵌进来，那些数不包括 DSH。

宿主插件负责读文件和调本地接口，client module 只渲染 `sidebar.panellist` + `main`。这样不依赖用户另外开着 `teamai dashboard`，也绕开「写请求必须来自仪表盘页面」的限制。排除技能这种写操作继续走 `teamai` CLI，不要从 DSH 页面直接 POST 仪表盘。

把整个仪表盘 iframe 进侧边栏能少写 UI，但会话页对 DSH 是空的，而且用户必须先起 dashboard。不作为主方案。

## 做之前要守住的限制

- 沙箱：默认权限下，使用统计和自动 pull 可能写失败。插件应把 `dshSandboxNote` 的条件显示出来，而不是把 0 次使用显示成「没人用」。
- 同名覆盖：项目 `.dsh/skills` 和 `.agents/skills` 会盖住 `~/.dsh/skills` 里的团队副本。未下发、被替换、被本地同名盖住，要分成三种状态。
- 发现只扫一层，且坏掉的 frontmatter 会静默消失。清单里有、目录里没有时，要能指向这个原因。
- DSH 不读 TeamAI 的 agents、MCP、models，也不提供会话转录。页面不要承诺这些。
- Env 在默认配置下是坏的（`✗s`），除非走 `teamai env exec`。
- 两个项目都是 MIT。DSH 是开发预览，槽名和 client module 加载方式可能变。
- TeamAI 没有单独发布的「技能清单 SDK」。稳定边界是 CLI、本机 dashboard HTTP，以及上面这些已经写明的文件。直接读 `usage.jsonl` 和 `~/.dsh/skills` 会跟上内部布局变化。

## 上一场对话停在哪里

已读完 DSH 插件教程、侧边栏 README、skill-filesystem、slots 文档，并确认 README 支持矩阵。派去核对 TeamAI 适配器和统计接口的子任务失败，原因是 Amp 额度（至少 $1）。那部分由本文补上。工作区当时是空目录，没有留下笔记。
