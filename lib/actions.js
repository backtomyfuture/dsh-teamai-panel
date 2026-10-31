/**
 * Allowlisted writes. The page runs these instead of reimplementing TeamAI.
 * Responses never include MCP commands, arguments, headers, env values, or URLs.
 */
import { execFile } from 'node:child_process'
import { lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import YAML from 'yaml'
import { loadWorkspace } from './snapshot.js'

export const ACTION_PATH = '/teamai-panel/action'

const SKILL_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/
const MCP_NAME = /^[A-Za-z0-9_-]{1,128}$/
const ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/
const HEADER_NAME = /^[A-Za-z0-9-]{1,64}$/
const PROVIDERS = new Set(['github', 'git', 'gitlab', 'tgit', 'cnb', 'gitcode'])
const REPO = /^(?:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+|https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?)$/
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,64}$/

const CONFIRM = {
  install: 'install-teamai',
  init: 'init',
  pull: 'pull',
  'skill-exclude': 'exclude',
  'prompt-save': 'save-prompt',
  'prompt-delete': 'delete-prompt',
  'mcp-save': 'save-mcp',
  'mcp-delete': 'delete-mcp',
  'mcp-inject': 'inject-mcp',
  'mcp-clear-local': 'clear-local-mcp',
}

export async function runAction(body, options = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return fail('invalid', '请求不是对象。')
  }
  const action = body.action
  if (action !== 'prompt-read' && body.confirm !== CONFIRM[action]) {
    return fail('confirm', '这次操作还没有确认。')
  }
  const run = options.runCommand ?? execFileAsync
  try {
    if (action === 'install') return await installTeamai(run)
    if (action === 'init') return await initTeamai(body, options, run)
    if (action === 'pull') return await runTeamai(options, run, ['pull'], '同步完成。技能、规则、文档、环境变量和钩子都会按当前配置更新。')
    if (action === 'skill-exclude') return await excludeSkills(body, options, run)
    if (action === 'prompt-read') return await readPrompt(body, options)
    if (action === 'prompt-save') return await savePrompt(body, options, run)
    if (action === 'prompt-delete') return await deletePrompt(body, options, run)
    if (action === 'mcp-save') return await saveMcp(body, options, run)
    if (action === 'mcp-delete') return await deleteMcp(body, options, run)
    if (action === 'mcp-inject') {
      return await runTeamai(options, run, ['mcp', 'inject'], '已让 TeamAI 把团队 MCP 写入它支持的其他代理。DeepSeek Harness 不加载这些服务器。', secretsOf(body))
    }
    if (action === 'mcp-clear-local') {
      return await runTeamai(options, run, ['mcp', 'remove'], '已从其他代理的本机配置里移除 TeamAI 管理的 MCP。团队仓库没有改。', secretsOf(body))
    }
    return fail('invalid', '没有这个操作。')
  } catch (error) {
    if (error && error.code === 'invalid') return fail('invalid', error.message)
    return fail('failed', '操作没有完成。')
  }
}

async function installTeamai(run) {
  const found = await run('teamai', ['--version'], { timeout: 4000 })
  if (found.code === 0) return { ok: true, message: '这台机器已经有 teamai。' }
  const installed = await run('npm', ['install', '-g', 'teamai-cli'], { timeout: 180000 })
  if (installed.code !== 0) return fail('failed', '安装 teamai-cli 没有完成。' + tail(installed))
  return { ok: true, message: '已安装 teamai-cli。接下来初始化团队仓库。' }
}

async function initTeamai(body, options, run) {
  const repo = typeof body.repo === 'string' ? body.repo.trim() : ''
  const provider = body.provider === undefined ? 'github' : body.provider
  const scope = body.scope === 'workspace' ? 'workspace' : body.scope === 'user' || body.scope === undefined ? 'user' : ''
  if (!REPO.test(repo) || !PROVIDERS.has(provider) || !scope) {
    return fail('invalid', '仓库、来源或范围不符合格式。')
  }
  const located = await loadWorkspace(options)
  const result = await run('teamai', [
    'init', repo, '--provider', provider, '--scope', scope, '--agent', 'dsh',
  ], {
    timeout: 180000,
    cwd: scope === 'workspace' ? located.cwd : located.home,
    env: commandEnv(),
  })
  if (result.code !== 0) return fail('failed', '初始化没有完成。' + tail(result))
  return { ok: true, message: '初始化完成，接下来可以同步技能。' }
}

