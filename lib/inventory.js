/**
 * Read-only inventory of a TeamAI repo.
 *
 * Names, descriptions, transports, and key names only. Values, commands, args,
 * headers, env maps, and URLs stay out of the object this returns.
 */
import { readdir, readFile, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'

const MAX_ITEMS = 200
const MAX_FILE_BYTES = 256 * 1024
const MAX_TEXT = 160
const ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/
const HOOK_ID = /^[a-z0-9-]{1,128}$/
const MCP_NAME = /^[A-Za-z0-9_-]{1,128}$/
const EVENT_NAME = /^[A-Za-z][A-Za-z0-9_]{0,64}$/
const MATCHER = /^[A-Za-z0-9_.*|-]{1,64}$/
const TOOL_NAME = /^[A-Za-z0-9_.:-]{1,80}$/
const HEADER_NAME = /^[A-Za-z0-9-]{1,64}$/
const MODEL_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/
const ALIAS_NAME = /^[a-z][a-z0-9-]{0,127}$/
const PROTOCOLS = new Set(['anthropic', 'openai-responses', 'openai-chat-completions'])

export const DSH_CAPABILITIES = [
  { id: 'skills', label: '技能', mark: 'works', detail: 'pull 会复制到 ~/.dsh/skills。' },
  { id: 'rules', label: '规则', mark: 'works', detail: '用户级写进 ~/.dsh/AGENTS.md。项目级靠会话开始钩子注入，压缩会话后会丢掉，下次会话再回来。' },
  { id: 'hooks', label: '钩子', mark: 'works', detail: '装在用户级 dsh-hooks。默认沙箱只能写启动目录。' },
  { id: 'recall', label: '召回', mark: 'works', detail: 'TeamAI 的 recall 可以在 DSH 里用。' },
  { id: 'stats', label: '使用统计', mark: 'works', detail: '技能加载会记到使用记录。这个页面只计 tool 为 dsh 的事件。' },
  { id: 'env', label: '环境变量', mark: 'broken', detail: '默认沙箱下写不进 DSH。这里只显示键名。' },
  { id: 'workflows', label: '工作流', mark: 'unsupported', detail: 'DSH 自己有工作流，TeamAI 没有为它生成。' },
  { id: 'models', label: '模型配置', mark: 'unsupported', detail: 'TeamAI 没有为 DSH 生成模型配置。' },
  { id: 'agents', label: '子代理', mark: 'absent', detail: 'DeepSeek Harness 没有这条安装路径。' },
  { id: 'mcp', label: 'MCP', mark: 'absent', detail: 'teamai mcp inject 写的是别的代理。这份 DSH 不加载团队 MCP。' },
  { id: 'sessions', label: '会话归档', mark: 'absent', detail: 'DSH 没有 TeamAI 的会话归档。' },
  { id: 'httpHooks', label: 'HTTP 钩子', mark: 'absent', detail: 'DSH 没有这条能力。' },
]

export function emptyInventory() {
  return {
    dsh: DSH_CAPABILITIES,
    rules: [],
    docs: [],
    env: [],
    secrets: [],
    agents: [],
    hooks: [],
    mcp: [],
    models: [],
    aliases: [],
    workflows: [],
    prompts: [],
    localPrompts: [],
    localMcp: [],
    scorers: [],
    claudemd: [],
    learnings: [],
    wiki: [],
    roles: [],
    projects: [],
    members: [],
  }
}

export async function scanInventory(repoPath, warnings = []) {
  const inventory = emptyInventory()
  const repoReal = await realpath(repoPath).catch(() => null)
  if (!repoReal) return inventory
  await scanRules(repoReal, inventory.rules, warnings)
  await scanTitledFiles(repoReal, 'docs', inventory.docs, warnings)
  await scanEnv(repoReal, inventory, warnings)
  await scanAgents(repoReal, inventory.agents, warnings)
  await scanHooks(repoReal, inventory.hooks, warnings)
  await scanMcp(repoReal, inventory.mcp, warnings)
  await scanModels(repoReal, inventory, warnings)
  await scanNamedFiles(repoReal, 'workflows', inventory.workflows, (name) => name.endsWith('.yaml'), warnings)
  await scanTitledFiles(repoReal, 'prompts', inventory.prompts, warnings)
  await scanTitledFiles(repoReal, 'scorers', inventory.scorers, warnings, (name) => name !== 'scoring.yaml')
  await scanTitledFiles(repoReal, 'claudemd', inventory.claudemd, warnings)
  await scanTitledFiles(repoReal, 'learnings', inventory.learnings, warnings)
  await scanTitledFiles(repoReal, path.join('teamwiki', 'evidence', 'code'), inventory.wiki, warnings)
  await scanManifest(repoReal, 'roles', 'roles', inventory.roles, warnings)
  await scanManifest(repoReal, 'projects', 'projects', inventory.projects, warnings)
  await scanMembers(repoReal, inventory.members, warnings)
  return inventory
}

async function scanRules(repoReal, out, warnings) {
  const root = path.join(repoReal, 'rules')
  if (!await exists(root)) return
  for (const name of await readNames(root)) {
    if (!isLooseName(name) || out.length >= MAX_ITEMS) continue
    const file = path.join(root, name)
    const info = await fileKind(file)
    if (info === 'file' && name.endsWith('.md')) {
      pushFile(out, stem(name), await headingOf(file, repoReal, warnings, rel(repoReal, file)), `rules/${name}`)
      continue
    }
    if (info !== 'dir') continue
    for (const child of await readNames(file)) {
      if (!isLooseName(child) || !child.endsWith('.md') || out.length >= MAX_ITEMS) continue
      const nested = path.join(file, child)
      if (await fileKind(nested) !== 'file') continue
      pushFile(out, stem(child), await headingOf(nested, repoReal, warnings, rel(repoReal, nested)), `命名空间 ${name} · rules/${name}/${child}`)
    }
  }
}

async function scanTitledFiles(repoReal, dirName, out, warnings, keep = () => true) {
  const root = path.join(repoReal, dirName)
  const files = []
  await walkFiles(root, files, 0, (name) => keep(name) && (name.endsWith('.md') || name.endsWith('.yaml') || name.endsWith('.yml')))
  for (const file of files) {
    if (out.length >= MAX_ITEMS) return
    const relative = rel(repoReal, file)
    if (!relative) continue
    pushFile(out, relative, await headingOf(file, repoReal, warnings, relative), null)
  }
}

async function scanNamedFiles(repoReal, dirName, out, keep, warnings) {
  const root = path.join(repoReal, dirName)
  const files = []
  await walkFiles(root, files, 0, keep)
  for (const file of files) {
    if (out.length >= MAX_ITEMS) return
    const relative = rel(repoReal, file)
    if (!relative) continue
    const loaded = await readText(file, repoReal)
    let detail = null
    if (loaded && loaded.text) {
      let data
      try {
        data = YAML.parse(loaded.text)
      } catch {
        warnings.push(`${relative} 不是合法 YAML，只列入了文件名。`)
        data = null
      }
      if (data && typeof data === 'object' && !Array.isArray(data)) detail = publicText(data.description) || publicText(data.name)
    } else if (loaded && loaded.skipped) {
      warnings.push(`${relative} 太大，只列入了文件名。`)
    }
    pushFile(out, stem(path.basename(file)), detail, relative)
  }
}

async function scanEnv(repoReal, inventory, warnings) {
  const docs = await readEntryDocs(repoReal, 'env', 'env.yaml', warnings)
  for (const doc of docs) {
    const variables = listOf(doc.data, 'variables')
    if (!variables) {
      warnings.push(`${doc.rel} 没有 variables 列表，没有列入。`)
      continue
    }
    for (const item of variables) {
      if (!item || typeof item !== 'object' || Array.isArray(item) || inventory.env.length >= MAX_ITEMS) continue
      if (typeof item.key !== 'string' || !ENV_KEY.test(item.key)) continue
      inventory.env.push({
        name: item.key,
        detail: publicText(item.description),
        meta: doc.namespace ? `命名空间 ${doc.namespace} · 普通变量` : '普通变量',
      })
    }
  }
  const secrets = await readEntryDocs(repoReal, 'env', 'secrets.yaml', warnings)
  for (const doc of secrets) {
    const items = listOf(doc.data, 'secrets')
    if (!items) {
      warnings.push(`${doc.rel} 没有 secrets 列表，没有列入。`)
      continue
    }
    for (const item of items) {
      if (!item || typeof item !== 'object' || Array.isArray(item) || inventory.secrets.length >= MAX_ITEMS) continue
      if (typeof item.key !== 'string' || !ENV_KEY.test(item.key)) continue
      inventory.secrets.push({
        name: item.key,
        detail: publicText(item.description),
        meta: doc.namespace ? `命名空间 ${doc.namespace} · 密钥声明` : '密钥声明',
      })
    }
  }
}

async function scanAgents(repoReal, out, warnings) {
  const root = path.join(repoReal, 'agents')
  if (!await exists(root)) return
  const visit = async (file, namespace, label) => {
    if (out.length >= MAX_ITEMS) return
    const loaded = await readText(file, repoReal)
    if (!loaded || loaded.skipped) return
    if (file.endsWith('.md')) {
      pushFile(out, stem(path.basename(file)), headingFrom(loaded.text), label)
      return
    }
    let data
    try {
      data = YAML.parse(loaded.text)
    } catch {
      warnings.push(`${label} 不是合法 YAML，没有列入。`)
      return
    }
    const record = data && typeof data === 'object' && !Array.isArray(data) ? data : null
    const name = record && typeof record.name === 'string' && isLooseName(record.name) ? record.name : stem(path.basename(file))
    pushFile(out, name, record ? publicText(record.description) : null, namespace ? `命名空间 ${namespace}` : label)
  }
  for (const name of await readNames(root)) {
    if (!isLooseName(name)) continue
    const file = path.join(root, name)
    const kind = await fileKind(file)
    if (kind === 'file' && (name.endsWith('.yaml') || name.endsWith('.yml') || name.endsWith('.md'))) {
      await visit(file, null, `agents/${name}`)
      continue
    }
    if (kind !== 'dir') continue
    for (const child of await readNames(file)) {
      if (!isLooseName(child)) continue
      const nested = path.join(file, child)
      if (await fileKind(nested) !== 'file') continue
      if (!(child.endsWith('.yaml') || child.endsWith('.yml') || child.endsWith('.md'))) continue
      await visit(nested, name, `agents/${name}/${child}`)
    }
  }
}

async function scanHooks(repoReal, out, warnings) {
  const docs = await readEntryDocs(repoReal, 'hooks', 'hooks.yaml', warnings)
  for (const doc of docs) {
    const hooks = listOf(doc.data, 'hooks')
    if (!hooks) {
      warnings.push(`${doc.rel} 没有 hooks 列表，没有列入。`)
      continue
    }
    for (const hook of hooks) {
      if (!hook || typeof hook !== 'object' || Array.isArray(hook) || out.length >= MAX_ITEMS) continue
      if (typeof hook.id !== 'string' || !HOOK_ID.test(hook.id)) continue
      const bits = []
      if (doc.namespace) bits.push(`命名空间 ${doc.namespace}`)
      bits.push(typeof hook.event === 'string' && EVENT_NAME.test(hook.event) ? hook.event : '事件未识别')
      if (typeof hook.matcher === 'string' && MATCHER.test(hook.matcher)) bits.push(`匹配 ${hook.matcher}`)
      const tools = stringList(hook.tools, TOOL_NAME)
      if (tools.length) bits.push(`工具 ${tools.join('、')}`)
      out.push({ name: hook.id, detail: publicText(hook.description), meta: bits.join(' · ') })
    }
  }
}

async function scanMcp(repoReal, out, warnings) {
  const docs = await readEntryDocs(repoReal, 'mcp', 'mcp.yaml', warnings)
  for (const doc of docs) {
    const servers = listOf(doc.data, 'servers')
    if (!servers) {
      warnings.push(`${doc.rel} 没有 servers 列表，没有列入。`)
      continue
    }
    for (const server of servers) {
      if (!server || typeof server !== 'object' || Array.isArray(server) || out.length >= MAX_ITEMS) continue
      if (typeof server.name !== 'string' || !MCP_NAME.test(server.name)) continue
      const transport = server.transport === 'stdio' || server.transport === 'http' || server.transport === 'sse'
        ? server.transport
        : '未知传输'
      const bits = [transport]
      if (doc.namespace) bits.push(`命名空间 ${doc.namespace}`)
      bits.push(typeof server.command === 'string' && server.command ? '已写命令' : '无命令')
      bits.push(Array.isArray(server.args) && server.args.length ? `${server.args.length} 个参数` : '无参数')
      bits.push(typeof server.url === 'string' && server.url ? '已写地址' : '无地址')
      const tools = stringList(server.tools, TOOL_NAME)
      const requires = stringList(server.requires, ENV_KEY)
      const envKeys = keyList(server.env, ENV_KEY)
      const headerNames = keyList(server.headers, HEADER_NAME)
      if (tools.length) bits.push(`工具 ${tools.join('、')}`)
      if (requires.length) bits.push(`需要 ${requires.join('、')}`)
      if (envKeys.length) bits.push(`环境变量键 ${envKeys.join('、')}`)
      if (headerNames.length) bits.push(`请求头 ${headerNames.join('、')}`)
      if ((Array.isArray(server.roles) && server.roles.length) || (Array.isArray(server.projects) && server.projects.length)) {
        bits.push('带有已废弃的范围字段')
      }
      out.push({ name: server.name, detail: publicText(server.description), meta: bits.join(' · ') })
    }
  }
}

async function scanModels(repoReal, inventory, warnings) {
  const docs = await readEntryDocs(repoReal, 'models', 'models.yaml', warnings)
  for (const doc of docs) {
    const profiles = listOf(doc.data, 'profiles')
    if (!profiles) {
      warnings.push(`${doc.rel} 没有 profiles 列表，没有列入。`)
      continue
    }
    for (const profile of profiles) {
      if (!profile || typeof profile !== 'object' || Array.isArray(profile) || inventory.models.length >= MAX_ITEMS) continue
      if (typeof profile.id !== 'string' || !MODEL_ID.test(profile.id)) continue
      const protocols = []
      const models = []
      const groups = Array.isArray(profile.model_groups) ? profile.model_groups : []
      for (const group of groups) {
        if (!group || typeof group !== 'object' || Array.isArray(group)) continue
        for (const item of stringList(group.protocols, (value) => PROTOCOLS.has(value))) protocols.push(item)
        for (const item of stringList(group.models, MODEL_ID)) models.push(item)
      }
      const bits = []
      if (doc.namespace) bits.push(`命名空间 ${doc.namespace}`)
      if (protocols.length) bits.push([...new Set(protocols)].join('、'))
      if (models.length) bits.push([...new Set(models)].join('、'))
      bits.push(profile.api_key == null || profile.api_key === '${API_KEY}' ? '密钥不在仓库里' : '仓库里有密钥字段，未显示')
      inventory.models.push({
        name: profile.id,
        detail: publicText(profile.name),
        meta: bits.join(' · '),
      })
    }
  }
  const aliases = await readEntryDocs(repoReal, 'models', 'aliases.yaml', warnings)
  for (const doc of aliases) {
    const table = doc.data && typeof doc.data === 'object' && !Array.isArray(doc.data) ? doc.data.aliases : null
    if (!table || typeof table !== 'object' || Array.isArray(table)) continue
    for (const name of Object.keys(table)) {
      if (!ALIAS_NAME.test(name) || inventory.aliases.length >= MAX_ITEMS) continue
      inventory.aliases.push({
        name,
        detail: null,
        meta: doc.namespace ? `命名空间 ${doc.namespace} · 别名` : '别名',
      })
    }
  }
}

async function scanManifest(repoReal, kind, listKey, out, warnings) {
  const relative = `manifest/${kind}.yaml`
  const loaded = await readText(path.join(repoReal, 'manifest', `${kind}.yaml`), repoReal)
  if (!loaded || loaded.skipped) return
  let data
  try {
    data = YAML.parse(loaded.text)
  } catch {
    warnings.push(`${relative} 不是合法 YAML，没有列入。`)
    return
  }
  const items = listOf(data, listKey)
  if (!items) return
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || out.length >= MAX_ITEMS) continue
    if (typeof item.id !== 'string' || !isLooseName(item.id)) continue
    out.push({ name: item.id, detail: publicText(item.name) || publicText(item.description), meta: null })
  }
}