async function excludeSkills(body, options, run) {
  const mode = body.mode === 'add' || body.mode === 'remove' ? body.mode : ''
  const names = Array.isArray(body.names) ? body.names : []
  if (!mode || names.length < 1 || names.length > 30 || names.some((name) => !SKILL_NAME.test(name))) {
    return fail('invalid', '技能名不符合格式。')
  }
  return runTeamai(
    options,
    run,
    ['skill', 'exclude', mode, ...names],
    mode === 'add'
      ? '已写入这台机器的排除名单。点同步之后，pull 会跳过这些目录，并删掉 TeamAI 自己装上的副本。'
      : '已从这台机器的排除名单移除。点同步之后会重新安装。',
  )
}

async function readPrompt(body, options) {
  const located = await repoOf(options)
  const relative = promptPath(body.name)
  const file = path.join(located.repo, relative)
  await assertRealFile(located.repo, relative)
  const text = await readFile(file, 'utf8')
  if (text.includes('\0')) return fail('invalid', '提示词里有无法显示的内容。')
  return {
    ok: true,
    name: relative,
    text: text.length > 32000 ? text.slice(0, 32000) : text,
    truncated: text.length > 32000,
  }
}

async function savePrompt(body, options, run) {
  const located = await repoOf(options)
  const relative = promptPath(body.name)
  const text = typeof body.text === 'string' ? body.text : ''
  if (!text.trim() || text.length > 32000 || text.includes('\0')) {
    return fail('invalid', '提示词需要有正文，并且不超过 32000 个字符。')
  }
  await writeContained(located.repo, relative, text.endsWith('\n') ? text : `${text}\n`)
  const published = await publish(located.repo, [relative], `Add team prompt ${relative}`, run, secretsOf(body))
  return { ok: true, message: published.message, name: relative }
}

async function deletePrompt(body, options, run) {
  const located = await repoOf(options)
  const relative = promptPath(body.name)
  await assertRealFile(located.repo, relative)
  await rm(path.join(located.repo, relative))
  const published = await publish(located.repo, [relative], `Remove team prompt ${relative}`, run, secretsOf(body))
  return { ok: true, message: published.message, name: relative }
}

async function saveMcp(body, options, run) {
  const server = mcpServer(body)
  const located = await repoOf(options)
  const relative = 'mcp/mcp.yaml'
  const file = path.join(located.repo, relative)
  const current = await readMcpDoc(file, located.repo)
  const servers = current.filter((item) => item && item.name !== server.name)
  servers.push(server)
  await writeContained(located.repo, relative, YAML.stringify({ servers }))
  const published = await publish(located.repo, [relative], `Update team MCP ${server.name}`, run, secretsOf(body))
  return { ok: true, message: published.message, name: server.name, transport: server.transport }
}

async function deleteMcp(body, options, run) {
  const name = typeof body.name === 'string' ? body.name : ''
  if (!MCP_NAME.test(name)) return fail('invalid', 'MCP 名称不符合格式。')
  const located = await repoOf(options)
  const relative = 'mcp/mcp.yaml'
  const file = path.join(located.repo, relative)
  const current = await readMcpDoc(file, located.repo)
  const servers = current.filter((item) => item && item.name !== name)
  if (servers.length === current.length) return fail('invalid', '仓库的根 mcp.yaml 里没有这个服务器。')
  await writeContained(located.repo, relative, YAML.stringify({ servers }))
  const published = await publish(located.repo, [relative], `Remove team MCP ${name}`, run, secretsOf(body))
  return { ok: true, message: published.message, name }
}

function mcpServer(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const transport = body.transport
  if (!MCP_NAME.test(name) || !['stdio', 'http', 'sse'].includes(transport)) {
    throw invalid('MCP 名称或传输方式不符合格式。')
  }
  const server = { name, transport }
  const description = cleanText(body.description, 240)
  if (body.description && !description) throw invalid('说明里不能带地址或本机路径。')
  if (description) server.description = description
  if (transport === 'stdio') {
    server.command = oneLine(body.command, 300, '命令')
    const args = lines(body.args, 20, 240)
    if (args.length) server.args = args
  } else {
    server.url = httpUrl(body.url)
  }
  const env = pairs(body.env, ENV_KEY, 20)
  const headers = pairs(body.headers, HEADER_NAME, 20)
  if (env) server.env = env
  if (headers) server.headers = headers
  return server
}

async function readMcpDoc(file, repo) {
  const info = await lstat(file).catch(() => null)
  if (!info) return []
  if (info.isSymbolicLink() || !info.isFile()) throw invalid('mcp.yaml 不是普通文件。')
  await assertRealFile(repo, 'mcp/mcp.yaml')
  let data
  try {
    data = YAML.parse(await readFile(file, 'utf8'))
  } catch {
    throw invalid('现有的 mcp.yaml 无法解析，没有覆盖它。')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.servers)) {
    throw invalid('mcp.yaml 没有 servers 列表，没有覆盖它。')
  }
  return data.servers
}