async function scanMembers(repoReal, out, warnings) {
  const root = path.join(repoReal, 'members')
  const files = []
  await walkFiles(root, files, 0, (name) => name.endsWith('.yaml') || name.endsWith('.yml'))
  for (const file of files) {
    if (out.length >= MAX_ITEMS) return
    const relative = rel(repoReal, file)
    const loaded = await readText(file, repoReal)
    if (!loaded || loaded.skipped || !relative) continue
    let data
    try {
      data = YAML.parse(loaded.text)
    } catch {
      warnings.push(`${relative} 不是合法 YAML，没有列入。`)
      continue
    }
    const record = data && typeof data === 'object' && !Array.isArray(data) ? data : null
    const username = record && typeof record.username === 'string' ? record.username : stem(path.basename(file))
    if (!isLooseName(username)) continue
    const role = record && typeof record.role === 'string' ? record.role : null
    const projects = record && Array.isArray(record.projects) ? record.projects.filter(Boolean) : []
    const detail = role ? (role + (projects.length ? ` · ${projects.join(', ')}` : '')) : null
    out.push({ name: username, role, projects, detail, meta: '成员' })
  }
}

async function readEntryDocs(repoReal, dirName, fileName, warnings) {
  const root = path.join(repoReal, dirName)
  const found = []
  const rootFile = path.join(root, fileName)
  if (await fileKind(rootFile) === 'file') found.push({ namespace: null, file: rootFile, rel: `${dirName}/${fileName}` })
  for (const name of await readNames(root)) {
    if (!isLooseName(name)) continue
    const file = path.join(root, name, fileName)
    if (await fileKind(file) === 'file') found.push({ namespace: name, file, rel: `${dirName}/${name}/${fileName}` })
  }
  const docs = []
  for (const item of found) {
    const loaded = await readText(item.file, repoReal)
    if (!loaded) continue
    if (loaded.skipped) {
      warnings.push(`${item.rel} 太大，没有列入。`)
      continue
    }
    try {
      docs.push({ namespace: item.namespace, rel: item.rel, data: YAML.parse(loaded.text) })
    } catch {
      warnings.push(`${item.rel} 不是合法 YAML，没有列入。`)
    }
  }
  return docs
}

function listOf(data, key) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  return Array.isArray(data[key]) ? data[key] : null
}

function stringList(value, pattern) {
  if (!Array.isArray(value)) return []
  const test = typeof pattern === 'function' ? pattern : (item) => pattern.test(item)
  return value.filter((item) => typeof item === 'string' && test(item))
}

function keyList(value, pattern) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  return Object.keys(value).filter((key) => pattern.test(key))
}

function pushFile(out, name, detail, meta) {
  if (!isPublicPath(name) || out.length >= MAX_ITEMS) return
  out.push({ name, detail: detail || null, meta: meta || null })
}

function isPublicPath(name) {
  if (typeof name !== 'string' || !name || name.length > 240) return false
  return name.split('/').every((part) => isLooseName(part))
}

async function headingOf(file, repoReal, warnings, relative) {
  const loaded = await readText(file, repoReal)
  if (!loaded) return null
  if (loaded.skipped) {
    warnings.push(`${relative} 太大，没有读标题。`)
    return null
  }
  return headingFrom(loaded.text)
}

function headingFrom(text) {
  if (!text) return null
  const lines = text.split(/\r?\n/).slice(0, 40)
  for (const line of lines) {
    const match = /^(?:#{1,3}\s+)(.+)$/.exec(line.trim())
    if (match) return publicText(match[1])
  }
  return null
}

function publicText(value) {
  if (typeof value !== 'string') return null
  const text = value.replace(/\s+/g, ' ').trim()
  if (!text) return null
  if (/\/Users\/|\/home\/|~\/|[A-Za-z]:\\|:\/\//.test(text)) return null
  return text.slice(0, MAX_TEXT)
}

function stem(name) {
  return name.replace(/\.(md|yaml|yml)$/i, '')
}

function isLooseName(name) {
  return typeof name === 'string'
    && name.length > 0
    && name.length <= 240
    && name !== '.'
    && name !== '..'
    && !name.includes('..')
    && !name.startsWith('.')
    && !/[/\\:\0]/.test(name)
}

function rel(root, file) {
  const relative = path.relative(root, file)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null
  return relative.split(path.sep).join('/')
}

async function walkFiles(dir, out, depth, keep) {
  if (depth > 4 || out.length >= MAX_ITEMS) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (out.length >= MAX_ITEMS) return
    if (!isLooseName(entry.name) || entry.name === 'node_modules') continue
    if (entry.isSymbolicLink()) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkFiles(full, out, depth + 1, keep)
      continue
    }
    if (entry.isFile() && keep(entry.name)) out.push(full)
  }
}