function promptPath(name) {
  const raw = typeof name === 'string' ? name.trim().replace(/^prompts\//, '') : ''
  const parts = raw.split('/')
  if (!raw.endsWith('.md') || parts.length < 1 || parts.length > 3 || parts.some((part) => !SEGMENT.test(part.replace(/\.md$/, '')) || part === '.md')) {
    throw invalid('提示词路径需要是 prompts 下的 Markdown 文件名。')
  }
  return `prompts/${parts.join('/')}`
}

async function repoOf(options) {
  const located = await loadWorkspace(options)
  const localPath = located.workspace && located.workspace.repo && located.workspace.repo.localPath
  if (!localPath) throw invalid('还没有 TeamAI 仓库。先安装并初始化。')
  const repo = await realContained(localPath)
  return { ...located, repo }
}

async function realContained(file) {
  const info = await lstat(file).catch(() => null)
  if (!info || info.isSymbolicLink()) throw invalid('团队仓库路径不可用。')
  return path.resolve(file)
}

async function assertRealFile(repo, relative) {
  const full = contained(repo, relative)
  let current = repo
  for (const part of relative.split('/')) {
    current = path.join(current, part)
    const info = await lstat(current).catch(() => null)
    if (!info || info.isSymbolicLink()) throw invalid('文件不存在，或者路径里有符号链接。')
  }
  if (!(await lstat(full)).isFile()) throw invalid('这不是普通文件。')
}

async function writeContained(repo, relative, text) {
  const full = contained(repo, relative)
  const parent = path.dirname(full)
  await ensureDir(repo, path.relative(repo, parent).split(path.sep).join('/'))
  const existing = await lstat(full).catch(() => null)
  if (existing && (existing.isSymbolicLink() || !existing.isFile())) throw invalid('目标不是普通文件。')
  await writeFile(full, text, { mode: 0o644 })
}

async function ensureDir(repo, relative) {
  if (!relative || relative === '.') return
  const parts = relative.split('/').filter(Boolean)
  let current = repo
  for (const part of parts) {
    if (!SEGMENT.test(part)) throw invalid('目录名不符合格式。')
    current = path.join(current, part)
    const info = await lstat(current).catch(() => null)
    if (!info) {
      await mkdir(current)
      continue
    }
    if (info.isSymbolicLink() || !info.isDirectory()) throw invalid('目录不可用。')
  }
}

function contained(repo, relative) {
  const full = path.resolve(repo, relative)
  const prefix = repo.endsWith(path.sep) ? repo : repo + path.sep
  if (full !== repo && !full.startsWith(prefix)) throw invalid('路径超出了团队仓库。')
  return full
}

async function publish(repo, paths, message, run, secrets = []) {
  const env = commandEnv()
  const added = await run('git', ['-C', repo, 'add', '--', ...paths], { timeout: 20000, env })
  if (added.code !== 0) return { message: '已写入团队仓库的本地副本，但没有暂存成功。' + tail(added, secrets) }
  const quiet = await run('git', ['-C', repo, 'diff', '--cached', '--quiet', '--', ...paths], { timeout: 20000, env })
  if (quiet.code === 0) return { message: '本地副本和上次提交一样，没有新的提交。' }
  const committed = await run('git', ['-C', repo, 'commit', '-m', message, '--', ...paths], { timeout: 20000, env })
  if (committed.code !== 0) return { message: '已写入本地副本，提交没有完成。' + tail(committed, secrets) }
  const pushed = await run('git', ['-C', repo, 'push', 'origin', 'HEAD'], { timeout: 60000, env })
  if (pushed.code !== 0) return { message: '已在本地提交，推送到远端没有完成。' + tail(pushed, secrets) }
  return { message: '已提交并推送到团队仓库的当前分支。' }
}

async function runTeamai(options, run, args, success, secrets = []) {
  const located = await loadWorkspace(options)
  const cwd = located.workspace && located.workspace.scope === 'project' && located.workspace.projectRoot
    ? located.workspace.projectRoot
    : located.home
  const result = await run('teamai', args, { timeout: 180000, cwd, env: commandEnv() })
  if (result.code !== 0) return fail('failed', 'teamai 没有完成。' + tail(result, secrets))
  return { ok: true, message: success }
}

function commandEnv() {
  return {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
    NPM_CONFIG_FUND: 'false',
    NPM_CONFIG_AUDIT: 'false',
  }
}

function execFileAsync(command, args, options = {}) {
  return new Promise((resolve) => {
    execFile(command, args, {
      timeout: options.timeout ?? 20000,
      cwd: options.cwd,
      env: options.env ?? commandEnv(),
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      resolve({
        code: error ? (typeof error.code === 'number' ? error.code : 127) : 0,
        stdout: stdout ? String(stdout) : '',
        stderr: stderr ? String(stderr) : '',
      })
    })
  })
}

function lines(value, max, length) {
  if (value === undefined || value === '') return []
  const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\r?\n/) : null
  if (!source) throw invalid('列表格式不对。')
  const items = source.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)
  if (items.length > max || items.some((item) => item.length > length || item.includes('\0'))) throw invalid('列表里有过长的一项。')
  return items
}

function pairs(value, keyPattern, max) {
  if (value === undefined || value === '') return null
  const entries = []
  if (typeof value === 'string') {
    for (const line of value.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const eq = trimmed.indexOf('=')
      if (eq < 1) throw invalid('需要用 KEY=value 这样的一行。')
      entries.push([trimmed.slice(0, eq).trim(), trimmed.slice(eq + 1)])
    }
  } else if (value && typeof value === 'object' && !Array.isArray(value)) {
    entries.push(...Object.entries(value))
  } else {
    throw invalid('键值格式不对。')
  }
  if (entries.length > max) throw invalid('键太多。')
  const out = {}
  for (const [key, raw] of entries) {
    if (!keyPattern.test(key) || typeof raw !== 'string' || raw.length > 500 || raw.includes('\0') || raw.includes('\n')) {
      throw invalid('有一个键或值不符合格式。')
    }
    out[key] = raw
  }
  return Object.keys(out).length ? out : null
}

function oneLine(value, max, label) {
  if (typeof value !== 'string') throw invalid(`${label}缺失。`)
  const text = value.trim()
  if (!text || text.length > max || /[\r\n\0]/.test(text)) throw invalid(`${label}不符合格式。`)
  return text
}

function httpUrl(value) {
  if (typeof value !== 'string') throw invalid('地址缺失。')
  let url
  try {
    url = new URL(value.trim())
  } catch {
    throw invalid('地址不是 URL。')
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password || url.search || url.hash) {
    throw invalid('地址只能是不带账号、查询参数或片段的 http(s) URL。')
  }
  return url.toString()
}

function cleanText(value, max) {
  if (value === undefined || value === '') return ''
  if (typeof value !== 'string') throw invalid('说明格式不对。')
  const text = value.replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (text.length > max || /\/Users\/|\/home\/|~\/|[A-Za-z]:\\|:\/\/|\0/.test(text)) return ''
  return text
}

function secretsOf(body) {
  const found = []
  const add = (value) => {
    if (typeof value === 'string' && value.length >= 4) found.push(value)
  }
  if (!body || typeof body !== 'object') return found
  add(body.command)
  add(body.url)
  add(body.text)
  if (typeof body.args === 'string') {
    for (const line of body.args.split(/\r?\n/)) add(line.trim())
  } else if (Array.isArray(body.args)) {
    for (const item of body.args) add(item)
  }
  collectPairSecrets(body.env, add)
  collectPairSecrets(body.headers, add)
  return found
}

function collectPairSecrets(value, add) {
  if (typeof value === 'string') {
    for (const line of value.split(/\r?\n/)) {
      const eq = line.indexOf('=')
      if (eq > 0) add(line.slice(eq + 1).trim())
    }
    return
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) add(item)
  }
}

function tail(result, secrets = []) {
  const text = publicLog(`${result.stderr || ''}\n${result.stdout || ''}`, secrets).trim()
  return text ? ` ${text}` : ''
}

function publicLog(text, secrets = []) {
  let out = String(text || '')
  for (const secret of secrets) {
    if (typeof secret === 'string' && secret.length >= 4) out = out.split(secret).join('[已隐藏]')
  }
  return out
    .replace(/\/private\/var\/[^\s'"]+/g, '~')
    .replace(/\/Users\/[^\s'"]+/g, '~')
    .replace(/\/home\/[^\s'"]+/g, '~')
    .replace(/https?:\/\/[^\s'"]+/g, '[地址]')
    .slice(0, 1200)
}

function invalid(message) {
  const error = new Error(message)
  error.code = 'invalid'
  return error
}

function fail(code, message) {
  return { ok: false, code, message: publicLog(message).slice(0, 500) }
}