async function readNames(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries.filter((entry) => !entry.name.startsWith('.') && !entry.isSymbolicLink()).map((entry) => entry.name)
  } catch {
    return []
  }
}

async function fileKind(file) {
  try {
    const info = await stat(file)
    if (info.isDirectory()) return 'dir'
    if (info.isFile()) return 'file'
    return null
  } catch {
    return null
  }
}

async function exists(file) {
  return Boolean(await fileKind(file))
}

async function readText(file, repoReal) {
  const real = await realpath(file).catch(() => null)
  if (!real || rel(repoReal, real) === null) return null
  try {
    const info = await stat(real)
    if (!info.isFile()) return null
    if (info.size > MAX_FILE_BYTES) return { skipped: true }
    return { text: await readFile(real, 'utf8') }
  } catch {
    return null
  }
}

export async function scanLocalPrompts(options = {}, warnings = []) {
  const { projectRoot, dshHome, home, userConfigDir } = options
  const roots = []
  if (projectRoot) {
    roots.push({ label: '项目 .dsh', dir: path.join(projectRoot, '.dsh', 'prompts') })
    roots.push({ label: '项目 .agents', dir: path.join(projectRoot, '.agents', 'prompts') })
    roots.push({ label: '项目 .claude', dir: path.join(projectRoot, '.claude', 'prompts') })
  }
  if (dshHome) {
    roots.push({ label: '用户 ~/.dsh', dir: path.join(dshHome, 'prompts') })
  }
  if (home) {
    roots.push({ label: '用户 ~/.agents', dir: path.join(home, '.agents', 'prompts') })
    roots.push({ label: '用户 ~/.claude', dir: path.join(home, '.claude', 'prompts') })
  }
  if (userConfigDir) {
    roots.push({ label: '用户 ~/.teamai', dir: path.join(userConfigDir, 'prompts') })
  }
  const items = []
  const seen = new Set()
  for (const root of roots) {
    if (!await exists(root.dir)) continue
    try {
      const names = await readNames(root.dir)
      for (const name of names) {
        if (!name.endsWith('.md') || seen.has(name) || items.length >= MAX_ITEMS) continue
        seen.add(name)
        const file = path.join(root.dir, name)
        const heading = await headingOf(file, root.dir, warnings, name).catch(() => null)
        items.push({
          name,
          detail: heading || '本机提示词',
          meta: root.label + '/prompts/' + name,
        })
      }
    } catch {
      // ignore
    }
  }
  return items
}

export async function scanLocalMcp(options = {}, warnings = []) {
  const { projectRoot, home, userConfigDir } = options
  const files = []
  if (projectRoot) {
    files.push({ label: '项目 .dsh 配置', file: path.join(projectRoot, '.dsh', 'mcp.json') })
    files.push({ label: '项目 .mcp.json', file: path.join(projectRoot, '.mcp.json') })
  }
  if (home) {
    files.push({ label: 'DSH 本机配置', file: path.join(home, '.dsh', 'mcp.json') })
    files.push({ label: 'Claude 本机配置', file: path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json') })
    files.push({ label: 'Cursor 本机配置', file: path.join(home, '.cursor', 'mcp.json') })
  }
  if (userConfigDir) {
    files.push({ label: 'TeamAI 本机配置', file: path.join(userConfigDir, 'mcp.yaml') })
  }
  const items = []
  const seen = new Set()
  for (const cfg of files) {
    if (!await exists(cfg.file)) continue
    try {
      const raw = await readFile(cfg.file, 'utf8')
      let parsed = null
      if (cfg.file.endsWith('.yaml') || cfg.file.endsWith('.yml')) {
        parsed = YAML.parse(raw)
      } else {
        parsed = JSON.parse(raw)
      }
      const servers = parsed?.mcpServers || parsed?.servers
      if (servers && typeof servers === 'object') {
        const entries = Array.isArray(servers) ? servers : Object.entries(servers).map(([k, v]) => ({ name: k, ...(v || {}) }))
        for (const s of entries) {
          if (!s || typeof s !== 'object' || !s.name || seen.has(s.name) || items.length >= MAX_ITEMS) continue
          seen.add(s.name)
          const transport = s.transport || (s.command ? 'stdio' : (s.url ? 'http' : 'stdio'))
          items.push({
            name: s.name,
            detail: s.description || ('本机 ' + s.name + ' 服务'),
            meta: cfg.label + ' · ' + transport + (s.command ? ' · ' + s.command : ''),
          })
        }
      }
    } catch {
      // ignore
    }
  }
  return items
}
